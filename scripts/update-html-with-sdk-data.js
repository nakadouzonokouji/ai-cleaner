const fs = require('fs');
const path = require('path');

// 場所名の日本語マッピング
const LOCATION_NAMES = {
    kitchen: 'キッチン',
    bathroom: 'バスルーム',
    living: 'リビング',
    floor: '床',
    toilet: 'トイレ',
    window: '窓'
};

/**
 * マスターデータから特定ページの商品を取得
 */
function getProductsForPage(location, area, level) {
    const masterFile = path.join(__dirname, '..', 'products-master.json');
    
    if (!fs.existsSync(masterFile)) {
        console.error('❌ products-master.json が見つかりません');
        return [];
    }
    
    const masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
    const key = `${location}-${area}-${level}`;
    
    return masterData.products[key] || [];
}

/**
 * 商品カードのHTMLを生成
 */
function generateProductCard(product) {
    // 画像URLが空の場合はプレースホルダーを使用
    const imageUrl = product.image || 'https://via.placeholder.com/200x200?text=商品画像';
    
    return `
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
                    <h4>${product.title}</h4>
                    <p class="price">${product.priceDisplay}</p>
                    <a href="${product.link}" target="_blank" rel="nofollow noopener" class="buy-button">
                        Amazonで購入
                    </a>
                </div>`;
}

/**
 * 商品コンテナのHTMLを生成
 */
function generateProductContainer(products) {
    if (!products || products.length === 0) {
        return `
        <div class="no-products">
            <p>現在、このカテゴリの商品データを準備中です。</p>
        </div>`;
    }
    
    const productCards = products.slice(0, 10).map(p => generateProductCard(p)).join('\n');
    
    return `
        <div class="product-grid">
            <div class="product-scroll">
${productCards}
            </div>
        </div>`;
}

/**
 * HTMLファイルを更新
 */
function updateHTMLFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ ファイルが見つかりません: ${filePath}`);
        return false;
    }
    
    try {
        // HTMLファイルを読み込み
        let html = fs.readFileSync(fullPath, 'utf8');
        
        // data-category属性から情報を取得
        const categoryMatch = html.match(/data-category="([^"]+)"/);
        if (!categoryMatch) {
            console.error(`❌ data-category が見つかりません: ${filePath}`);
            return false;
        }
        
        const [location, area, level] = categoryMatch[1].split('-');
        
        // 商品データを取得
        const products = getProductsForPage(location, area, level);
        
        // 新しい商品コンテナHTMLを生成
        const newProductContainer = generateProductContainer(products);
        
        // product-containerの内容を置換
        const containerRegex = /<div id="product-container"[^>]*>[\s\S]*?<\/div>(?=\s*<\/div>)/;
        
        if (containerRegex.test(html)) {
            html = html.replace(containerRegex, 
                `<div id="product-container" class="product-container">${newProductContainer}
    </div>`);
            
            // ファイルを保存
            fs.writeFileSync(fullPath, html, 'utf8');
            console.log(`✅ 更新完了: ${filePath} (${products.length}商品)`);
            return true;
        } else {
            console.error(`❌ product-container が見つかりません: ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ エラー ${filePath}:`, error.message);
        return false;
    }
}

/**
 * すべてのHTMLファイルを更新
 */
function updateAllHTMLFiles() {
    console.log('🚀 SDK版商品データでHTMLファイルを更新します...\n');
    
    const locations = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];
    let totalUpdated = 0;
    let totalErrors = 0;
    
    // 各場所のディレクトリをスキャン
    locations.forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        
        if (!fs.existsSync(locationPath)) {
            console.log(`⚠️  ディレクトリが見つかりません: ${location}`);
            return;
        }
        
        console.log(`\n📍 ${LOCATION_NAMES[location]} (${location})`);
        
        // HTMLファイルを検索
        const files = fs.readdirSync(locationPath);
        const htmlFiles = files.filter(f => f.match(/-(light|heavy)\.html$/));
        
        htmlFiles.forEach(file => {
            const filePath = path.join(location, file);
            if (updateHTMLFile(filePath)) {
                totalUpdated++;
            } else {
                totalErrors++;
            }
        });
    });
    
    console.log('\n\n📊 === 更新結果 ===');
    console.log(`✅ 成功: ${totalUpdated} ファイル`);
    console.log(`❌ エラー: ${totalErrors} ファイル`);
    console.log(`📁 合計: ${totalUpdated + totalErrors} ファイル`);
}

// テスト用: 特定のファイルを更新
function testUpdateFile(filePath) {
    console.log(`\n🧪 テスト更新: ${filePath}`);
    updateHTMLFile(filePath);
}

// 実行
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--test') {
        // テストモード: 特定のファイルのみ更新
        const testFile = args[1] || 'kitchen/ih-heavy.html';
        testUpdateFile(testFile);
    } else {
        // 全ファイル更新
        updateAllHTMLFiles();
    }
}

module.exports = { updateHTMLFile, updateAllHTMLFiles };