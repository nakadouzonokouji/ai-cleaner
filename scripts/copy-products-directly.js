const fs = require('fs');
const path = require('path');

// ih-heavy.htmlの商品セクションを読み込む
const ihHeavyPath = path.join(__dirname, '..', 'kitchen', 'ih-heavy.html');
const ihHeavyContent = fs.readFileSync(ihHeavyPath, 'utf8');

// おすすめ商品セクションを抽出
const productStartMatch = ihHeavyContent.match(/<div class="section">\s*<h2>おすすめ商品<\/h2>/);
if (!productStartMatch) {
    console.error('Could not find products section in ih-heavy.html');
    process.exit(1);
}

const startIndex = productStartMatch.index;
const afterProducts = ihHeavyContent.substring(startIndex);
const feedbackMatch = afterProducts.match(/<div class="section method-feedback">/);

if (!feedbackMatch) {
    console.error('Could not find end of products section');
    process.exit(1);
}

const productsSection = afterProducts.substring(0, feedbackMatch.index);

console.log('Extracted products section:', productsSection.length, 'characters');

// 全ページのリスト
const pages = [
    // バスルーム
    'bathroom/bathtub-heavy.html',
    'bathroom/bathtub-light.html',
    'bathroom/drain-heavy.html',
    'bathroom/drain-light.html',
    'bathroom/shower-heavy.html',
    'bathroom/shower-light.html',
    'bathroom/toilet-heavy.html',
    'bathroom/toilet-light.html',
    'bathroom/ventilation-heavy.html',
    'bathroom/ventilation-light.html',
    'bathroom/washstand-heavy.html',
    'bathroom/washstand-light.html',
    // 床
    'floor/carpet-heavy.html',
    'floor/carpet-light.html',
    'floor/flooring-heavy.html',
    'floor/flooring-light.html',
    'floor/tatami-heavy.html',
    'floor/tatami-light.html',
    'floor/tile-heavy.html',
    'floor/tile-light.html',
    // キッチン（ih-heavy.htmlはスキップ）
    'kitchen/gas-heavy.html',
    'kitchen/gas-light.html',
    'kitchen/ih-light.html',
    'kitchen/sink-heavy.html',
    'kitchen/sink-light.html',
    'kitchen/ventilation-heavy.html',
    'kitchen/ventilation-light.html',
    // リビング
    'living/carpet-heavy.html',
    'living/carpet-light.html',
    'living/sofa-heavy.html',
    'living/sofa-light.html',
    'living/table-heavy.html',
    'living/table-light.html',
    'living/wall-heavy.html',
    'living/wall-light.html',
    // トイレ
    'toilet/floor-heavy.html',
    'toilet/floor-light.html',
    'toilet/toilet-heavy.html',
    'toilet/toilet-light.html',
    // 窓
    'window/glass-heavy.html',
    'window/glass-light.html',
    'window/sash-heavy.html',
    'window/sash-light.html'
];

pages.forEach((pagePath, index) => {
    const fullPath = path.join(__dirname, '..', pagePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 既存のおすすめ商品セクションを探す
    const existingMatch = content.match(/<div class="section">\s*<h2>おすすめ商品<\/h2>/);
    
    if (existingMatch) {
        const existingStart = existingMatch.index;
        const afterExisting = content.substring(existingStart);
        const existingEndMatch = afterExisting.match(/<div class="section method-feedback">|<\/div>\s*<\/body>/);
        
        if (existingEndMatch) {
            // 既存のセクションを新しいもので置き換え
            const existingEnd = existingStart + existingEndMatch.index;
            content = content.substring(0, existingStart) + productsSection + content.substring(existingEnd);
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated: ${pagePath}`);
        }
    } else {
        console.log(`No products section found in: ${pagePath}`);
    }
});