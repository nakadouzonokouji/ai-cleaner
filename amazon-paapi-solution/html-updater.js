const fs = require('fs');
const path = require('path');

// HTMLファイル内の画像URLを更新する関数
function updateImageUrlsInHtml(htmlContent, imageUrlMapping) {
    let updatedContent = htmlContent;
    let updateCount = 0;
    
    // 各ASINに対して画像URLを更新
    Object.keys(imageUrlMapping).forEach(asin => {
        const mapping = imageUrlMapping[asin];
        
        // 古いAmazon画像URLパターンを検索して置換
        const oldImagePattern = /https:\/\/m\.media-amazon\.com\/images\/[A-Za-z0-9\/+\-_%.]+\.(jpg|jpeg|png|gif|webp)/gi;
        
        // ASINに関連する画像URLを新しいURLに置換
        const matches = updatedContent.match(oldImagePattern);
        if (matches) {
            matches.forEach(oldUrl => {
                // この画像がこのASINに関連しているかチェック（簡易的な方法）
                const nearbyContent = getContentAroundUrl(updatedContent, oldUrl, 500);
                if (nearbyContent.includes(asin)) {
                    updatedContent = updatedContent.replace(oldUrl, mapping.newUrl);
                    updateCount++;
                    console.log(`Updated: ${oldUrl} -> ${mapping.newUrl}`);
                }
            });
        }
    });
    
    return {
        content: updatedContent,
        updateCount: updateCount
    };
}

// URL周辺のコンテンツを取得する関数
function getContentAroundUrl(content, url, range = 500) {
    const urlIndex = content.indexOf(url);
    if (urlIndex === -1) return '';
    
    const start = Math.max(0, urlIndex - range);
    const end = Math.min(content.length, urlIndex + url.length + range);
    
    return content.substring(start, end);
}

// より精密な画像URL更新関数（ASINとの関連性を考慮）
function updateImageUrlsWithAsinContext(htmlContent, productInfo) {
    let updatedContent = htmlContent;
    let updateCount = 0;
    const updateLog = [];
    
    // 古いAmazon画像URLパターンを検索
    const oldImagePattern = /https:\/\/m\.media-amazon\.com\/images\/[A-Za-z0-9\/+\-_%.]+\.(jpg|jpeg|png|gif|webp)/gi;
    const matches = [...htmlContent.matchAll(oldImagePattern)];
    
    matches.forEach(match => {
        const oldUrl = match[0];
        const urlPosition = match.index;
        
        // この画像URL周辺のコンテンツを取得
        const contextRange = 1000;
        const contextStart = Math.max(0, urlPosition - contextRange);
        const contextEnd = Math.min(htmlContent.length, urlPosition + oldUrl.length + contextRange);
        const context = htmlContent.substring(contextStart, contextEnd);
        
        // コンテキスト内でASINを検索
        Object.keys(productInfo).forEach(asin => {
            if (context.includes(asin) && productInfo[asin] && productInfo[asin].large) {
                const newUrl = productInfo[asin].large;
                updatedContent = updatedContent.replace(oldUrl, newUrl);
                updateCount++;
                updateLog.push({
                    asin: asin,
                    oldUrl: oldUrl,
                    newUrl: newUrl,
                    position: urlPosition
                });
                console.log(`[${asin}] Updated: ${oldUrl} -> ${newUrl}`);
            }
        });
    });
    
    return {
        content: updatedContent,
        updateCount: updateCount,
        updateLog: updateLog
    };
}

// ディレクトリ内の全HTMLファイルを更新する関数
function updateAllHtmlFiles(inputDirectory, outputDirectory, productInfo) {
    const results = {
        totalFiles: 0,
        updatedFiles: 0,
        totalUpdates: 0,
        fileResults: {}
    };
    
    function processDirectory(inputDir, outputDir) {
        try {
            // 出力ディレクトリを作成
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const files = fs.readdirSync(inputDir);
            
            files.forEach(file => {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(outputDir, file);
                const stat = fs.statSync(inputPath);
                
                if (stat.isDirectory()) {
                    // サブディレクトリを再帰的に処理
                    processDirectory(inputPath, outputPath);
                } else if (file.endsWith('.html')) {
                    // HTMLファイルを処理
                    results.totalFiles++;
                    const relativePath = path.relative(inputDirectory, inputPath);
                    console.log(`\nProcessing: ${relativePath}`);
                    
                    const htmlContent = fs.readFileSync(inputPath, 'utf8');
                    const updateResult = updateImageUrlsWithAsinContext(htmlContent, productInfo);
                    
                    // 更新されたコンテンツを保存
                    fs.writeFileSync(outputPath, updateResult.content, 'utf8');
                    
                    results.fileResults[relativePath] = {
                        updateCount: updateResult.updateCount,
                        updateLog: updateResult.updateLog
                    };
                    
                    if (updateResult.updateCount > 0) {
                        results.updatedFiles++;
                        results.totalUpdates += updateResult.updateCount;
                        console.log(`  ✓ ${updateResult.updateCount} URLs updated`);
                    } else {
                        console.log(`  - No URLs updated`);
                    }
                }
            });
        } catch (error) {
            console.error('Error processing directory:', error);
            throw error;
        }
    }
    
    processDirectory(inputDirectory, outputDirectory);
    
    return results;
}

