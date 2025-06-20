const fs = require('fs');
const path = require('path');

// products-master.jsonを読み込み
const productsData = JSON.parse(fs.readFileSync('products-master.json', 'utf8'));

function generateProductHTML(product) {
    const rating = product.rating || { score: 0, count: 0 };
    const ratingStars = rating.score > 0 ? `★${rating.score}` : '';
    const reviewCount = rating.count > 0 ? `(${rating.count.toLocaleString()})` : '';
    
    return `    <div class="product-card">
        <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.title}</h4>
        <div class="product-rating">
            <span class="stars">${ratingStars}</span>
            <span class="review-count">${reviewCount}</span>
        </div>
        <p class="price">${product.priceDisplay || product.price}</p>
        <a href="${product.link}?tag=asdfghj12-22" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

function updateHTMLFile(filePath) {
    try {
        // ファイル名から情報を解析
        const basename = path.basename(filePath);
        const dirname = path.dirname(filePath);
        const location = path.basename(dirname);
        
        const match = basename.match(/^(.+?)-(light|heavy)\.html$/);
        if (!match) {
            console.log(`⚠️  Skipping non-matching file: ${filePath}`);
            return false;
        }
        
        const area = match[1];
        const level = match[2];
        
        // 対象の商品を検索
        const targetProducts = productsData.products.filter(p => 
            p.location === location && 
            p.area === area && 
            p.level === level
        );
        
        if (targetProducts.length === 0) {
            console.log(`⚠️  No products found for: ${location}/${area}-${level}`);
            return false;
        }
        
        // HTMLファイルを読み込み
        let html = fs.readFileSync(filePath, 'utf8');
        
        // カテゴリ別に商品を分類
        const categories = {
            'cleaner': [],
            'tool': [],
            'other': []
        };
        
        targetProducts.forEach(product => {
            if (product.category) {
                if (!categories[product.category]) {
                    categories[product.category] = [];
                }
                categories[product.category].push(product);
            } else {
                categories.other.push(product);
            }
        });
        
        // 新しい商品セクションを生成
        let newProductSection = `        <div class="section">
            <h2>おすすめ商品</h2>`;
        
        // カテゴリ別に商品を表示
        const categoryNames = {
            'cleaner': '洗剤・クリーナー',
            'tool': '掃除道具',
            'other': 'その他'
        };
        
        Object.entries(categories).forEach(([category, products]) => {
            if (products.length > 0) {
                newProductSection += `
            <h3>${categoryNames[category]}</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${products.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>`;
            }
        });
        
        newProductSection += `
        </div>`;
        
        // 既存の商品セクションを探して置き換え
        // パターン1: <h2>おすすめ商品</h2>を含むセクション全体
        const productSectionRegex = /<h2>おすすめ商品<\/h2>[\s\S]*?(?=<(?:div class="method-feedback-section"|div class="section method-feedback"|script|\/body))/;
        
        if (productSectionRegex.test(html)) {
            html = html.replace(productSectionRegex, newProductSection.trim() + '\n\n<!-- 掃除方法フィードバックセクション -->\n');
            
            // ファイルを保存
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`✅ Updated: ${filePath} (${targetProducts.length} products)`);
            return true;
        } else {
            console.error(`❌ Cannot find product section in: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('Starting to fix all HTML files with products from products-master.json...\n');

const directories = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];
let totalUpdated = 0;
let totalErrors = 0;

directories.forEach(dir => {
    console.log(`\n=== Processing ${dir} ===`);
    
    if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        return;
    }
    
    const files = fs.readdirSync(dir).filter(f => f.match(/-(light|heavy)\.html$/));
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (updateHTMLFile(filePath)) {
            totalUpdated++;
        } else {
            totalErrors++;
        }
    });
});

console.log('\n=== Summary ===');
console.log(`✅ Successfully updated: ${totalUpdated} files`);
console.log(`❌ Errors: ${totalErrors} files`);
console.log(`📁 Total processed: ${totalUpdated + totalErrors} files`);