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
    
    // Find where to insert the product container
    // Look for the end of method feedback section or before the closing main tag
    if (content.includes('</section>')) {
        // Add after the last </section> and before </main>
        content = content.replace(
            /<\/section>\s*<\/main>/,
            `</section>
    
    <h2>おすすめ商品</h2>
    <div id="product-container" class="product-container">
        <!-- 商品はJavaScriptで動的に読み込まれます -->
    </div>
    
    </main>`
        );
    } else {
        // Alternative: add before </main>
        content = content.replace(
            /<\/main>/,
            `
    <h2>おすすめ商品</h2>
    <div id="product-container" class="product-container">
        <!-- 商品はJavaScriptで動的に読み込まれます -->
    </div>
    
    </main>`
        );
    }
    
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