#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 商品マスターデータを読み込む
const productsData = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

// HTMLテンプレート
const rinkerTemplate = `
<script>
// 商品データ
const productsDatabase = ${JSON.stringify(productsData.products)};

// カテゴリーに基づいて商品を取得
function getProductsByCategory(category) {
    return productsDatabase.filter(p => p.category === category);
}

// 商品を表示
function displayProducts() {
    const currentCategory = document.body.getAttribute('data-category');
    const products = getProductsByCategory(currentCategory);
    const container = document.getElementById('product-container');
    
    if (!container) return;
    
    container.innerHTML = products.map(product => \`
        <div class="product-card" data-product-id="\${product.id}">
            <div class="product-image-wrapper">
                <img src="\${product.image}" alt="\${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                \${product.prime ? '<div class="prime-badge">Prime</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">\${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">★\${product.rating}</span>
                    <span class="review-count">(\${product.reviews.toLocaleString()})</span>
                </div>
                <div class="product-price">¥\${product.price.toLocaleString()}</div>
                <div class="product-status">
                    \${product.inStock ? '<span class="in-stock">✓ 在庫あり</span>' : '<span class="out-stock">在庫なし</span>'}
                </div>
                <div class="product-actions">
                    <a href="\${product.url}" target="_blank" rel="noopener noreferrer" class="amazon-button">
                        Amazonで見る
                    </a>
                </div>
                <div class="feedback-section">
                    <button class="feedback-btn good-btn" onclick="sendFeedback('\${product.id}', 'good')">
                        👍 Good
                    </button>
                    <button class="feedback-btn bad-btn" onclick="sendFeedback('\${product.id}', 'bad')">
                        👎 Bad
                    </button>
                </div>
            </div>
        </div>
    \`).join('');
}

// フィードバック送信
function sendFeedback(productId, type) {
    const feedback = JSON.parse(localStorage.getItem('productFeedback') || '{}');
    if (!feedback[productId]) {
        feedback[productId] = { good: 0, bad: 0 };
    }
    feedback[productId][type]++;
    localStorage.setItem('productFeedback', JSON.stringify(feedback));
    
    // フィードバックアニメーション
    const btn = event.target;
    btn.classList.add('feedback-sent');
    btn.textContent = type === 'good' ? '👍 Thanks!' : '👎 Noted';
    setTimeout(() => {
        btn.classList.remove('feedback-sent');
        btn.textContent = type === 'good' ? '👍 Good' : '👎 Bad';
    }, 2000);
}

// ページ読み込み時に商品を表示
document.addEventListener('DOMContentLoaded', displayProducts);
</script>

<style>
.product-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin: 40px 0;
}

.product-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image-wrapper {
    position: relative;
    background: #f8f8f8;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.prime-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: #ff6b6b;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.product-info {
    padding: 15px;
}

.product-title {
    font-size: 14px;
    margin: 0 0 10px 0;
    color: #333;
    line-height: 1.4;
    height: 40px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
}

.stars {
    color: #ff9800;
    font-weight: bold;
}

.review-count {
    color: #666;
    font-size: 13px;
}

.product-price {
    font-size: 20px;
    color: #b12704;
    font-weight: bold;
    margin-bottom: 8px;
}

.product-status {
    margin-bottom: 12px;
}

.in-stock {
    color: #007600;
    font-size: 13px;
}

.out-stock {
    color: #cc0000;
    font-size: 13px;
}

.amazon-button {
    display: block;
    background: #ff9900;
    color: white;
    text-align: center;
    padding: 10px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: background 0.2s;
}

.amazon-button:hover {
    background: #e47911;
}

.feedback-section {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.feedback-btn {
    flex: 1;
    padding: 6px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
}

.good-btn:hover {
    background: #e8f5e9;
    border-color: #4caf50;
}

.bad-btn:hover {
    background: #ffebee;
    border-color: #f44336;
}

.feedback-sent {
    background: #2196f3 !important;
    color: white !important;
    border-color: #2196f3 !important;
}
</style>
`;

// HTMLファイルを処理する関数
function processHTMLFile(filePath) {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath, '.html');
    const category = `${path.basename(dir)}-${filename}`;
    
    // index.htmlはスキップ
    if (filename === 'index') return;
    
    console.log(`処理中: ${filePath} (カテゴリー: ${category})`);
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // body要素にdata-category属性を追加
    html = html.replace(/<body[^>]*>/, `<body data-category="${category}">`);
    
    // 既存の商品セクションを新しいコンテナに置き換え
    // <h2>おすすめ商品</h2>から次の<h2>または</main>まで
    html = html.replace(
        /<h2[^>]*>おすすめ商品<\/h2>[\s\S]*?(?=<h2|<\/main>)/,
        `<h2>おすすめ商品</h2>
        <div id="product-container" class="product-container">
            <!-- 商品は動的に読み込まれます -->
        </div>
        `
    );
    
    // </body>の前にスクリプトを追加
    if (!html.includes('productsDatabase')) {
        html = html.replace('</body>', rinkerTemplate + '\n</body>');
    }
    
    // ファイルを保存
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${filePath} を更新しました`);
}

// すべてのディレクトリを処理
const directories = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.html') && file !== 'index.html') {
                processHTMLFile(path.join(dirPath, file));
            }
        });
    }
});

// 特殊ファイルも処理
const specialFiles = [
    'kitchen/sink.html',
    'bathroom/bathtub.html'
];

specialFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        processHTMLFile(filePath);
    }
});

console.log('\n✅ すべてのファイルの変換が完了しました！');