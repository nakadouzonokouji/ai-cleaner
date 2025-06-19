#!/usr/bin/env node

const fs = require('fs');
const products = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

console.log('=== m.media-amazon.com形式の商品 ===\n');

const mMediaProducts = products.products.filter(p => p.image.includes('m.media-amazon.com'));

mMediaProducts.forEach((product, index) => {
    console.log(`${index + 1}. カテゴリ: ${product.category}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   名前: ${product.name}`);
    console.log(`   画像: ${product.image}`);
    console.log('');
});