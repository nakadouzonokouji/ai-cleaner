const fs = require('fs').promises;
const path = require('path');

async function debugASINExtraction(htmlFile) {
    try {
        const html = await fs.readFile(htmlFile, 'utf8');
        console.log(`\n=== Analyzing: ${path.basename(htmlFile)} ===`);
        
        // すべてのAmazonリンクを見つける
        const amazonLinks = html.match(/https?:\/\/www\.amazon\.co\.jp[^"'\s<>]*/g) || [];
        console.log(`\nFound ${amazonLinks.length} Amazon links`);
        
        // 各リンクからASINを抽出
        const asinsFromLinks = new Set();
        amazonLinks.forEach(link => {
            // /dp/ASIN形式
            const dpMatch = link.match(/\/dp\/([A-Z0-9]{10})/i);
            if (dpMatch) {
                asinsFromLinks.add(dpMatch[1]);
            }
            
            // /gp/product/ASIN形式
            const gpMatch = link.match(/\/gp\/product\/([A-Z0-9]{10})/i);
            if (gpMatch) {
                asinsFromLinks.add(gpMatch[1]);
            }
        });
        
        console.log(`\nASINs from links: ${Array.from(asinsFromLinks).join(', ')}`);
        
        // 画像URLを分析
        const imageUrls = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
        console.log(`\nFound ${imageUrls.length} images`);
        
        // Amazon画像URLのパターンを確認
        const amazonImages = imageUrls.filter(img => img.includes('amazon.com') || img.includes('media-amazon.com'));
        console.log(`Amazon images: ${amazonImages.length}`);
        
        if (amazonImages.length > 0) {
            console.log('\nSample Amazon image tags:');
            amazonImages.slice(0, 3).forEach(img => {
                console.log(`  ${img.substring(0, 100)}...`);
            });
        }
        
        // 誤って抽出される可能性のあるパターンを確認
        const suspiciousPatterns = html.match(/[^A-Z0-9]([A-Z0-9]{10})[^A-Z0-9]/g) || [];
        const uniquePatterns = new Set();
        suspiciousPatterns.forEach(pattern => {
            const match = pattern.match(/([A-Z0-9]{10})/);
            if (match) {
                uniquePatterns.add(match[1]);
            }
        });
        
        console.log(`\nPotential false positives: ${Array.from(uniquePatterns).join(', ')}`);
        
        // 有効なASINのみをフィルタ
        const validASINs = Array.from(asinsFromLinks).filter(asin => {
            // 通常、ASINは'B'で始まることが多い
            return /^[A-Z0-9]{10}$/.test(asin) && (asin.startsWith('B') || asin.match(/^[0-9]/));
        });
        
        console.log(`\nValid ASINs: ${validASINs.join(', ')}`);
        
        return validASINs;
        
    } catch (error) {
        console.error(`Error processing ${htmlFile}:`, error.message);
        return [];
    }
}

async function analyzeDirectory(dir) {
    try {
        const files = await fs.readdir(dir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        
        console.log(`Analyzing ${htmlFiles.length} HTML files in ${dir}\n`);
        
        const allASINs = new Set();
        
        for (const file of htmlFiles.slice(0, 3)) { // 最初の3ファイルのみ分析
            const filePath = path.join(dir, file);
            const asins = await debugASINExtraction(filePath);
            asins.forEach(asin => allASINs.add(asin));
        }
        
        console.log('\n=== Summary ===');
        console.log(`Total unique ASINs found: ${allASINs.size}`);
        console.log(`ASINs: ${Array.from(allASINs).join(', ')}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// コマンドライン引数から対象ディレクトリを取得
const targetDir = process.argv[2] || '../bathroom';
analyzeDirectory(targetDir);