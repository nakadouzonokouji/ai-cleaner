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
        
        // 掃除手順セクションを抽出（<div class="section">から</div>まで）
        const cleaningStepsMatch = originalContent.match(/<div class="section">\s*<h2>掃除手順<\/h2>[\s\S]*?<\/div>\s*<\/div>/);
        if (!cleaningStepsMatch) {
            console.log(`⚠️  ${htmlFile} - 掃除手順が見つかりません`);
            return false;
        }
        
        const cleaningSteps = cleaningStepsMatch[0];
        
        // 現在のファイルを読み込み
        let currentContent = fs.readFileSync(htmlFile, 'utf8');
        
        // フィードバックセクションを見つける
        const feedbackMatch = currentContent.match(/<section class="method-feedback">/);
        if (!feedbackMatch) {
            console.log(`⚠️  ${htmlFile} - フィードバックセクションが見つかりません`);
            return false;
        }
        
        const feedbackIndex = feedbackMatch.index;
        
        // 掃除手順を挿入
        currentContent = currentContent.slice(0, feedbackIndex) + 
            '\n        ' + cleaningSteps + '\n\n        ' +
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

// 特定のファイルから始める
console.log('kitchen/ih-heavy.htmlから始めます...\n');
if (restoreCleaningSteps('kitchen/ih-heavy.html')) {
    console.log('\n成功！他のファイルも処理しますか？');
    
    // すべてのHTMLファイルを処理
    const folders = ['kitchen', 'bathroom', 'floor', 'living', 'toilet', 'window'];
    let restoredCount = 1; // ih-heavy.htmlは既に処理済み

    folders.forEach(folder => {
        const files = fs.readdirSync(folder).filter(f => f.endsWith('.html') && f !== 'index.html');
        files.forEach(file => {
            const fullPath = path.join(folder, file);
            if (fullPath !== 'kitchen/ih-heavy.html' && restoreCleaningSteps(fullPath)) {
                restoredCount++;
            }
        });
    });

    console.log(`\n✅ 完了: ${restoredCount}ファイルの掃除手順を復元しました`);
}