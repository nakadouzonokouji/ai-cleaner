const fs = require('fs').promises;
const path = require('path');
const { productDatabase } = require('./product-database');
const { processAsinsInBatches } = require('./paapi-sdk');

async function createBathtubPage() {
  const products = productDatabase['bathtub'];
  const outputPath = path.join('..', 'updated-final', 'bathroom', 'bathtub.html');
  
  // HTMLテンプレート
  const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>浴槽の掃除方法 - AI掃除アドバイザー</title>
    <meta name="description" content="浴槽の掃除方法を詳しく解説。軽い汚れからひどい汚れまで、効果的な掃除手順と必要な道具をご紹介します。">
    <meta name="keywords" content="浴槽掃除,お風呂掃除,バスタブ,掃除方法,カビ取り">
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header>
        <h1>AI掃除アドバイザー</h1>
        <nav>
            <ul>
                <li><a href="../index.html">ホーム</a></li>
                <li><a href="index.html">浴室掃除</a></li>
                <li class="current">浴槽</li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <h2>浴槽の掃除方法</h2>
            <p>毎日使う浴槽を清潔に保つための掃除方法をご紹介します。</p>
        </section>

        <section class="level-selection">
            <h3>汚れのレベルを選択してください</h3>
            <div class="level-cards">
                <a href="bathtub-light.html" class="level-card">
                    <h4>軽い汚れ</h4>
                    <p>日常的な汚れ、水垢など</p>
                </a>
                <a href="bathtub-heavy.html" class="level-card">
                    <h4>ひどい汚れ</h4>
                    <p>頑固な水垢、カビ、黒ずみなど</p>
                </a>
            </div>
        </section>

        <section class="products">
            <h3>おすすめの洗剤・クリーナー</h3>
            <div class="product-grid">
${products.cleaners.map(p => `                <div class="product-card">
                    <a href="https://www.amazon.co.jp/dp/${p.asin}?tag=asdfghj12-22" 
                       target="_blank" 
                       rel="nofollow noopener noreferrer" 
                       class="product-link">
                        <img src="https://via.placeholder.com/200x200?text=商品画像" 
                             alt="${p.name}" 
                             loading="lazy">
                        <h4>${p.name}</h4>
                        <div class="product-rating">
                            <span class="stars">★${p.rating}</span>
                            <span class="review-count">(${p.reviews.toLocaleString()})</span>
                        </div>
                        <div class="cta-button">
                            <i class="icon">🛒</i>
                            Amazonで購入
                        </div>
                    </a>
                </div>`).join('\n')}
            </div>
        </section>

        <section class="products">
            <h3>掃除道具・ブラシ</h3>
            <div class="product-grid">
${products.tools.map(p => `                <div class="product-card">
                    <a href="https://www.amazon.co.jp/dp/${p.asin}?tag=asdfghj12-22" 
                       target="_blank" 
                       rel="nofollow noopener noreferrer" 
                       class="product-link">
                        <img src="https://via.placeholder.com/200x200?text=商品画像" 
                             alt="${p.name}" 
                             loading="lazy">
                        <h4>${p.name}</h4>
                        <div class="product-rating">
                            <span class="stars">★${p.rating}</span>
                            <span class="review-count">(${p.reviews.toLocaleString()})</span>
                        </div>
                        <div class="cta-button">
                            <i class="icon">🛒</i>
                            Amazonで購入
                        </div>
                    </a>
                </div>`).join('\n')}
            </div>
        </section>

        <section class="products">
            <h3>保護具</h3>
            <div class="product-grid">
${products.protection.map(p => `                <div class="product-card">
                    <a href="https://www.amazon.co.jp/dp/${p.asin}?tag=asdfghj12-22" 
                       target="_blank" 
                       rel="nofollow noopener noreferrer" 
                       class="product-link">
                        <img src="https://via.placeholder.com/200x200?text=商品画像" 
                             alt="${p.name}" 
                             loading="lazy">
                        <h4>${p.name}</h4>
                        <div class="product-rating">
                            <span class="stars">★${p.rating}</span>
                            <span class="review-count">(${p.reviews.toLocaleString()})</span>
                        </div>
                        <div class="cta-button">
                            <i class="icon">🛒</i>
                            Amazonで購入
                        </div>
                    </a>
                </div>`).join('\n')}
            </div>
        </section>

        <section class="tips">
            <h3>浴槽掃除のポイント</h3>
            <ul>
                <li>🔸 毎日の軽い掃除で汚れの蓄積を防ぐ</li>
                <li>🔸 週1回は念入りに掃除する</li>
                <li>🔸 お湯を抜いたらすぐに掃除するのが効果的</li>
                <li>🔸 洗剤は必要に応じて使い分ける</li>
                <li>🔸 換気を十分に行いながら作業する</li>
            </ul>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 AI掃除アドバイザー. All rights reserved.</p>
        <p><small>このサイトはAmazonアソシエイト・プログラムを利用しています。</small></p>
    </footer>
</body>
</html>`;

  // ディレクトリを作成
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  // ファイルを保存
  await fs.writeFile(outputPath, htmlContent, 'utf8');
  console.log(`✅ Created bathtub.html with 15 products`);
  
  // 商品画像を更新
  console.log('Fetching product images from PA-API...');
  const allAsins = [
    ...products.cleaners.map(p => p.asin),
    ...products.tools.map(p => p.asin),
    ...products.protection.map(p => p.asin)
  ];
  
  try {
    const productInfo = await processAsinsInBatches(allAsins, 10, 2000);
    
    // 画像URLを更新
    let updatedContent = htmlContent;
    for (const [asin, info] of Object.entries(productInfo)) {
      if (info.large || info.medium || info.small) {
        const imageUrl = info.large || info.medium || info.small;
        updatedContent = updatedContent.replace(
          new RegExp(`<img src="https://via\\.placeholder\\.com/200x200\\?text=商品画像"([^>]*alt="[^"]*"[^>]*data-asin="${asin}")`, 'g'),
          `<img src="${imageUrl}"$1`
        );
        // より広範囲な置換
        updatedContent = updatedContent.replace(
          new RegExp(`(href="https://www\\.amazon\\.co\\.jp/dp/${asin}[^"]*"[^>]*>[\\s\\S]*?)<img src="https://via\\.placeholder\\.com/200x200\\?text=商品画像"`, 'g'),
          `$1<img src="${imageUrl}"`
        );
      }
    }
    
    await fs.writeFile(outputPath, updatedContent, 'utf8');
    console.log(`✅ Updated product images for bathtub.html`);
    
  } catch (error) {
    console.log('⚠️  Could not fetch all product images:', error.message);
  }
}

// メイン処理
async function main() {
  console.log('=== Updating bathtub.html ===\n');
  
  // まず updated-all-pages-clean を updated-final にコピー
  const sourceDir = path.join('..', 'updated-all-pages-clean');
  const targetDir = path.join('..', 'updated-final');
  
  try {
    console.log('Copying files to updated-final directory...');
    await fs.cp(sourceDir, targetDir, { recursive: true });
    console.log('✅ Files copied\n');
    
    // bathtub.htmlを作成
    await createBathtubPage();
    
    console.log('\n✅ Process completed!');
    console.log('Updated files are in: ../updated-final/');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBathtubPage };