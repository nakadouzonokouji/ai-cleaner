const fs = require('fs').promises;
const path = require('path');
const { processAsinsInBatches } = require('./paapi-sdk');

async function getMissingASINs() {
  console.log('=== 不足している商品ASINの特定 ===\n');
  
  // product-info.jsonから既存のASINを取得
  const productInfoPath = path.join('..', 'updated-final', 'product-info.json');
  const productInfo = JSON.parse(await fs.readFile(productInfoPath, 'utf8'));
  const existingASINs = new Set(Object.keys(productInfo.products));
  
  // HTMLファイルから全ASINを抽出
  const htmlASINs = new Set();
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const content = await fs.readFile(path.join(dirPath, file), 'utf8');
        const asins = content.match(/B[0-9A-Z]{9}/g) || [];
        asins.forEach(asin => htmlASINs.add(asin));
      }
    } catch (error) {
      console.error(`Error reading ${category}: ${error.message}`);
    }
  }
  
  // 不足しているASINを特定
  const missingASINs = Array.from(htmlASINs).filter(asin => !existingASINs.has(asin));
  
  console.log(`HTMLファイルで使用されているASIN総数: ${htmlASINs.size}`);
  console.log(`product-info.jsonに存在するASIN数: ${existingASINs.size}`);
  console.log(`不足しているASIN数: ${missingASINs.length}\n`);
  
  return missingASINs;
}

async function fetchMissingProducts() {
  const missingASINs = await getMissingASINs();
  
  if (missingASINs.length === 0) {
    console.log('すべての商品情報が揃っています。');
    return;
  }
  
  console.log('不足しているASIN:');
  missingASINs.forEach(asin => console.log(`  - ${asin}`));
  console.log('\n=== PA-API経由で不足している商品情報を取得 ===\n');
  
  // バッチ処理で商品情報を取得
  const batchSize = 10;
  const allProductInfo = {};
  
  for (let i = 0; i < missingASINs.length; i += batchSize) {
    const batch = missingASINs.slice(i, i + batchSize);
    console.log(`\nバッチ ${Math.floor(i/batchSize) + 1}/${Math.ceil(missingASINs.length/batchSize)}: ${batch.join(', ')}`);
    
    try {
      const productInfo = await processAsinsInBatches(batch);
      Object.assign(allProductInfo, productInfo);
      console.log(`✅ ${Object.keys(productInfo).length}個の商品情報を取得`);
      
      // レート制限対策
      if (i + batchSize < missingASINs.length) {
        console.log('2秒待機中...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ エラー: ${error.message}`);
    }
  }
  
  // 既存のproduct-info.jsonを更新
  const productInfoPath = path.join('..', 'updated-final', 'product-info.json');
  const existingProductInfo = JSON.parse(await fs.readFile(productInfoPath, 'utf8'));
  
  // 新しい商品情報を追加
  Object.assign(existingProductInfo.products, allProductInfo);
  existingProductInfo.totalProducts = Object.keys(existingProductInfo.products).length;
  existingProductInfo.timestamp = new Date().toISOString();
  
  // ファイルを保存
  await fs.writeFile(productInfoPath, JSON.stringify(existingProductInfo, null, 2));
  console.log(`\n✅ product-info.jsonを更新しました。総商品数: ${existingProductInfo.totalProducts}`);
  
  return allProductInfo;
}

async function updateHTMLWithNewProducts(productInfo) {
  if (!productInfo || Object.keys(productInfo).length === 0) {
    console.log('\n更新する商品情報がありません。');
    return;
  }
  
  console.log('\n=== HTMLファイルの画像URLを更新 ===\n');
  
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  let totalUpdates = 0;
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        let content = await fs.readFile(filePath, 'utf8');
        let updates = 0;
        
        // 各ASINについて画像URLを更新
        for (const [asin, images] of Object.entries(productInfo)) {
          const placeholderRegex = new RegExp(
            `(href="[^"]*${asin}[^"]*"[^>]*>\\s*<img\\s+src=")https://via\\.placeholder\\.com/200x200\\?text=商品画像("`,
            'g'
          );
          
          if (content.includes(asin) && content.includes('via.placeholder.com')) {
            const newContent = content.replace(placeholderRegex, `$1${images.large}$2`);
            if (newContent !== content) {
              content = newContent;
              updates++;
            }
          }
        }
        
        if (updates > 0) {
          await fs.writeFile(filePath, content);
          console.log(`✅ ${category}/${file}: ${updates}個の画像URLを更新`);
          totalUpdates += updates;
        }
      }
    } catch (error) {
      console.error(`Error updating ${category}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ 合計 ${totalUpdates} 個の画像URLを更新しました。`);
}

// メイン処理
async function main() {
  try {
    // 1. 不足している商品情報を取得
    const newProductInfo = await fetchMissingProducts();
    
    // 2. HTMLファイルを更新
    await updateHTMLWithNewProducts(newProductInfo);
    
    console.log('\n=== 処理完了 ===');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

if (require.main === module) {
  main();
}