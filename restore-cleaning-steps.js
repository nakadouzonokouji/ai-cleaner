#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 各ファイルの掃除手順を復元する
function restoreCleaningSteps(htmlFile) {
    const fileName = path.basename(htmlFile);
    const dirName = path.dirname(htmlFile);
    
    // オリジナルファイルから掃除手順を取得
    try {
        const originalContent = execSync(`git show a18b9d0:${htmlFile}`, { encoding: 'utf8' });
        
        // 掃除手順セクションを抽出
        const cleaningStepsMatch = originalContent.match(/<h2>掃除手順<\/h2>[\s\S]*?<\/section>/);
        if (!cleaningStepsMatch) {
            console.log(`⚠️  ${htmlFile} - 掃除手順が見つかりません`);
            return false;
        }
        
        const cleaningSteps = cleaningStepsMatch[0];
        
        // 現在のファイルを読み込み
        let currentContent = fs.readFileSync(htmlFile, 'utf8');
        
        // 既存の不完全な掃除手順を削除（もしあれば）
        currentContent = currentContent.replace(/<h2>掃除手順<\/h2>[\s\S]*?<\/section>/g, '');
        
        // フィードバックセクションの前に掃除手順を挿入
        const feedbackIndex = currentContent.indexOf('<section class="method-feedback">');
        if (feedbackIndex === -1) {
            console.log(`⚠️  ${htmlFile} - フィードバックセクションが見つかりません`);
            return false;
        }
        
        // 掃除手順を挿入
        currentContent = currentContent.slice(0, feedbackIndex) + 
            cleaningSteps + '\n\n        ' +
            currentContent.slice(feedbackIndex);
        
        // ファイルを保存
        fs.writeFileSync(htmlFile, currentContent, 'utf8');
        console.log(`✅ ${htmlFile} - 掃除手順を復元しました`);
        return true;
        
    } catch (error) {
        console.log(`❌ ${htmlFile} - エラー: ${error.message}`);
        return false;
    }
}

// すべてのHTMLファイルを処理
const folders = ['kitchen', 'bathroom', 'floor', 'living', 'toilet', 'window'];
let restoredCount = 0;

folders.forEach(folder => {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.html') && f !== 'index.html');
    files.forEach(file => {
        const fullPath = path.join(folder, file);
        if (restoreCleaningSteps(fullPath)) {
            restoredCount++;
        }
    });
});

console.log(`\n✅ 完了: ${restoredCount}ファイルの掃除手順を復元しました`);