const fs = require('fs');
const path = require('path');
const { updateHTMLFile } = require('./generate-page-html');
const { LOCATIONS } = require('./collect-all-products');

/**
 * すべてのHTMLファイルを更新
 */
function updateAllHTMLFiles() {
    console.log('Starting HTML files update...\n');
    let updatedCount = 0;
    let errorCount = 0;
    
    // 各場所のディレクトリをスキャン
    Object.keys(LOCATIONS).forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        
        if (!fs.existsSync(locationPath)) {
            console.log(`⚠️  Directory not found: ${location}`);
            return;
        }
        
        console.log(`\n=== Processing ${location} ===`);
        
        // HTMLファイルを検索
        const files = fs.readdirSync(locationPath);
        files.forEach(file => {
            // -light.html または -heavy.html のパターンに一致するファイルのみ処理
            if (file.match(/-(light|heavy)\.html$/)) {
                const filePath = path.join(location, file);
                
                try {
                    if (updateHTMLFile(filePath)) {
                        updatedCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error updating ${filePath}:`, error.message);
                    errorCount++;
                }
            }
        });
    });
    
    console.log('\n=== Update Summary ===');
    console.log(`✅ Successfully updated: ${updatedCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📁 Total processed: ${updatedCount + errorCount} files`);
}

/**
 * 特定の場所のHTMLファイルのみ更新
 */
function updateLocationHTMLFiles(location) {
    console.log(`Updating HTML files in ${location}...\n`);
    
    const locationPath = path.join(__dirname, '..', location);
    
    if (!fs.existsSync(locationPath)) {
        console.error(`Directory not found: ${location}`);
        return;
    }
    
    const files = fs.readdirSync(locationPath);
    let updatedCount = 0;
    
    files.forEach(file => {
        if (file.match(/-(light|heavy)\.html$/)) {
            const filePath = path.join(location, file);
            
            try {
                if (updateHTMLFile(filePath)) {
                    updatedCount++;
                }
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
    
    console.log(`\n✅ Updated ${updatedCount} files in ${location}`);
}

/**
 * ドライラン（実際の更新なしでチェックのみ）
 */
function dryRun() {
    console.log('Dry run - checking all HTML files...\n');
    let totalFiles = 0;
    
    Object.keys(LOCATIONS).forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        
        if (!fs.existsSync(locationPath)) {
            console.log(`⚠️  Directory not found: ${location}`);
            return;
        }
        
        const files = fs.readdirSync(locationPath);
        const htmlFiles = files.filter(f => f.match(/-(light|heavy)\.html$/));
        
        if (htmlFiles.length > 0) {
            console.log(`${location}/`);
            htmlFiles.forEach(file => {
                console.log(`  - ${file}`);
                totalFiles++;
            });
        }
    });
    
    console.log(`\nTotal HTML files to update: ${totalFiles}`);
}

// CLIサポート
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--dry-run')) {
        dryRun();
    } else if (args.includes('--location')) {
        const locationIndex = args.indexOf('--location');
        const location = args[locationIndex + 1];
        if (location) {
            updateLocationHTMLFiles(location);
        } else {
            console.error('Location not specified');
        }
    } else {
        // マスターデータが存在するかチェック
        const masterDataPath = path.join(__dirname, '..', 'products-master-complete.json');
        if (!fs.existsSync(masterDataPath)) {
            console.error('❌ Master data not found!');
            console.error('Run "node scripts/collect-all-products.js" first to generate master data.');
            process.exit(1);
        }
        
        updateAllHTMLFiles();
    }
}

module.exports = {
    updateAllHTMLFiles,
    updateLocationHTMLFiles,
    dryRun
};