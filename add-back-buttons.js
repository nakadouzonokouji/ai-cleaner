#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 戻るボタンのHTMLテンプレート
const backButtonTemplate = `
<div class="back-button-container">
    <a href="../index.html" class="back-button back-to-main">
        <span class="arrow">←</span> 場所選択に戻る
    </a>
    <a href="index.html" class="back-button back-to-category">
        <span class="arrow">←</span> 詳細箇所選択に戻る
    </a>
</div>

<style>
.back-button-container {
    display: flex;
    gap: 15px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 50px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.back-button:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.back-button .arrow {
    font-size: 18px;
    font-weight: bold;
}

.back-to-main {
    background: #fff;
    border-color: #667eea;
    color: #667eea;
}

.back-to-main:hover {
    background: #667eea;
    color: white;
}

.back-to-category {
    background: #fff;
    border-color: #48bb78;
    color: #48bb78;
}

.back-to-category:hover {
    background: #48bb78;
    color: white;
}

@media (max-width: 768px) {
    .back-button-container {
        flex-direction: column;
        align-items: stretch;
    }
    
    .back-button {
        width: 100%;
        justify-content: center;
        text-align: center;
    }
}
</style>
`;

// HTMLファイルを処理する関数
function addBackButtons(filePath) {
    const filename = path.basename(filePath);
    
    // index.htmlはスキップ
    if (filename === 'index.html') return;
    
    console.log(`処理中: ${filePath}`);
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // すでに戻るボタンがある場合はスキップ
    if (html.includes('back-button-container')) {
        console.log(`スキップ: ${filePath} (既に戻るボタンあり)`);
        return;
    }
    
    // h1タグの後に戻るボタンを挿入
    const h1Match = html.match(/<h1[^>]*>.*?<\/h1>/);
    if (h1Match) {
        const h1Position = html.indexOf(h1Match[0]) + h1Match[0].length;
        html = html.slice(0, h1Position) + '\n' + backButtonTemplate + html.slice(h1Position);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ ${filePath} に戻るボタンを追加しました`);
    } else {
        console.log(`⚠️ ${filePath} にh1タグが見つかりません`);
    }
}

// すべてのディレクトリを処理
const directories = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.html') && file !== 'index.html') {
                addBackButtons(path.join(dirPath, file));
            }
        });
    }
});

console.log('\n✅ 戻るボタンの追加が完了しました！');