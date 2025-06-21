const fs = require('fs').promises;
const path = require('path');

async function verifyFinalState() {
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  let totalPages = 0;
  let totalProducts = 0;
  let perfectPages = 0;
  const issues = [];
  
  console.log('=== 最終検証レポート ===\n');
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    let categoryPages = 0;
    let categoryProducts = 0;
    
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Amazon商品リンクをカウント
        const amazonLinks = (content.match(/amazon\.co\.jp\/dp\/[A-Z0-9]{10}/g) || []).length;
        
        totalPages++;
        categoryPages++;
        totalProducts += amazonLinks;
        categoryProducts += amazonLinks;
        
        if (amazonLinks === 15) {
          perfectPages++;
        } else {
          issues.push(`${category}/${file}: ${amazonLinks}個 (${15 - amazonLinks}個不足)`);
        }
      }
      
      console.log(`${category}: ${categoryPages}ページ / ${categoryProducts}商品 (平均${Math.round(categoryProducts/categoryPages)}商品/ページ)`);
      
    } catch (error) {
      console.log(`${category}: エラー - ${error.message}`);
    }
  }
  
  console.log('\n【総合結果】');
  console.log(`✅ 総ページ数: ${totalPages}ページ`);
  console.log(`✅ 総商品数: ${totalProducts}個`);
  console.log(`✅ 必要商品数: ${totalPages * 15}個`);
  console.log(`✅ 15商品完備ページ: ${perfectPages}/${totalPages} (${Math.round(perfectPages/totalPages * 100)}%)`);
  
  if (issues.length > 0) {
    console.log('\n【要修正ページ】');
    issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
  } else {
    console.log('\n🎉 すべてのページが15商品を完備しています！');
  }
  
  console.log(`\n目標達成率: ${Math.round(totalProducts / (totalPages * 15) * 100)}%`);
}

if (require.main === module) {
  verifyFinalState();
}