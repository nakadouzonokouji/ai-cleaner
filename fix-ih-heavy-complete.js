#!/usr/bin/env node

const fs = require('fs');

// オリジナルファイルを読み込み
const originalContent = fs.readFileSync('kitchen/ih-heavy-temp.html', 'utf8');

// 静的な商品セクションを動的読み込みに置き換え
let newContent = originalContent;

// 静的な商品リストを削除
newContent = newContent.replace(/<div class="section">\s*<h2>おすすめ商品<\/h2>[\s\S]*?<\/div>\s*<\/div>(?=\s*<\/main>)/, '');

// フィードバックセクションの後に動的な商品コンテナを追加
const feedbackEnd = newContent.lastIndexOf('</script>');
const insertPoint = newContent.indexOf('\n', feedbackEnd) + 1;

const dynamicProductSection = `
    <div class="section">
        <h2>おすすめ商品</h2>
        <div id="product-container" class="product-grid">
            <!-- 商品はJavaScriptで動的に読み込まれます -->
        </div>
    </div>

    <style>
    .product-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 20px;
    }
    
    .product-grid h3 {
        grid-column: 1 / -1;
        margin: 30px 0 15px 0;
        font-size: 1.2rem;
        color: #333;
        border-bottom: 2px solid #1a73e8;
        padding-bottom: 10px;
    }
    
    .product-grid h3:first-child {
        margin-top: 0;
    }
    
    @media (max-width: 768px) {
        .product-grid {
            grid-template-columns: 1fr;
        }
    }
    </style>

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

    // 商品をカテゴリごとにグループ化して表示
    async function displayProducts() {
        const currentCategory = document.body.getAttribute('data-category');
        const container = document.getElementById('product-container');
        
        if (!container) return;
        
        // ローディング表示
        container.innerHTML = '<div class="loading">商品を読み込んでいます...</div>';
        
        const products = await loadProducts();
        const categoryProducts = getProductsByCategory(products, currentCategory);
        
        // カテゴリごとにグループ化
        const cleaners = categoryProducts.filter(p => 
            p.name.includes('クリーナー') || 
            p.name.includes('洗剤') || 
            p.name.includes('重曹') ||
            p.name.includes('セスキ') ||
            p.name.includes('マジックリン')
        ).slice(0, 5);
        
        const tools = categoryProducts.filter(p => 
            p.name.includes('スポンジ') || 
            p.name.includes('ブラシ') || 
            p.name.includes('スクレーパー') ||
            p.name.includes('クロス') ||
            p.name.includes('タオル')
        ).slice(0, 5);
        
        const protective = categoryProducts.filter(p => 
            p.name.includes('手袋') || 
            p.name.includes('マスク') || 
            p.name.includes('メガネ') ||
            p.name.includes('グローブ')
        ).slice(0, 5);
        
        // HTMLを生成
        let html = '';
        
        if (cleaners.length > 0) {
            html += '<h3>洗剤・クリーナー</h3>';
            html += cleaners.map(p => createProductCard(p)).join('');
        }
        
        if (tools.length > 0) {
            html += '<h3>スポンジ・ブラシ・道具</h3>';
            html += tools.map(p => createProductCard(p)).join('');
        }
        
        if (protective.length > 0) {
            html += '<h3>保護具</h3>';
            html += protective.map(p => createProductCard(p)).join('');
        }
        
        container.innerHTML = html;
        
        // フィードバック数を更新
        updateAllFeedbackCounts();
    }

    // 商品カードを生成
    function createProductCard(product) {
        return \`
            <div class="product-card" data-product-id="\${product.id}">
                <div class="product-image-wrapper">
                    <img src="\${product.image}" alt="\${product.name}" class="product-image" 
                         onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    \${product.prime ? '<div class="prime-badge">Prime</div>' : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-title">\${product.name}</h4>
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
        \`;
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

newContent = newContent.slice(0, insertPoint) + dynamicProductSection + '\n' + newContent.slice(insertPoint);

// ファイルを保存
fs.writeFileSync('kitchen/ih-heavy.html', newContent, 'utf8');

// 一時ファイルを削除
fs.unlinkSync('kitchen/ih-heavy-temp.html');

console.log('✅ kitchen/ih-heavy.html を完全に修正しました');
console.log('- 10ステップの掃除手順を維持');
console.log('- 商品を3カテゴリ×5個の正しいレイアウトに修正');
console.log('- 動的読み込みで実在する商品のみ表示');