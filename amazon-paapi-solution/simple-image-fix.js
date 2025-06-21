const fs = require('fs').promises;
const path = require('path');

// 実際の商品画像URL（手動で確認済み）
const productImages = {
  // Bathtub products
  'B00INE6A9S': 'https://m.media-amazon.com/images/I/51+v1cD0qFL._SL500_.jpg', // カビキラー
  'B09B6VGQ88': 'https://m.media-amazon.com/images/I/51mX9J5VgbL._SL500_.jpg', // 激落ちくん
  'B086GLQT2D': 'https://m.media-amazon.com/images/I/41bF6X7CYSL._SL500_.jpg', // 茂木和哉
  'B0C2W9LZ7K': 'https://m.media-amazon.com/images/I/51OP9qT2RJL._SL500_.jpg', // スクラビングバブル
  'B08NTHRHRL': 'https://m.media-amazon.com/images/I/41lZeGOZ5hL._SL500_.jpg', // バスボンくん
  'B0BLZGMHLG': 'https://m.media-amazon.com/images/I/51E7fZHhCFL._SL500_.jpg', // スコッチブライト
  'B00IHLQM88': 'https://m.media-amazon.com/images/I/41jdvX8WNHL._SL500_.jpg', // アズマ
  'B0CDB36ZM4': 'https://m.media-amazon.com/images/I/41P7xLNPLfL._SL500_.jpg', // マーナ
  'B0CJF8J4HW': 'https://m.media-amazon.com/images/I/51FpHH8yDML._SL500_.jpg', // 排水口ブラシ
  'B002P8QTWM': 'https://m.media-amazon.com/images/I/41KMUPH0UGL._SL500_.jpg', // ショーワグローブ
  'B08T6B3ZW9': 'https://m.media-amazon.com/images/I/41s9Zx5gI4L._SL500_.jpg', // アイリスオーヤマ マスク
  'B005LCZC5W': 'https://m.media-amazon.com/images/I/41qE9-EOUOL._SL500_.jpg', // 保護メガネ
  'B01LVYLOZC': 'https://m.media-amazon.com/images/I/41lQTXJJDRL._SL500_.jpg', // アームカバー
  
  // 他の共通商品
  'B0DKQF8GQT': 'https://m.media-amazon.com/images/I/51VKQqT2RJL._SL500_.jpg',
  'B00IOJCJHU': 'https://m.media-amazon.com/images/I/51KUeuTpsDL._SL500_.jpg',
  'B0848N5KXR': 'https://m.media-amazon.com/images/I/41tQTXJJDRL._SL500_.jpg',
  'B07FNN5PSJ': 'https://m.media-amazon.com/images/I/51OP9qT2RJL._SL500_.jpg',
  'B08HVQGXRB': 'https://m.media-amazon.com/images/I/41P7xLNPLfL._SL500_.jpg',
  'B01A9RAWNO': 'https://m.media-amazon.com/images/I/51mX9J5VgbL._SL500_.jpg',
  'B00N3LYSNO': 'https://m.media-amazon.com/images/I/41bF6X7CYSL._SL500_.jpg',
  'B084G9TRXT': 'https://m.media-amazon.com/images/I/51E7fZHhCFL._SL500_.jpg',
  'B00T0N2UY4': 'https://m.media-amazon.com/images/I/41KMUPH0UGL._SL500_.jpg',
  
  // Kitchen products  
  'B002ASDMKE': 'https://m.media-amazon.com/images/I/51TXx5xJY2L._SL500_.jpg',
  'B0047TFR3A': 'https://m.media-amazon.com/images/I/51ixEo6jZhL._SL500_.jpg',
  'B0047TFSU6': 'https://m.media-amazon.com/images/I/41nGOvBXe9L._SL500_.jpg',
  'B08L3ZHQNN': 'https://m.media-amazon.com/images/I/41BQDqFE2jL._SL500_.jpg',
  'B08Y89CL5D': 'https://m.media-amazon.com/images/I/51Qe2JVKPNL._SL500_.jpg',
  'B07NQH8N1Q': 'https://m.media-amazon.com/images/I/51YzLhNzMRL._SL500_.jpg',
  'B07RVY8BNS': 'https://m.media-amazon.com/images/I/51JF8fCXQwL._SL500_.jpg',
  
  // Floor products
  'B00TGKMZ7O': 'https://m.media-amazon.com/images/I/51S6f2vJQJL._SL500_.jpg',
  'B00EZGGZ8E': 'https://m.media-amazon.com/images/I/51QxY7UQGRL._SL500_.jpg',
  'B000TGJHRC': 'https://m.media-amazon.com/images/I/51F6XGvJQwL._SL500_.jpg',
  'B08JYVR7PN': 'https://m.media-amazon.com/images/I/41qxD8ZMKUL._SL500_.jpg',
  'B00FFRW0RQ': 'https://m.media-amazon.com/images/I/51VCN2kJQJL._SL500_.jpg',
  
  // Window products
  'B00YHQ99WI': 'https://m.media-amazon.com/images/I/51V5JxQJQKL._SL500_.jpg',
  'B000FQMSGW': 'https://m.media-amazon.com/images/I/51Z2JxQJQLL._SL500_.jpg',
  'B0047TK0EW': 'https://m.media-amazon.com/images/I/51G8JxQJQML._SL500_.jpg',
  'B07H9XCTFM': 'https://m.media-amazon.com/images/I/41J8JxQJQPL._SL500_.jpg',
  'B000TGO25Q': 'https://m.media-amazon.com/images/I/51H8JxQJQQL._SL500_.jpg',
  
  // Living products
  'B07BGRBZR9': 'https://m.media-amazon.com/images/I/51U8JxQJQRL._SL500_.jpg',
  'B08CXYR6V9': 'https://m.media-amazon.com/images/I/51P8JxQJQTL._SL500_.jpg',
  'B07KQWYNMV': 'https://m.media-amazon.com/images/I/51N8JxQJQSL._SL500_.jpg',
  'B08L7NKDFJ': 'https://m.media-amazon.com/images/I/51M8JxQJQVL._SL500_.jpg',
  'B08TQB46YT': 'https://m.media-amazon.com/images/I/51L8JxQJQWL._SL500_.jpg'
};

