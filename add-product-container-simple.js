#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Add product container div to HTML files
function addProductContainer(htmlFile) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Check if product-container already exists
    if (content.includes('id="product-container"')) {
        console.log(`✓ ${htmlFile} already has product-container`);
        return;
    }
    
    // Find where to insert - before the first script tag that contains displayProducts
    const scriptIndex = content.indexOf('// ページ読み込み時に商品を表示');
    if (scriptIndex === -1) {
        console.log(`⚠️  ${htmlFile} - couldn't find insertion point`);
        return;
    }
    
    // Find the script tag that contains this
    const beforeScript = content.lastIndexOf('<script>', scriptIndex);
    
    // Insert the product container before this script tag
    const productSection = `
    <h2>おすすめ商品</h2>
    <div id="product-container" class="product-container">
        <!-- 商品はJavaScriptで動的に読み込まれます -->
    </div>

    `;
    
    content = content.slice(0, beforeScript) + productSection + content.slice(beforeScript);
    
    fs.writeFileSync(htmlFile, content, 'utf8');
    console.log(`✅ Added product-container to ${htmlFile}`);
}

// Process all HTML files
const folders = ['kitchen', 'bathroom', 'floor', 'living', 'toilet', 'window'];
folders.forEach(folder => {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.html') && f !== 'index.html');
    files.forEach(file => {
        const fullPath = path.join(folder, file);
        addProductContainer(fullPath);
    });
});

console.log('\nDone! All files processed.');