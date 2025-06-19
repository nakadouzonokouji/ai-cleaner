#!/usr/bin/env node

const fs = require('fs');

// products-master.jsonを読み込み
const productsData = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

// 問題のある商品を特定
const problemProducts = [];

productsData.products.forEach((product, index) => {
    const problems = [];
    
    // 画像URLのパターンチェック
    if (product.image.includes('XXXXXXXX') || 
        product.image.includes('placeholder') ||
        product.image.includes('71placeholder') ||
        !product.image.includes('.jpg') ||
        !product.image.includes('amazon')) {
        problems.push('Invalid image URL');
    }
    
    // 無効なASINパターン
    if (product.id.length !== 10 || !product.id.startsWith('B')) {
        problems.push('Invalid ASIN');
    }
    
    // 価格チェック
    if (product.price < 100 || product.price > 100000) {
        problems.push('Unrealistic price');
    }
    
    if (problems.length > 0) {
        problemProducts.push({
            index,
            ...product,
            problems
        });
    }
});

// カテゴリ別に集計
const problemsByCategory = {};
problemProducts.forEach(product => {
    if (!problemsByCategory[product.category]) {
        problemsByCategory[product.category] = 0;
    }
    problemsByCategory[product.category]++;
});

// レポート出力
console.log('=== 商品データチェック結果 ===');
console.log(`総商品数: ${productsData.products.length}`);
console.log(`問題のある商品数: ${problemProducts.length}`);
console.log(`問題率: ${(problemProducts.length / productsData.products.length * 100).toFixed(1)}%`);

console.log('\n=== カテゴリ別問題商品数 ===');
Object.entries(problemsByCategory).sort().forEach(([category, count]) => {
    console.log(`${category}: ${count}件`);
});

// 問題商品の詳細を保存
fs.writeFileSync('problem-products.json', JSON.stringify({
    totalProducts: productsData.products.length,
    problemCount: problemProducts.length,
    problemsByCategory,
    products: problemProducts
}, null, 2));

console.log('\n詳細は problem-products.json に保存されました');

// サンプル表示
console.log('\n=== 問題商品のサンプル（最初の5件）===');
problemProducts.slice(0, 5).forEach(product => {
    console.log(`\n商品ID: ${product.id}`);
    console.log(`カテゴリ: ${product.category}`);
    console.log(`問題: ${product.problems.join(', ')}`);
    console.log(`画像URL: ${product.image}`);
});