const fs = require('fs').promises;
const path = require('path');
const { recommendedProducts, getASINsByCategory } = require('./product-selector');
const { processAsinsInBatches } = require('./paapi-sdk');

// HTMLから現在の商品情報を抽出
function extractProductsFromHTML(html) {
  const products = [];
  const productRegex = /<div class="product-card"[^>]*>[\s\S]*?<\/div>/g;
  let match;
  
  while ((match = productRegex.exec(html)) !== null) {
    const productHtml = match[0];
    
    // ASINを抽出
    const asinMatch = productHtml.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : null;
    
    // 商品名を抽出
    const nameMatch = productHtml.match(/<h4[^>]*>(.*?)<\/h4>/);
    const name = nameMatch ? nameMatch[1] : '';
    
    // カテゴリーを推測（商品名から）
    let category = 'other';
    if (name.includes('洗剤') || name.includes('クリーナー')) category = 'cleaner';
    else if (name.includes('ブラシ')) category = 'brush';
    else if (name.includes('スポンジ')) category = 'sponge';
    else if (name.includes('手袋')) category = 'gloves';
    else if (name.includes('マスク')) category = 'mask';
    
    if (asin) {
      products.push({ asin, name, category, html: productHtml });
    }
  }
  
  return products;
}

// 商品HTMLを生成
function generateProductHTML(product, productInfo) {
  const info = productInfo[product.asin] || {};
  const imageUrl = info.large || info.medium || info.small || 'https://via.placeholder.com/200x200?text=商品画像';
  
  return `    <div class="product-card">
        <a href="https://www.amazon.co.jp/dp/${product.asin}?tag=asdfghj12-22" 
           target="_blank" 
           rel="nofollow noopener noreferrer" 
           class="product-link">
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
            <h4>${product.name}</h4>
            <div class="product-rating">
                <span class="stars">★${product.rating || '4.0'}</span>
                <span class="review-count">(${product.reviews || '0'})</span>
            </div>
            <div class="cta-button">
                <i class="icon">🛒</i>
                Amazonで購入
            </div>
        </a>
    </div>`;
}

