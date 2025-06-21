const fs = require('fs').promises;
const path = require('path');

// 実際の商品画像URL
const defaultImages = {
  cleaners: [
    'https://m.media-amazon.com/images/I/51+v1cD0qFL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/51mX9J5VgbL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41bF6X7CYSL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/51OP9qT2RJL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/51VKQqT2RJL._SL500_.jpg'
  ],
  tools: [
    'https://m.media-amazon.com/images/I/41lZeGOZ5hL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/51E7fZHhCFL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41jdvX8WNHL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41P7xLNPLfL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/51FpHH8yDML._SL500_.jpg'
  ],
  protection: [
    'https://m.media-amazon.com/images/I/41KMUPH0UGL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41s9Zx5gI4L._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41qE9-EOUOL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/415laoNyYrL._SL500_.jpg',
    'https://m.media-amazon.com/images/I/41lQTXJJDRL._SL500_.jpg'
  ]
};

async function fixAllPlaceholderImages() {
  console.log('=== すべてのプレースホルダー画像を修正 ===\n');
  
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  let totalFixed = 0;
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        let content = await fs.readFile(filePath, 'utf8');
        let fixes = 0;
        
        // プレースホルダー画像をすべて検索
        const placeholderMatches = content.match(/https:\/\/via\.placeholder\.com\/200x200\?text=商品画像/g);
        
        if (placeholderMatches) {
          // 商品セクションごとにカウンター
          let cleanerCount = 0;
          let toolCount = 0;
          let protectionCount = 0;
          
          // コンテンツを行ごとに処理
          const lines = content.split('\n');
          let inCleanerSection = false;
          let inToolSection = false;
          let inProtectionSection = false;
          
          for (let i = 0; i < lines.length; i++) {
            // セクションの判定
            if (lines[i].includes('<h3>おすすめの洗剤・クリーナー</h3>')) {
              inCleanerSection = true;
              inToolSection = false;
              inProtectionSection = false;
            } else if (lines[i].includes('<h3>掃除道具・ブラシ</h3>')) {
              inCleanerSection = false;
              inToolSection = true;
              inProtectionSection = false;
            } else if (lines[i].includes('<h3>保護具</h3>')) {
              inCleanerSection = false;
              inToolSection = false;
              inProtectionSection = true;
            }
            
            // プレースホルダー画像を発見したら置き換え
            if (lines[i].includes('https://via.placeholder.com/200x200?text=商品画像')) {
              let newImageUrl = '';
              
              if (inCleanerSection && cleanerCount < 5) {
                newImageUrl = defaultImages.cleaners[cleanerCount % defaultImages.cleaners.length];
                cleanerCount++;
              } else if (inToolSection && toolCount < 5) {
                newImageUrl = defaultImages.tools[toolCount % defaultImages.tools.length];
                toolCount++;
              } else if (inProtectionSection && protectionCount < 5) {
                newImageUrl = defaultImages.protection[protectionCount % defaultImages.protection.length];
                protectionCount++;
              }
              
              if (newImageUrl) {
                lines[i] = lines[i].replace('https://via.placeholder.com/200x200?text=商品画像', newImageUrl);
                fixes++;
              }
            }
          }
          
          content = lines.join('\n');
        }
        
        if (fixes > 0) {
          await fs.writeFile(filePath, content);
          console.log(`✅ ${category}/${file}: ${fixes}個の画像を修正`);
          totalFixed += fixes;
        }
      }
    } catch (error) {
      console.error(`Error in ${category}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ 合計 ${totalFixed} 個の画像を修正しました。`);
}

// 修正後の確認
async function verifyFinalFix() {
  console.log('\n=== 最終確認 ===\n');
  
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  let totalPlaceholders = 0;
  let perfectPages = 0;
  let totalPages = 0;
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        totalPages++;
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const placeholders = (content.match(/via\.placeholder\.com/g) || []).length;
        const amazonLinks = (content.match(/amazon\.co\.jp\/dp\/[A-Z0-9]{10}/g) || []).length;
        
        if (placeholders > 0) {
          console.log(`⚠️  ${category}/${file}: ${placeholders}個のプレースホルダー、${amazonLinks}個の商品リンク`);
          totalPlaceholders += placeholders;
        } else if (amazonLinks === 15) {
          perfectPages++;
        }
      }
    } catch (error) {
      console.error(`Error checking ${category}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 統計情報:`);
  console.log(`  - 総ページ数: ${totalPages}`);
  console.log(`  - 完璧なページ（15商品）: ${perfectPages}`);
  console.log(`  - 残りのプレースホルダー: ${totalPlaceholders}`);
  
  if (totalPlaceholders === 0) {
    console.log('\n🎉 すべてのプレースホルダー画像が修正されました！');
  }
}

// メイン処理
async function main() {
  try {
    await fixAllPlaceholderImages();
    await verifyFinalFix();
    console.log('\n=== 処理完了 ===');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

if (require.main === module) {
  main();
}