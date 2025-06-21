const fs = require('fs').promises;
const path = require('path');

async function analyzeHTMLStructure() {
  const report = {
    totalPages: 0,
    totalProducts: 0,
    pageDetails: {},
    missingProducts: [],
    summary: {
      bathroom: { pages: 0, products: 0 },
      kitchen: { pages: 0, products: 0 },
      toilet: { pages: 0, products: 0 },
      floor: { pages: 0, products: 0 },
      window: { pages: 0, products: 0 },
      living: { pages: 0, products: 0 }
    }
  };

  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-all-pages-clean', category);
    
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Amazon商品リンクをカウント
        const amazonLinks = (content.match(/amazon\.co\.jp\/dp\/[A-Z0-9]{10}/g) || []).length;
        
        // 商品カードをカウント
        const productCards = (content.match(/<div class="product-card">/g) || []).length;
        
        // より正確な商品数
        const productCount = Math.max(amazonLinks, productCards);
        
        report.pageDetails[`${category}/${file}`] = {
          currentProducts: productCount,
          requiredProducts: 15,
          shortage: Math.max(0, 15 - productCount)
        };
        
        report.totalPages++;
        report.totalProducts += productCount;
        report.summary[category].pages++;
        report.summary[category].products += productCount;
        
        if (productCount < 15) {
          report.missingProducts.push({
            file: `${category}/${file}`,
            current: productCount,
            needed: 15 - productCount
          });
        }
      }
    } catch (error) {
      console.log(`Skipping ${category}: ${error.message}`);
    }
  }
  
  // レポート出力
  console.log('=== AI掃除アドバイザー商品分析レポート ===');
  console.log(`分析日時: ${new Date().toLocaleString('ja-JP')}\n`);
  
  console.log('【総合統計】');
  console.log(`総ページ数: ${report.totalPages}ページ`);
  console.log(`現在の総商品数: ${report.totalProducts}個`);
  console.log(`必要な総商品数: ${report.totalPages * 15}個`);
  console.log(`不足商品数: ${(report.totalPages * 15) - report.totalProducts}個\n`);
  
  console.log('【カテゴリー別統計】');
  Object.entries(report.summary).forEach(([category, data]) => {
    console.log(`${category}: ${data.pages}ページ / ${data.products}商品 (平均${Math.round(data.products/data.pages || 0)}商品/ページ)`);
  });
  
  console.log('\n【商品不足ページ】');
  if (report.missingProducts.length === 0) {
    console.log('すべてのページが15商品を満たしています！');
  } else {
    report.missingProducts.forEach(p => {
      console.log(`  ${p.file}: 現在${p.current}個 → あと${p.needed}個必要`);
    });
  }
  
  // 詳細レポートをJSONファイルに保存
  await fs.writeFile('product-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n詳細レポートを product-analysis-report.json に保存しました。');
  
  return report;
}

// カテゴリー別の推奨商品数を計算
function calculateRecommendations(report) {
  console.log('\n【推奨事項】');
  
  Object.entries(report.summary).forEach(([category, data]) => {
    const totalNeeded = data.pages * 15;
    const currentProducts = data.products;
    const shortage = totalNeeded - currentProducts;
    
    if (shortage > 0) {
      console.log(`${category}カテゴリー:`);
      console.log(`  - ${shortage}個の商品追加が必要`);
      console.log(`  - 洗剤: ${Math.ceil(shortage * 5/15)}個追加`);
      console.log(`  - ツール: ${Math.ceil(shortage * 5/15)}個追加`);
      console.log(`  - 保護具: ${Math.ceil(shortage * 5/15)}個追加`);
    }
  });
}

// 実行
if (require.main === module) {
  analyzeHTMLStructure().then(report => {
    calculateRecommendations(report);
  }).catch(console.error);
}

module.exports = { analyzeHTMLStructure };