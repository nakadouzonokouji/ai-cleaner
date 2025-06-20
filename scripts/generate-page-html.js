const { getProductsForPage, LOCATIONS } = require('./collect-all-products');

/**
 * 商品HTMLを生成
 */
function generateProductHTML(product) {
    return `    <div class="product-card">
        <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.title}</h4>
        <div class="product-rating">
            <span class="stars">★${product.rating.toFixed(1)}</span>
        </div>
        <p class="price">${product.price}</p>
        <a href="https://www.amazon.co.jp/dp/${product.asin}?tag=asdfghj12-22" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

/**
 * カテゴリ別商品セクションを生成
 */
function generateCategorySection(categoryName, products) {
    if (!products || products.length === 0) {
        return '';
    }
    
    const categoryNameJa = {
        cleaners: '洗剤',
        tools: '道具',
        protection: '保護具'
    }[categoryName] || categoryName;
    
    let html = `            <h3>${categoryNameJa}</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;
    
    products.forEach(product => {
        html += generateProductHTML(product) + '\n';
    });
    
    html += `                </div>
            </div>
`;
    
    return html;
}

/**
 * ページ用の完全な商品セクションHTMLを生成
 */
function generateProductSectionHTML(location, area, level) {
    const products = getProductsForPage(location, area, level);
    
    let html = `        <div class="section">
            <h2>必要な掃除アイテム</h2>
`;
    
    // 各カテゴリのHTMLを生成
    html += generateCategorySection('cleaners', products.cleaners);
    html += generateCategorySection('tools', products.tools);
    html += generateCategorySection('protection', products.protection);
    
    html += `        </div>`;
    
    return html;
}

/**
 * ファイルパスから場所・エリア・レベルを推測
 */
function parsePageInfo(filePath) {
    // 例: kitchen/ih-heavy.html -> { location: 'kitchen', area: 'ih', level: 'heavy' }
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const location = parts[parts.length - 2];
    
    // ファイル名からエリアとレベルを抽出
    const match = fileName.match(/^(.+)-(light|heavy)\.html$/);
    if (match) {
        return {
            location: location,
            area: match[1],
            level: match[2]
        };
    }
    
    return null;
}

/**
 * 特定のHTMLファイルを更新
 */
function updateHTMLFile(filePath) {
    const fs = require('fs');
    const pageInfo = parsePageInfo(filePath);
    
    if (!pageInfo) {
        console.error(`Cannot parse page info from: ${filePath}`);
        return false;
    }
    
    try {
        // 現在のHTMLを読み込み
        let html = fs.readFileSync(filePath, 'utf8');
        
        // 商品セクションを生成
        const newProductSection = generateProductSectionHTML(
            pageInfo.location,
            pageInfo.area,
            pageInfo.level
        );
        
        // 既存の商品セクションを置き換え
        // パターン: <div class="section">...<h2>必要な掃除アイテム</h2>...</div>
        const sectionRegex = /<div class="section">\s*<h2>必要な掃除アイテム<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|$)/;
        
        if (sectionRegex.test(html)) {
            html = html.replace(sectionRegex, newProductSection + '\n        ');
        } else {
            // セクションが見つからない場合は、method-feedbackの前に挿入
            const feedbackRegex = /<div class="section method-feedback">/;
            if (feedbackRegex.test(html)) {
                html = html.replace(feedbackRegex, newProductSection + '\n        \n        <div class="section method-feedback">');
            } else {
                console.error(`Cannot find insertion point in: ${filePath}`);
                return false;
            }
        }
        
        // ファイルを保存
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        return true;
        
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
        return false;
    }
}

/**
 * デバッグ用: 特定ページの商品HTMLを表示
 */
function debugPageProducts(location, area, level) {
    console.log(`\n=== ${location}/${area}-${level}.html ===`);
    const html = generateProductSectionHTML(location, area, level);
    console.log(html);
}

// 実行例
if (require.main === module) {
    // 例: kitchen/ih-heavy.htmlの商品セクションを生成
    console.log('Example product section HTML:');
    debugPageProducts('kitchen', 'ih', 'heavy');
    
    // 実際のファイル更新例（コメントアウト）
    // updateHTMLFile('kitchen/ih-heavy.html');
}

module.exports = {
    generateProductHTML,
    generateCategorySection,
    generateProductSectionHTML,
    parsePageInfo,
    updateHTMLFile,
    debugPageProducts
};