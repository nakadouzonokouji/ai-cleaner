#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// フィードバック機能のHTML/JavaScriptテンプレート
const feedbackTemplate = `
<!-- 掃除方法フィードバックセクション -->
<div class="method-feedback-section">
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
    <div class="feedback-comment" id="feedbackComment" style="display: none;">
        <textarea id="commentText" placeholder="コメントをお聞かせください（任意）" rows="3"></textarea>
        <button onclick="submitComment()">送信</button>
    </div>
    <div class="feedback-message" id="feedbackMessage" style="display: none;">
        ご意見ありがとうございました！
    </div>
</div>

<style>
.method-feedback-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 30px;
    margin: 40px 0;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.method-feedback-section h3 {
    color: #333;
    margin-bottom: 20px;
    font-size: 20px;
}

.feedback-container {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 20px;
}

.method-feedback-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 30px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    min-width: 140px;
    justify-content: center;
}

.method-feedback-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.method-feedback-btn .emoji {
    font-size: 24px;
}

.method-feedback-btn .count {
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
}

.good-btn:hover {
    border-color: #4caf50;
    background: #e8f5e9;
}

.good-btn.active {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
}

.good-btn.active .count {
    background: rgba(255,255,255,0.3);
}

.bad-btn:hover {
    border-color: #f44336;
    background: #ffebee;
}

.bad-btn.active {
    background: #f44336;
    color: white;
    border-color: #f44336;
}

.bad-btn.active .count {
    background: rgba(255,255,255,0.3);
}

.feedback-comment {
    margin-top: 20px;
}

.feedback-comment textarea {
    width: 100%;
    max-width: 500px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
}

.feedback-comment button {
    margin-top: 10px;
    padding: 10px 30px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s;
}

.feedback-comment button:hover {
    background: #1976d2;
}

.feedback-message {
    color: #4caf50;
    font-weight: bold;
    font-size: 18px;
    margin-top: 20px;
}

@media (max-width: 768px) {
    .feedback-container {
        flex-direction: column;
        align-items: center;
    }
    
    .method-feedback-btn {
        width: 200px;
    }
}
</style>

<script>
// ページごとのフィードバックデータを管理
function getPageKey() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const category = parts[parts.length - 2] || 'unknown';
    const page = parts[parts.length - 1].replace('.html', '') || 'index';
    return \`method-\${category}-\${page}\`;
}

// フィードバック数を表示
function displayMethodFeedbackCounts() {
    const pageKey = getPageKey();
    const feedbackData = JSON.parse(localStorage.getItem('methodFeedback') || '{}');
    const pageFeedback = feedbackData[pageKey] || { good: 0, bad: 0, comments: [] };
    
    document.getElementById('goodCount').textContent = pageFeedback.good;
    document.getElementById('badCount').textContent = pageFeedback.bad;
}

// 掃除方法へのフィードバック送信
function sendMethodFeedback(type) {
    const pageKey = getPageKey();
    const feedbackData = JSON.parse(localStorage.getItem('methodFeedback') || '{}');
    
    if (!feedbackData[pageKey]) {
        feedbackData[pageKey] = { good: 0, bad: 0, comments: [] };
    }
    
    // すでにフィードバック済みかチェック
    const userFeedback = JSON.parse(localStorage.getItem('userMethodFeedback') || '{}');
    if (userFeedback[pageKey]) {
        // すでにフィードバック済みの場合は変更
        const previousType = userFeedback[pageKey];
        if (previousType !== type) {
            feedbackData[pageKey][previousType]--;
            feedbackData[pageKey][type]++;
            userFeedback[pageKey] = type;
        }
    } else {
        // 新規フィードバック
        feedbackData[pageKey][type]++;
        userFeedback[pageKey] = type;
    }
    
    localStorage.setItem('methodFeedback', JSON.stringify(feedbackData));
    localStorage.setItem('userMethodFeedback', JSON.stringify(userFeedback));
    
    // UIを更新
    displayMethodFeedbackCounts();
    updateButtonStates();
    
    // コメント欄を表示
    document.getElementById('feedbackComment').style.display = 'block';
    
    // フィードバックメッセージを表示
    const message = document.getElementById('feedbackMessage');
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
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

// コメント送信
function submitComment() {
    const comment = document.getElementById('commentText').value.trim();
    if (!comment) return;
    
    const pageKey = getPageKey();
    const feedbackData = JSON.parse(localStorage.getItem('methodFeedback') || '{}');
    
    if (!feedbackData[pageKey]) {
        feedbackData[pageKey] = { good: 0, bad: 0, comments: [] };
    }
    
    feedbackData[pageKey].comments.push({
        text: comment,
        timestamp: new Date().toISOString(),
        url: window.location.href
    });
    
    localStorage.setItem('methodFeedback', JSON.stringify(feedbackData));
    
    // UIをリセット
    document.getElementById('commentText').value = '';
    document.getElementById('feedbackComment').style.display = 'none';
    document.getElementById('feedbackMessage').textContent = 'コメントありがとうございました！';
    document.getElementById('feedbackMessage').style.display = 'block';
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    displayMethodFeedbackCounts();
    updateButtonStates();
});
</script>
`;

// HTMLファイルを処理する関数
function addMethodFeedback(filePath) {
    const filename = path.basename(filePath);
    
    // index.htmlはスキップ
    if (filename === 'index.html') return;
    
    console.log(`処理中: ${filePath}`);
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // すでにフィードバック機能がある場合はスキップ
    if (html.includes('method-feedback-section')) {
        console.log(`スキップ: ${filePath} (既にフィードバック機能あり)`);
        return;
    }
    
    // </body>タグの前にフィードバックセクションを追加
    const insertPosition = html.indexOf('</body>');
    if (insertPosition !== -1) {
        html = html.slice(0, insertPosition) + feedbackTemplate + '\n' + html.slice(insertPosition);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ ${filePath} にフィードバック機能を追加しました`);
    } else {
        console.log(`⚠️ ${filePath} に</body>タグが見つかりません`);
    }
}

// すべてのディレクトリを処理
const directories = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.html')) {
                addMethodFeedback(path.join(dirPath, file));
            }
        });
    }
});

console.log('\n✅ 掃除方法フィードバック機能の追加が完了しました！');