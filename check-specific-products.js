#!/usr/bin/env node

const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

// 問題のあるカテゴリをチェック
const problemCategories = ['kitchen-ih-heavy', 'bathroom-drain-heavy'];

console.log('=== 問題のある商品の詳細 ===\n');

problemCategories.forEach(category => {
    console.log(`\nカテゴリ: ${category}`);
    console.log('='.repeat(50));
    
    const categoryProducts = products.products.filter(p => p.category === category);
    
    categoryProducts.forEach((product, index) => {
        console.log(`\n商品 ${index + 1}:`);
        console.log(`  ID: ${product.id}`);
        console.log(`  名前: ${product.name}`);
        console.log(`  画像URL: ${product.image}`);
        console.log(`  画像形式: ${product.image.includes('m.media-amazon.com') ? 'M.MEDIA形式(問題あり)' : 'IMAGES-NA形式(OK)'}`);
        console.log(`  購入URL: ${product.url}`);
    });
});

// 画像URL形式の統計
const urlStats = {
    mMedia: 0,
    imagesNa: 0
};

products.products.forEach(product => {
    if (product.image.includes('m.media-amazon.com')) {
        urlStats.mMedia++;
    } else if (product.image.includes('images-na.ssl-images-amazon.com')) {
        urlStats.imagesNa++;
    }
});

console.log('\n\n=== 画像URL形式の統計 ===');
console.log(`m.media-amazon.com形式: ${urlStats.mMedia}個`);
console.log(`images-na形式: ${urlStats.imagesNa}個`);