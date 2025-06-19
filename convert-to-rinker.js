#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 商品マスターデータを読み込む
const productsData = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

// HTMLテンプレート（外部JSONから読み込む方式）
const rinkerTemplate = `
<script>
// 商品データを外部から読み込む
async function loadProducts() {
    try {
        const response = await fetch('../products-master.json');
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('商品データの読み込みに失敗しました:', error);
        return [];
    }
}

// カテゴリーに基づいて商品を取得
function getProductsByCategory(products, category) {
    return products.filter(p => p.category === category);
}

// 商品を表示
async function displayProducts() {
    const currentCategory = document.body.getAttribute('data-category');
    const container = document.getElementById('product-container');
    
    if (!container) return;
    
    // ローディング表示
    container.innerHTML = '<div class="loading">商品を読み込んでいます...</div>';
    
    const products = await loadProducts();
    const categoryProducts = getProductsByCategory(products, currentCategory);
    
    container.innerHTML = categoryProducts.map(product => \`
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
                    <div class="feedback-buttons">
                        <button class="feedback-btn good-btn" onclick="submitProductFeedback('\${product.id}', 'good', this)">
                            👍 役立った
                        </button>
                        <button class="feedback-btn bad-btn" onclick="submitProductFeedback('\${product.id}', 'bad', this)">
                            👎 微妙
                        </button>
                    </div>
                    <div class="feedback-count" id="feedback-\${product.id}"></div>
                </div>
            </div>
        </div>
    \`).join('');
    
    // フィードバック数を更新
    updateAllFeedbackCounts();
}

// 商品フィードバック送信
function submitProductFeedback(productId, type, button) {
    const feedbackData = JSON.parse(localStorage.getItem('productFeedback') || '{}');
    const userFeedback = JSON.parse(localStorage.getItem('userProductFeedback') || '{}');
    
    // ユーザーが既にフィードバックしている場合は変更を許可
    if (userFeedback[productId] && userFeedback[productId] !== type) {
        // 以前のフィードバックを取り消す
        const previousType = userFeedback[productId];
        if (feedbackData[productId] && feedbackData[productId][previousType] > 0) {
            feedbackData[productId][previousType]--;
        }
    }
    
    // フィードバックデータを初期化
    if (!feedbackData[productId]) {
        feedbackData[productId] = { good: 0, bad: 0 };
    }
    
    // 新しいフィードバックを追加
    feedbackData[productId][type]++;
    userFeedback[productId] = type;
    
    // 保存
    localStorage.setItem('productFeedback', JSON.stringify(feedbackData));
    localStorage.setItem('userProductFeedback', JSON.stringify(userFeedback));
    
    // 表示を更新
    updateFeedbackCount(productId);
    
    // ボタンの状態を更新
    const card = button.closest('.product-card');
    card.querySelectorAll('.feedback-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // フィードバックメッセージ
    const message = type === 'good' ? 'フィードバックありがとうございます！' : 'ご意見ありがとうございます。';
    showFeedbackMessage(button, message);
}

// フィードバック数を更新
function updateFeedbackCount(productId) {
    const feedbackData = JSON.parse(localStorage.getItem('productFeedback') || '{}');
    const element = document.getElementById(\`feedback-\${productId}\`);
    
    if (element && feedbackData[productId]) {
        const { good, bad } = feedbackData[productId];
        const total = good + bad;
        
        if (total > 0) {
            const percentage = Math.round((good / total) * 100);
            element.innerHTML = \`
                <span class="feedback-stats">
                    👍 \${percentage}% (\${total}人中\${good}人)
                </span>
            \`;
        }
    }
}

// すべてのフィードバック数を更新
function updateAllFeedbackCounts() {
    const cards = document.querySelectorAll('.product-card');
    const userFeedback = JSON.parse(localStorage.getItem('userProductFeedback') || '{}');
    
    cards.forEach(card => {
        const productId = card.dataset.productId;
        updateFeedbackCount(productId);
        
        // ユーザーの選択を反映
        if (userFeedback[productId]) {
            const btnClass = userFeedback[productId] === 'good' ? '.good-btn' : '.bad-btn';
            const btn = card.querySelector(btnClass);
            if (btn) btn.classList.add('active');
        }
    });
}

// フィードバックメッセージ表示
function showFeedbackMessage(button, message) {
    const existingMessage = button.parentElement.querySelector('.feedback-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = 'feedback-message';
    messageEl.textContent = message;
    button.parentElement.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 2000);
}

// ページ読み込み時に商品を表示
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});
</script>
`;

// 処理対象のHTMLファイルを収集
function findHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            findHtmlFiles(fullPath, files);
        } else if (stat.isFile() && item.endsWith('.html') && 
                   !['index.html', 'admin.html', 'test-load.html'].includes(item)) {
            files.push(fullPath);
        }
    });
    
    return files;
}

// HTMLファイルを更新
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // カテゴリーを取得
    const categoryMatch = content.match(/data-category="([^"]+)"/);
    if (!categoryMatch) {
        console.log(`⚠️  ${filePath} にカテゴリーが見つかりません`);
        return false;
    }
    
    const category = categoryMatch[1];
    console.log(`処理中: ${filePath} (カテゴリー: ${category})`);
    
    // 既存のスクリプトセクションを削除（productsDatabase を含む部分）
    content = content.replace(/<script>\s*\/\/\s*商品データ[\s\S]*?<\/script>/g, '');
    
    // 新しいスクリプトを挿入（</body>の前）
    if (!content.includes('loadProducts()')) {
        content = content.replace('</body>', rinkerTemplate + '\n</body>');
    }
    
    // ファイルを保存
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} を更新しました`);
    
    return true;
}

// メイン処理
function main() {
    const htmlFiles = findHtmlFiles('.');
    
    console.log(`${htmlFiles.length}個のHTMLファイルを処理します...\n`);
    
    let updatedCount = 0;
    htmlFiles.forEach(file => {
        if (updateHtmlFile(file)) {
            updatedCount++;
        }
    });
    
    console.log(`\n✅ ${updatedCount}個のファイルの変換が完了しました！`);
}

// 実行
main();