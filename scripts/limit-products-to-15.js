const fs = require('fs');
const path = require('path');

// 処理するページのリスト
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
    // キッチン（ih-heavy.htmlは既に正しいのでスキップ）
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

function processFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // おすすめ商品のh2タグを探す
    const productHeaderIndex = content.indexOf('<h2>おすすめ商品</h2>');
    if (productHeaderIndex === -1) {
        console.log(`No products section found in: ${filePath}`);
        return;
    }
    
    // セクションの開始位置を探す（h2の前の<div class="section">を探す）
    const sectionStart = content.lastIndexOf('<div class="section">', productHeaderIndex);
    if (sectionStart === -1) {
        console.log(`No section div found in: ${filePath}`);
        return;
    }
    
    // 次のセクションまたはbody終了タグを探す
    const nextSectionIndex = content.indexOf('<div class="section', productHeaderIndex + 1);
    const bodyEndIndex = content.indexOf('</body>', productHeaderIndex);
    const sectionEnd = nextSectionIndex !== -1 && nextSectionIndex < bodyEndIndex ? nextSectionIndex : bodyEndIndex;
    
    // 商品セクションを抽出
    const productSection = content.substring(sectionStart, sectionEnd);
    
    // 各カテゴリーの商品を制限
    let modifiedSection = productSection;
    
    // カテゴリーごとに処理
    const categories = ['洗剤・クリーナー', '掃除道具', '保護具'];
    
    categories.forEach(categoryName => {
        const categoryHeaderIndex = modifiedSection.indexOf(`<h3>${categoryName}</h3>`);
        if (categoryHeaderIndex === -1) return;
        
        // 次のh3タグまたはセクション終了を探す
        const nextH3Index = modifiedSection.indexOf('<h3>', categoryHeaderIndex + 1);
        const categoryEndIndex = nextH3Index !== -1 ? nextH3Index : modifiedSection.length;
        
        // カテゴリー内の商品を探す
        const categoryContent = modifiedSection.substring(categoryHeaderIndex, categoryEndIndex);
        
        // product-cardの数を数える
        const productCards = categoryContent.match(/<div class="product-card">[\s\S]*?<\/a>\s*<\/div>/g) || [];
        
        if (productCards.length > 5) {
            // 最初の5つだけを保持
            const limitedProducts = productCards.slice(0, 5);
            
            // product-grid-innerの中身を置き換える
            const gridStart = categoryContent.indexOf('<div class="product-grid-inner">');
            const gridEnd = categoryContent.lastIndexOf('</div>\n            </div>');
            
            if (gridStart !== -1 && gridEnd !== -1) {
                const newGridContent = '<div class="product-grid-inner">\n' + 
                    limitedProducts.join('\n') + 
                    '\n                </div>\n            </div>';
                
                const newCategoryContent = categoryContent.substring(0, gridStart) + 
                    newGridContent + 
                    categoryContent.substring(gridEnd + '</div>\n            </div>'.length);
                
                modifiedSection = modifiedSection.replace(categoryContent, newCategoryContent);
            }
        }
        
        console.log(`${filePath} - ${categoryName}: ${Math.min(productCards.length, 5)} products`);
    });
    
    // 元のコンテンツを更新
    content = content.substring(0, sectionStart) + modifiedSection + content.substring(sectionEnd);
    
    // 「必要な掃除アイテム」セクションを削除
    const unnecessaryIndex = content.indexOf('<h2>必要な掃除アイテム</h2>');
    if (unnecessaryIndex !== -1) {
        const unnecessaryStart = content.lastIndexOf('<div class="section">', unnecessaryIndex);
        const unnecessaryEnd = content.indexOf('</div>', unnecessaryIndex) + 6;
        content = content.substring(0, unnecessaryStart) + content.substring(unnecessaryEnd);
        console.log(`Removed unnecessary section from ${filePath}`);
    }
    
    // ファイルを保存
    fs.writeFileSync(fullPath, content, 'utf8');
}

// メイン処理
console.log('Limiting all pages to 15 products (5 per category)...\n');

pages.forEach((page, index) => {
    try {
        processFile(page);
    } catch (error) {
        console.error(`Error processing ${page}:`, error.message);
    }
});

console.log('\nProcessing complete!');