const fs = require('fs');
const path = require('path');

// HTMLファイルを再帰的に探す
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // node_modules, .git, backupディレクトリはスキップ
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('backup')) {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// 必要な掃除アイテムセクションを削除
function removeUnnecessarySection(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // パターン1: セクション全体を削除
    const pattern1 = /<div class="section">\s*<h2>必要な掃除アイテム<\/h2>\s*<\/div>/g;
    content = content.replace(pattern1, '');
    
    // パターン2: より複雑なセクション構造
    const pattern2 = /<div class="section">\s*<h2>必要な掃除アイテム<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|<\/div>\s*<\/body>)/g;
    content = content.replace(pattern2, '');
    
    if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Removed unnecessary section from: ${filePath}`);
        return true;
    }
    
    return false;
}

// メイン処理
console.log('Removing "必要な掃除アイテム" sections from all HTML files...\n');

const htmlFiles = findHtmlFiles('.');
let modifiedCount = 0;

htmlFiles.forEach(file => {
    if (removeUnnecessarySection(file)) {
        modifiedCount++;
    }
});

console.log(`\nProcessed ${htmlFiles.length} files, modified ${modifiedCount} files.`);