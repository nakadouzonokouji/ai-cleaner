#!/usr/bin/env node

const fs = require('fs');

// ih-heavy.htmlを読み込み
let content = fs.readFileSync('kitchen/ih-heavy.html', 'utf8');

// 静的な商品リストセクションを見つける（必要な掃除アイテムセクション全体）
const productSectionStart = content.indexOf('<div class="section">\n            <h2>必要な掃除アイテム</h2>');
const productSectionEnd = content.indexOf('</div>', content.indexOf('<h3>保護具</h3>')) + 6;

if (productSectionStart === -1 || productSectionEnd === -1) {
    console.error('商品セクションが見つかりません');
    process.exit(1);
}

// 元の商品セクション
const originalProductSection = content.substring(productSectionStart, productSectionEnd);

// 新しい動的商品セクション
const newProductSection = `<div class="section">
            <h2>必要な掃除アイテム</h2>
            <div id="product-container" class="product-grid">
                <!-- 商品はJavaScriptで動的に読み込まれます -->
            </div>
        </div>
        
        <style>
        .product-grid {
            margin-top: 20px;
        }
        
        .product-grid h3 {
            margin: 30px 0 15px 0;
            font-size: 1.1rem;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }
        
        .product-grid h3:first-child {
            margin-top: 10px;
        }
        
        .product-list {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .product-card {
            flex: 0 0 200px;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            background: white;
        }
        
        .product-image {
            width: 100%;
            height: 150px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        
        .product-title {
            font-size: 14px;
            margin: 10px 0 5px;
            line-height: 1.3;
            height: 36px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .product-rating {
            display: flex;
            align-items: center;
            gap: 5px;
            margin: 5px 0;
        }
        
        .stars {
            color: #ff9800;
            font-size: 14px;
        }
        
        .review-count {
            color: #666;
            font-size: 12px;
        }
        
        .product-price {
            color: #667eea;
            font-weight: bold;
            margin: 8px 0;
        }
        
        .amazon-button {
            display: block;
            background: #ff9500;
            color: white;
            text-align: center;
            padding: 8px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .amazon-button:hover {
            background: #e88600;
        }
        
        .feedback-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        .feedback-buttons {
            display: flex;
            gap: 10px;
        }
        
        .feedback-btn {
            flex: 1;
            padding: 5px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .feedback-btn:hover {
            background: #f5f5f5;
        }
        
        .feedback-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .feedback-count {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
            text-align: center;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
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
                p.name.includes('マジックリン') ||
                p.name.includes('キュキュット')
            ).slice(0, 5);
            
            const tools = categoryProducts.filter(p => 
                p.name.includes('スポンジ') || 
                p.name.includes('ブラシ') || 
                p.name.includes('スクレーパー') ||
                p.name.includes('クロス') ||
                p.name.includes('タオル') ||
                p.name.includes('パッド')
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
                html += '<h3>洗剤</h3><div class="product-list">';
                html += cleaners.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            if (tools.length > 0) {
                html += '<h3>スポンジ・ブラシ</h3><div class="product-list">';
                html += tools.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            if (protective.length > 0) {
                html += '<h3>保護具</h3><div class="product-list">';
                html += protective.map(p => createProductCard(p)).join('');
                html += '</div>';
            }
            
            container.innerHTML = html;
            
            // フィードバック数を更新
            updateAllFeedbackCounts();
        }
        
        // 商品カードを生成
        function createProductCard(product) {
            return \`
                <div class="product-card" data-product-id="\${product.id}">
                    <img src="\${product.image}" alt="\${product.name}" class="product-image" 
                         onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    <h4 class="product-title">\${product.name}</h4>
                    <div class="product-rating">
                        <span class="stars">★\${product.rating}</span>
                        <span class="review-count">(\${product.reviews.toLocaleString()})</span>
                    </div>
                    <div class="product-price">¥\${product.price.toLocaleString()}</div>
                    <a href="\${product.url}" target="_blank" rel="noopener noreferrer" class="amazon-button">
                        Amazonで見る
                    </a>
                    <div class="feedback-section">
                        <div class="feedback-buttons">
                            <button class="feedback-btn good-btn" onclick="submitProductFeedback('\${product.id}', 'good', this)">
                                👍
                            </button>
                            <button class="feedback-btn bad-btn" onclick="submitProductFeedback('\${product.id}', 'bad', this)">
                                👎
                            </button>
                        </div>
                        <div class="feedback-count" id="feedback-\${product.id}"></div>
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
                    element.innerHTML = \`👍 \${percentage}% (\${total}人)\`;
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
        
        // ページ読み込み時に商品を表示
        document.addEventListener('DOMContentLoaded', () => {
            displayProducts();
        });
        </script>`;

// コンテンツを置換
content = content.substring(0, productSectionStart) + 
          newProductSection + 
          content.substring(productSectionEnd);

// ファイルを保存
fs.writeFileSync('kitchen/ih-heavy.html', content, 'utf8');

console.log('✅ kitchen/ih-heavy.htmlの商品セクションを動的読み込みに更新しました');
console.log('- 10ステップの掃除手順は維持');
console.log('- 商品は3カテゴリに整理して表示');
console.log('- 実在する商品のみを動的に読み込み');