// バックアップを作成する関数
function createBackup(sourceDirectory, backupDirectory) {
    try {
        if (!fs.existsSync(backupDirectory)) {
            fs.mkdirSync(backupDirectory, { recursive: true });
        }
        
        function copyDirectory(source, backup) {
            const files = fs.readdirSync(source);
            
            files.forEach(file => {
                const sourcePath = path.join(source, file);
                const backupPath = path.join(backup, file);
                const stat = fs.statSync(sourcePath);
                
                if (stat.isDirectory()) {
                    if (!fs.existsSync(backupPath)) {
                        fs.mkdirSync(backupPath, { recursive: true });
                    }
                    copyDirectory(sourcePath, backupPath);
                } else if (file.endsWith('.html')) {
                    fs.copyFileSync(sourcePath, backupPath);
                }
            });
        }
        
        copyDirectory(sourceDirectory, backupDirectory);
        console.log(`Backup created in ${backupDirectory}`);
        return true;
    } catch (error) {
        console.error('Error creating backup:', error);
        return false;
    }
}

// メイン処理関数
async function updateHtmlImageUrls(inputDirectory, outputDirectory, productInfoPath, createBackupFlag = true) {
    try {
        console.log('HTML Image URL Updater');
        console.log('======================');
        console.log(`Input Directory: ${inputDirectory}`);
        console.log(`Output Directory: ${outputDirectory}`);
        console.log(`Product Info: ${productInfoPath}`);
        console.log('');
        
        // バックアップを作成
        if (createBackupFlag) {
            const backupDirectory = path.join(path.dirname(outputDirectory), 'backup-' + Date.now());
            createBackup(inputDirectory, backupDirectory);
        }
        
        // 商品情報を読み込み
        if (!fs.existsSync(productInfoPath)) {
            throw new Error(`Product info file not found: ${productInfoPath}`);
        }
        
        const productInfoData = JSON.parse(fs.readFileSync(productInfoPath, 'utf8'));
        const productInfo = productInfoData.products || productInfoData;
        console.log(`Loaded product info for ${Object.keys(productInfo).length} ASINs`);
        
        // HTMLファイルを更新
        const results = updateAllHtmlFiles(inputDirectory, outputDirectory, productInfo);
        
        // 結果をレポート
        console.log('\n=== Update Results ===');
        console.log(`Total files processed: ${results.totalFiles}`);
        console.log(`Files with updates: ${results.updatedFiles}`);
        console.log(`Total URL updates: ${results.totalUpdates}`);
        
        // 詳細レポートを保存
        const reportPath = path.join(outputDirectory, 'update-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: results.totalFiles,
                updatedFiles: results.updatedFiles,
                totalUpdates: results.totalUpdates
            },
            details: results.fileResults
        }, null, 2));
        
        console.log(`Detailed report saved to: ${reportPath}`);
        
        return results;
        
    } catch (error) {
        console.error('Error in main process:', error);
        throw error;
    }
}

module.exports = {
    updateImageUrlsInHtml,
    updateImageUrlsWithAsinContext,
    updateAllHtmlFiles,
    createBackup,
    updateHtmlImageUrls
};

// 直接実行された場合
if (require.main === module) {
    const inputDir = process.argv[2] || './test-html-files';
    const outputDir = process.argv[3] || './updated-html-files';
    const productInfoPath = process.argv[4] || './output/product-info.json';
    
    updateHtmlImageUrls(inputDir, outputDir, productInfoPath)
        .then(results => {
            console.log('\nHTML update process completed successfully!');
        })
        .catch(error => {
            console.error('HTML update process failed:', error);
        });
}