// HTMLファイルの商品を更新
async function updateProductsInHTML(htmlFile, category) {
  try {
    console.log(`\nProcessing ${htmlFile}...`);
    const html = await fs.readFile(htmlFile, 'utf8');
    
    // カテゴリーから推奨商品を取得
    const recommendedProductsList = recommendedProducts[category];
    if (!recommendedProductsList) {
      console.log(`No recommendations for category: ${category}`);
      return false;
    }
    
    // すべての推奨商品を収集
    const allRecommended = [];
    for (const subcat in recommendedProductsList) {
      if (Array.isArray(recommendedProductsList[subcat])) {
        allRecommended.push(...recommendedProductsList[subcat]);
      }
    }
    
    if (allRecommended.length === 0) {
      console.log(`No products found for category: ${category}`);
      return false;
    }
    
    // 推奨商品のASINリスト
    const asins = allRecommended.map(p => p.asin);
    console.log(`Found ${asins.length} recommended products for ${category}`);
    
    // PA-APIから商品情報を取得
    console.log('Fetching product information from PA-API...');
    const productInfo = await processAsinsInBatches(asins, 10, 2000);
    console.log(`Retrieved info for ${Object.keys(productInfo).length} products`);
    
    // 商品セクションごとに更新
    let updatedHTML = html;
    
    // 洗剤セクション
    if (recommendedProductsList.cleaners) {
      const cleanerProducts = recommendedProductsList.cleaners.slice(0, 5);
      const cleanerHTML = cleanerProducts.map(p => generateProductHTML(p, productInfo)).join('\n');
      
      // 洗剤セクションを置換
      const cleanerSectionRegex = /(<h3[^>]*>.*?洗剤.*?<\/h3>[\s\S]*?<div class="product-grid[^>]*>)([\s\S]*?)(<\/div>)/;
      updatedHTML = updatedHTML.replace(cleanerSectionRegex, `$1\n${cleanerHTML}\n$3`);
    }
    
    // 道具セクション
    if (recommendedProductsList.tools) {
      const toolProducts = recommendedProductsList.tools.slice(0, 5);
      const toolHTML = toolProducts.map(p => generateProductHTML(p, productInfo)).join('\n');
      
      // 道具セクションを置換
      const toolSectionRegex = /(<h3[^>]*>.*?道具.*?<\/h3>[\s\S]*?<div class="product-grid[^>]*>)([\s\S]*?)(<\/div>)/;
      updatedHTML = updatedHTML.replace(toolSectionRegex, `$1\n${toolHTML}\n$3`);
    }
    
    // 保護具セクション
    if (recommendedProductsList.protective) {
      const protectiveProducts = recommendedProductsList.protective.slice(0, 5);
      const protectiveHTML = protectiveProducts.map(p => generateProductHTML(p, productInfo)).join('\n');
      
      // 保護具セクションを置換
      const protectiveSectionRegex = /(<h3[^>]*>.*?保護.*?<\/h3>[\s\S]*?<div class="product-grid[^>]*>)([\s\S]*?)(<\/div>)/;
      updatedHTML = updatedHTML.replace(protectiveSectionRegex, `$1\n${protectiveHTML}\n$3`);
    }
    
    // IHクリーナーセクション（キッチンのみ）
    if (category === 'kitchen' && recommendedProductsList.ih_cleaners) {
      const ihProducts = recommendedProductsList.ih_cleaners.slice(0, 5);
      const ihHTML = ihProducts.map(p => generateProductHTML(p, productInfo)).join('\n');
      
      // IHクリーナーセクションを置換
      const ihSectionRegex = /(<h3[^>]*>.*?IH.*?<\/h3>[\s\S]*?<div class="product-grid[^>]*>)([\s\S]*?)(<\/div>)/;
      if (ihSectionRegex.test(updatedHTML)) {
        updatedHTML = updatedHTML.replace(ihSectionRegex, `$1\n${ihHTML}\n$3`);
      }
    }
    
    // ファイルを保存
    await fs.writeFile(htmlFile, updatedHTML, 'utf8');
    console.log(`✓ Updated ${htmlFile}`);
    
    return true;
  } catch (error) {
    console.error(`Error updating ${htmlFile}:`, error.message);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('=== Product Update Process Started ===\n');
  
  // バックアップディレクトリを作成
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('..', `backup-before-product-update-${timestamp}`);
  const sourceDir = path.join('..', 'updated-all-pages-clean');
  const targetDir = path.join('..', 'updated-final');
  
  try {
    // バックアップを作成
    console.log('Creating backup...');
    await fs.mkdir(backupDir, { recursive: true });
    
    // ソースディレクトリをターゲットディレクトリにコピー
    console.log('Preparing target directory...');
    await fs.cp(sourceDir, targetDir, { recursive: true });
    await fs.cp(sourceDir, backupDir, { recursive: true });
    console.log(`✓ Backup created at ${backupDir}`);
    
    const categories = [
      { name: 'bathroom', dir: 'bathroom' },
      { name: 'kitchen', dir: 'kitchen' },
      { name: 'toilet', dir: 'toilet' },
      { name: 'floor', dir: 'floor' },
      { name: 'window', dir: 'window' },
      { name: 'living', dir: 'living' }
    ];
    
    let totalUpdated = 0;
    
    for (const { name, dir } of categories) {
      console.log(`\n=== Processing ${name} category ===`);
      const categoryDir = path.join(targetDir, dir);
      
      try {
        const files = await fs.readdir(categoryDir);
        const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
        
        console.log(`Found ${htmlFiles.length} HTML files in ${dir}`);
        
        for (const file of htmlFiles) {
          const filePath = path.join(categoryDir, file);
          const updated = await updateProductsInHTML(filePath, name);
          if (updated) totalUpdated++;
          
          // レート制限対策
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log(`Skipping ${name}: ${error.message}`);
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total files updated: ${totalUpdated}`);
    console.log(`Output directory: ${targetDir}`);
    console.log(`Backup directory: ${backupDir}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// コマンドライン実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateProductsInHTML, extractProductsFromHTML, generateProductHTML };