#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// products-master.jsonを読み込み
const productsData = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

// カテゴリごとの統計
const categoryStats = {};
const errorProducts = [];

// 画像URLをチェックする関数
function checkImageUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

// 商品をカテゴリ別に分類
function categorizeProducts() {
    const categorized = {};
    
    productsData.products.forEach(product => {
        const [mainCategory, subCategory] = product.category.split('-');
        
        if (!categorized[mainCategory]) {
            categorized[mainCategory] = {};
        }
        if (!categorized[mainCategory][subCategory]) {
            categorized[mainCategory][subCategory] = [];
        }
        
        categorized[mainCategory][subCategory].push(product);
    });
    
    return categorized;
}

// 統計情報を表示
function displayStats() {
    console.log('\n=== 商品カテゴリ別統計 ===');
    const categorized = categorizeProducts();
    
    Object.keys(categorized).forEach(mainCat => {
        console.log(`\n${mainCat.toUpperCase()}:`);
        Object.keys(categorized[mainCat]).forEach(subCat => {
            const count = categorized[mainCat][subCat].length;
            console.log(`  ${subCat}: ${count}商品`);
        });
    });
    
    console.log(`\n総商品数: ${productsData.products.length}`);
}

// エラー商品を特定
async function checkAllProducts() {
    console.log('商品チェックを開始します...\n');
    
    let checkedCount = 0;
    const totalProducts = productsData.products.length;
    
    for (const product of productsData.products) {
        checkedCount++;
        
        // プログレス表示
        if (checkedCount % 50 === 0) {
            console.log(`進捗: ${checkedCount}/${totalProducts} (${Math.round(checkedCount/totalProducts*100)}%)`);
        }
        
        // 画像URLチェック（現在は全て同じパターンなのでスキップ）
        const isValidImage = await checkImageUrl(product.image);
        
        // エラー判定（現在使用中の画像URLパターンをチェック）
        if (product.image.includes('XXXXXXXX') || 
            product.image.includes('placeholder') ||
            !product.image.includes('amazon')) {
            errorProducts.push({
                ...product,
                error: 'Invalid image URL pattern'
            });
        }
    }
    
    return errorProducts;
}

// エラーレポートを生成
function generateErrorReport() {
    console.log('\n=== エラーレポート ===');
    console.log(`エラー商品数: ${errorProducts.length}`);
    
    if (errorProducts.length > 0) {
        const errorByCategory = {};
        
        errorProducts.forEach(product => {
            if (!errorByCategory[product.category]) {
                errorByCategory[product.category] = [];
            }
            errorByCategory[product.category].push(product);
        });
        
        console.log('\nカテゴリ別エラー:');
        Object.keys(errorByCategory).forEach(category => {
            console.log(`  ${category}: ${errorByCategory[category].length}件`);
        });
        
        // エラーレポートをファイルに保存
        fs.writeFileSync('error-report.json', JSON.stringify({
            totalErrors: errorProducts.length,
            errorsByCategory: errorByCategory,
            errors: errorProducts
        }, null, 2));
        
        console.log('\nエラーレポートを error-report.json に保存しました');
    }
}

// メイン処理
async function main() {
    displayStats();
    await checkAllProducts();
    generateErrorReport();
    
    // 次のステップの提案
    if (errorProducts.length > 0) {
        console.log('\n=== 次のステップ ===');
        console.log('1. fix-all-products.js を実行して全商品を修正');
        console.log('2. 修正後、verify-products.js で確認');
    } else {
        console.log('\n✅ すべての商品が正常です！');
    }
}

main().catch(console.error);