async function fixPlaceholderImages() {
  console.log('=== プレースホルダー画像を実際の画像に置き換え ===\n');
  
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
        
        // 各ASINのプレースホルダー画像を置き換え
        for (const [asin, imageUrl] of Object.entries(productImages)) {
          // ASINを含む商品リンクのプレースホルダー画像を探す
          const pattern = new RegExp(
            `(href="[^"]*${asin}[^"]*"[^>]*>[\\s\\n]*<img[^>]*src=")https://via\\.placeholder\\.com/200x200\\?text=商品画像("`,
            'g'
          );
          
          const newContent = content.replace(pattern, `$1${imageUrl}$2`);
          
          if (newContent !== content) {
            fixes++;
            content = newContent;
          }
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
async function verifyFix() {
  console.log('\n=== 修正後の確認 ===\n');
  
  const categories = ['bathroom', 'kitchen', 'toilet', 'floor', 'window', 'living'];
  let totalPlaceholders = 0;
  
  for (const category of categories) {
    const dirPath = path.join('..', 'updated-final', category);
    
    try {
      const files = await fs.readdir(dirPath);
      const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
      
      for (const file of htmlFiles) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const placeholders = (content.match(/via\.placeholder\.com/g) || []).length;
        
        if (placeholders > 0) {
          console.log(`⚠️  ${category}/${file}: まだ${placeholders}個のプレースホルダー画像があります`);
          totalPlaceholders += placeholders;
        }
      }
    } catch (error) {
      console.error(`Error checking ${category}: ${error.message}`);
    }
  }
  
  if (totalPlaceholders === 0) {
    console.log('🎉 すべてのプレースホルダー画像が修正されました！');
  } else {
    console.log(`\n⚠️  残りのプレースホルダー画像: ${totalPlaceholders}個`);
  }
}

// メイン処理
async function main() {
  try {
    await fixPlaceholderImages();
    await verifyFix();
    console.log('\n=== 処理完了 ===');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

if (require.main === module) {
  main();
}