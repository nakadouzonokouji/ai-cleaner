#!/usr/bin/env node

const fs = require('fs');

// ih-heavy.htmlを読み込み
let content = fs.readFileSync('kitchen/ih-heavy.html', 'utf8');

// 1. ナビゲーションボタンを追加（h1の後に）
const navButtons = `
        <div class="button-group">
            <a href="../index.html" class="button button-back">← 場所選択に戻る</a>
            <a href="index.html" class="button button-back">← 詳細箇所選択に戻る</a>
        </div>`;

content = content.replace(
    /<h1>IHクッキングヒーターひどい汚れ掃除ガイド<\/h1>/,
    `<h1>IHクッキングヒーターひどい汚れ掃除ガイド</h1>${navButtons}`
);

// 2. ボタンのスタイルを追加
const buttonStyles = `
        .button-group {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #5a67d8;
        }
        .button-back {
            background: #718096;
        }
        .button-back:hover {
            background: #4a5568;
        }`;

// スタイルセクションに追加
content = content.replace(
    /<\/style>/,
    `${buttonStyles}
    </style>`
);

// 3. 商品ごとのフィードバックボタンを削除し、商品表示を簡潔に
const newCreateProductCard = `
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
                </div>
            \`;
        }`;

// createProductCard関数を置き換え
content = content.replace(
    /\/\/ 商品カードを生成[\s\S]*?^\s*}/m,
    newCreateProductCard.trim()
);

// 4. フィードバック関連の関数を削除
content = content.replace(/\/\/ 商品フィードバック送信[\s\S]*?\/\/ ページ読み込み時に商品を表示/m, '// ページ読み込み時に商品を表示');

// 5. displayProducts関数内のフィードバック更新を削除
content = content.replace(/\n\s*\/\/ フィードバック数を更新\n\s*updateAllFeedbackCounts\(\);/, '');

// 6. ページ最下部にフィードバックセクションを追加
const methodFeedbackSection = `
        
        <div class="section method-feedback">
            <h3>この掃除方法は役に立ちましたか？</h3>
            <div class="feedback-container">
                <button class="method-feedback-btn good-btn" onclick="sendMethodFeedback('good')">
                    <span class="emoji">👍</span>
                    <span class="text">Good</span>
                    <span class="count" id="goodCount">0</span>
                </button>
                <button class="method-feedback-btn bad-btn" onclick="sendMethodFeedback('bad')">
                    <span class="emoji">👎</span>
                    <span class="text">Bad</span>
                    <span class="count" id="badCount">0</span>
                </button>
            </div>
        </div>
        
        <style>
        .method-feedback {
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
        }
        
        .method-feedback h3 {
            margin-bottom: 20px;
            color: #333;
        }
        
        .feedback-container {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        
        .method-feedback-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 30px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 16px;
        }
        
        .method-feedback-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .method-feedback-btn .emoji {
            font-size: 24px;
        }
        
        .method-feedback-btn .count {
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 14px;
            min-width: 30px;
        }
        
        .method-feedback-btn.active {
            border-color: #667eea;
            background: #667eea;
            color: white;
        }
        
        .method-feedback-btn.active .count {
            background: rgba(255,255,255,0.3);
        }
        </style>
        
        <script>
        // ページのキーを取得
        function getPageKey() {
            return window.location.pathname.split('/').pop().replace('.html', '');
        }
        
        // メソッドフィードバックを送信
        function sendMethodFeedback(type) {
            const pageKey = getPageKey();
            const feedbackData = JSON.parse(localStorage.getItem('methodFeedback') || '{}');
            const userFeedback = JSON.parse(localStorage.getItem('userMethodFeedback') || '{}');
            
            // 初期化
            if (!feedbackData[pageKey]) {
                feedbackData[pageKey] = { good: 0, bad: 0 };
            }
            
            // ユーザーが既に投票している場合
            if (userFeedback[pageKey]) {
                const previousType = userFeedback[pageKey];
                if (previousType !== type) {
                    feedbackData[pageKey][previousType]--;
                } else {
                    return; // 同じボタンを再度クリックした場合は何もしない
                }
            }
            
            // フィードバックを追加
            feedbackData[pageKey][type]++;
            userFeedback[pageKey] = type;
            
            // 保存
            localStorage.setItem('methodFeedback', JSON.stringify(feedbackData));
            localStorage.setItem('userMethodFeedback', JSON.stringify(userFeedback));
            
            // 表示を更新
            displayMethodFeedbackCounts();
            updateButtonStates();
        }
        
        // フィードバック数を表示
        function displayMethodFeedbackCounts() {
            const pageKey = getPageKey();
            const feedbackData = JSON.parse(localStorage.getItem('methodFeedback') || '{}');
            const pageFeedback = feedbackData[pageKey] || { good: 0, bad: 0 };
            
            document.getElementById('goodCount').textContent = pageFeedback.good;
            document.getElementById('badCount').textContent = pageFeedback.bad;
        }
        
        // ボタンの状態を更新
        function updateButtonStates() {
            const pageKey = getPageKey();
            const userFeedback = JSON.parse(localStorage.getItem('userMethodFeedback') || '{}');
            const feedback = userFeedback[pageKey];
            
            document.querySelectorAll('.method-feedback-btn').forEach(btn => btn.classList.remove('active'));
            
            if (feedback === 'good') {
                document.querySelector('.good-btn').classList.add('active');
            } else if (feedback === 'bad') {
                document.querySelector('.bad-btn').classList.add('active');
            }
        }
        
        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', function() {
            displayMethodFeedbackCounts();
            updateButtonStates();
        });
        </script>`;

// </body>タグの前に挿入
content = content.replace(
    /    <\/div>\n<\/body>/,
    `    </div>${methodFeedbackSection}
    </div>
</body>`
);

// 7. 不要なフィードバック関連のスタイルを削除
content = content.replace(/\.feedback-section[\s\S]*?\.feedback-count[^}]*}/g, '');
content = content.replace(/\.feedback-buttons[\s\S]*?\.feedback-btn\.active[^}]*}/g, '');

// 8. 空白行を整理
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// ファイルを保存
fs.writeFileSync('kitchen/ih-heavy.html', content, 'utf8');

console.log('✅ kitchen/ih-heavy.htmlを修正しました:');
console.log('- ナビゲーションボタンを追加');
console.log('- 商品ごとのフィードバックボタンを削除');
console.log('- ページ最下部にメソッドフィードバックセクションを追加');
console.log('- 各カテゴリ5個の商品を表示するよう設定済み');