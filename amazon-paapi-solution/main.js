#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { processAsinsInBatches } = require('./paapi-sdk');
const { extractAsinsFromDirectory } = require('./asin-extractor');
const { updateHtmlImageUrls } = require('./html-updater');

// コマンドライン引数の解析
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        inputDir: null,
        outputDir: null,
        mode: 'full', // 'extract', 'fetch', 'update', 'full'
        batchSize: 10,
        delay: 2000,
        backup: true,
        dryRun: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--input':
            case '-i':
                options.inputDir = args[++i];
                break;
            case '--output':
            case '-o':
                options.outputDir = args[++i];
                break;
            case '--mode':
            case '-m':
                options.mode = args[++i];
                break;
            case '--batch-size':
                options.batchSize = parseInt(args[++i]);
                break;
            case '--delay':
                options.delay = parseInt(args[++i]);
                break;
            case '--no-backup':
                options.backup = false;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
                break;
            default:
                if (!options.inputDir) {
                    options.inputDir = args[i];
                } else if (!options.outputDir) {
                    options.outputDir = args[i];
                }
                break;
        }
    }
    
    return options;
}

// ヘルプメッセージを表示
function showHelp() {
    console.log(`
Amazon PA-API Image URL Updater
===============================

Usage: node main.js [options] <input-directory> [output-directory]

Options:
  -i, --input <dir>       Input directory containing HTML files
  -o, --output <dir>      Output directory for updated files
  -m, --mode <mode>       Processing mode: extract|fetch|update|full (default: full)
  --batch-size <size>     API batch size (default: 10)
  --delay <ms>            Delay between API calls in milliseconds (default: 2000)
  --no-backup             Skip creating backup files
  --dry-run               Show what would be done without making changes
  -h, --help              Show this help message

Modes:
  extract    Extract ASINs from HTML files only
  fetch      Fetch product information from PA-API only
  update     Update HTML files with existing product info only
  full       Complete process: extract -> fetch -> update

Environment Variables:
  AMAZON_ACCESS_KEY       Your Amazon PA-API access key
  AMAZON_SECRET_KEY       Your Amazon PA-API secret key
  AMAZON_ASSOCIATE_TAG    Your Amazon Associate tag

Examples:
  node main.js ./html-files ./updated-files
  node main.js --mode extract ./html-files
  node main.js --mode update ./html-files ./updated-files
  node main.js --dry-run ./html-files ./updated-files
`);
}

// 環境変数をチェック
function checkEnvironment() {
    const required = ['AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY', 'AMAZON_ASSOCIATE_TAG'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('Error: Missing required environment variables:');
        missing.forEach(key => console.error(`  - ${key}`));
        console.error('\nPlease set these variables in your .env file or environment.');
        return false;
    }
    
    return true;
}

// ASIN抽出モード
async function extractMode(inputDir, outputDir) {
    console.log('=== ASIN Extraction Mode ===');
    
    const { allAsins, fileAsins } = extractAsinsFromDirectory(inputDir);
    
    const asinListPath = path.join(outputDir, 'extracted-asins.json');
    fs.writeFileSync(asinListPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalAsins: allAsins.length,
        allAsins: allAsins,
        fileAsins: fileAsins
    }, null, 2));
    
    console.log(`✓ Extracted ${allAsins.length} unique ASINs`);
    console.log(`✓ Results saved to: ${asinListPath}`);
    
    return { asins: allAsins, fileAsins: fileAsins };
}

// 商品情報取得モード
async function fetchMode(outputDir, asins, batchSize, delay) {
    console.log('=== Product Information Fetch Mode ===');
    
    if (!checkEnvironment()) {
        throw new Error('Environment check failed');
    }
    
    console.log(`Fetching product information for ${asins.length} ASINs...`);
    console.log(`Batch size: ${batchSize}, Delay: ${delay}ms`);
    
    const productInfo = await processAsinsInBatches(asins, batchSize, delay);
    
    const productInfoPath = path.join(outputDir, 'product-info.json');
    fs.writeFileSync(productInfoPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalProducts: Object.keys(productInfo).length,
        products: productInfo
    }, null, 2));
    
    console.log(`✓ Fetched information for ${Object.keys(productInfo).length} products`);
    console.log(`✓ Results saved to: ${productInfoPath}`);
    
    return productInfo;
}

// HTML更新モード
async function updateMode(inputDir, outputDir, productInfoPath, backup) {
    console.log('=== HTML Update Mode ===');
    
    if (!fs.existsSync(productInfoPath)) {
        throw new Error(`Product info file not found: ${productInfoPath}`);
    }
    
    const productInfoData = JSON.parse(fs.readFileSync(productInfoPath, 'utf8'));
    const productInfo = productInfoData.products || productInfoData;
    
    const results = await updateHtmlImageUrls(inputDir, outputDir, productInfoPath, backup);
    
    console.log(`✓ Updated ${results.totalUpdates} URLs in ${results.updatedFiles} files`);
    
    return results;
}

// メイン処理
async function main() {
    try {
        const options = parseArguments();
        
        if (!options.inputDir) {
            console.error('Error: Input directory is required');
            showHelp();
            process.exit(1);
        }
        
        if (!options.outputDir) {
            options.outputDir = path.join(path.dirname(options.inputDir), 'amazon-paapi-output');
        }
        
        // 出力ディレクトリを作成
        if (!fs.existsSync(options.outputDir)) {
            fs.mkdirSync(options.outputDir, { recursive: true });
        }
        
        console.log('Amazon PA-API Image URL Updater');
        console.log('===============================');
        console.log(`Input Directory: ${options.inputDir}`);
        console.log(`Output Directory: ${options.outputDir}`);
        console.log(`Mode: ${options.mode}`);
        console.log(`Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
        console.log('');
        
        if (options.dryRun) {
            console.log('DRY RUN MODE - No changes will be made');
            console.log('');
        }
        
        let asins = [];
        let productInfo = {};
        
        // モードに応じた処理
        switch (options.mode) {
            case 'extract':
                await extractMode(options.inputDir, options.outputDir);
                break;
                
            case 'fetch':
                // 既存のASINリストを読み込み
                const asinListPath = path.join(options.outputDir, 'extracted-asins.json');
                if (!fs.existsSync(asinListPath)) {
                    throw new Error(`ASIN list not found: ${asinListPath}. Run extract mode first.`);
                }
                const asinData = JSON.parse(fs.readFileSync(asinListPath, 'utf8'));
                asins = asinData.allAsins || asinData;
                
                if (!options.dryRun) {
                    await fetchMode(options.outputDir, asins, options.batchSize, options.delay);
                }
                break;
                
            case 'update':
                const productInfoPath = path.join(options.outputDir, 'product-info.json');
                if (!options.dryRun) {
                    await updateMode(options.inputDir, options.outputDir, productInfoPath, options.backup);
                }
                break;
                
            case 'full':
            default:
                // 完全処理
                const extractResult = await extractMode(options.inputDir, options.outputDir);
                asins = extractResult.asins;
                
                if (asins.length > 0 && !options.dryRun) {
                    productInfo = await fetchMode(options.outputDir, asins, options.batchSize, options.delay);
                    
                    const productInfoPath = path.join(options.outputDir, 'product-info.json');
                    await updateMode(options.inputDir, options.outputDir, productInfoPath, options.backup);
                }
                break;
        }
        
        console.log('\n✅ Process completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Process failed:', error.message);
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// 直接実行された場合
if (require.main === module) {
    main();
}

module.exports = {
    main,
    extractMode,
    fetchMode,
    updateMode
};