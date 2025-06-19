#\!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Add debugging to loadProducts function in all HTML files
function addDebugging(htmlFile) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Add console logging to the loadProducts function
    content = content.replace(
        /async function loadProducts\(\) {/,
        `async function loadProducts() {
    console.log('Loading products from:', '../products-master.json');
    console.log('Current page:', window.location.pathname);`
    );
    
    // Add error details
    content = content.replace(
        /console\.error\('商品データの読み込みに失敗しました:', error\);/,
        `console.error('商品データの読み込みに失敗しました:', error);
        console.error('詳細:', error.message, error.stack);`
    );
    
    // Add success logging
    content = content.replace(
        /return data\.products;/,
        `console.log('商品データ読み込み成功:', data.products.length, '個の商品');
        return data.products;`
    );
    
    fs.writeFileSync(htmlFile, content, 'utf8');
}

// Process all HTML files
const folders = ['kitchen', 'bathroom', 'floor', 'living', 'toilet', 'window'];
folders.forEach(folder => {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.html') && f \!== 'index.html');
    files.forEach(file => {
        const fullPath = path.join(folder, file);
        console.log('Adding debug to:', fullPath);
        addDebugging(fullPath);
    });
});

console.log('Debug code added to all files');
