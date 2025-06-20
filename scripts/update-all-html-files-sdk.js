const fs = require('fs');
const path = require('path');

// 商品マスターファイルを読み込む
function loadProductData() {
    // 優先順位: マスターファイル > complete > その他
    const files = [
        'products-master.json',
        'products-master-complete.json',
        'products-master-sdk.json',
        'products-master-real.json'
    ];
    
    for (const file of files) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`商品データを読み込み中: ${file}`);
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    }
    
    throw new Error('商品マスターファイルが見つかりません');
}

// カテゴリに該当する商品を取得
function getProductsForCategory(products, category) {
    // categoryフィールドがある場合はそれを使用
    if (products.some(p => p.category)) {
        return products.filter(product => product.category === category);
    }
    
    // そうでない場合は、location-area-levelから構築
    const [location, ...rest] = category.split('-');
    const level = rest[rest.length - 1];
    const area = rest.slice(0, -1).join('-');
    
    return products.filter(product => 
        product.location === location && 
        product.area === area && 
        product.level === level
    );
}

// 商品HTMLを生成
function generateProductHTML(product) {
    // 商品名とその他のフィールド名を正規化
    const name = product.name || product.title || 'タイトル不明';
    const image = product.image || '';
    const price = product.price || 0;
    const url = product.url || product.link || '';
    const rating = product.rating || 4.3;
    const reviews = product.reviews || 1234;
    
    return `    <div class="product-card">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${name}</h4>
        <div class="product-rating">
            <span class="stars">★${rating.toFixed(1)}</span>
            <span class="review-count">(${reviews.toLocaleString()})</span>
        </div>
        <p class="price">¥${price.toLocaleString()}</p>
        <a href="${url}?tag=${process.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22'}" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

// 商品セクションHTMLを生成
function generateProductSectionHTML(products, categoryName) {
    if (!products || products.length === 0) {
        return '';
    }

    // カテゴリに基づいて表示する商品を整理
    const cleaners = products.filter(p => {
        const name = p.name || p.title || '';
        return p.brand || name.includes('洗剤') || name.includes('クリーナー') || name.includes('マジックリン');
    });
    const tools = products.filter(p => {
        const name = p.name || p.title || '';
        return name.includes('スポンジ') || name.includes('ブラシ') || name.includes('たわし') || name.includes('モップ');
    });
    const protection = products.filter(p => {
        const name = p.name || p.title || '';
        return name.includes('手袋') || name.includes('マスク') || name.includes('エプロン') || name.includes('保護');
    });
    const others = products.filter(p => !cleaners.includes(p) && !tools.includes(p) && !protection.includes(p));

    let html = `        <div class="section">
            <h2>おすすめ商品</h2>
`;

    // 洗剤類
    if (cleaners.length > 0) {
        html += `            <h3>洗剤・クリーナー</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;
        cleaners.slice(0, 5).forEach(product => {
            html += generateProductHTML(product) + '\n';
        });
        html += `                </div>
            </div>
`;
    }

    // 道具類
    if (tools.length > 0) {
        html += `            <h3>掃除道具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;
        tools.slice(0, 5).forEach(product => {
            html += generateProductHTML(product) + '\n';
        });
        html += `                </div>
            </div>
`;
    }

    // 保護具
    if (protection.length > 0) {
        html += `            <h3>保護具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;
        protection.slice(0, 5).forEach(product => {
            html += generateProductHTML(product) + '\n';
        });
        html += `                </div>
            </div>
`;
    }

    // その他
    if (others.length > 0 && (cleaners.length + tools.length + protection.length) < 10) {
        html += `            <h3>その他のおすすめ商品</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;
        others.slice(0, 5).forEach(product => {
            html += generateProductHTML(product) + '\n';
        });
        html += `                </div>
            </div>
`;
    }

    html += `        </div>`;
    return html;
}

// HTMLファイルを更新
function updateHTMLFile(filePath, productsData) {
    try {
        const fullPath = path.join(__dirname, '..', filePath);
        
        // ファイルパスからカテゴリを推定
        const parts = filePath.split('/');
        const fileName = parts[parts.length - 1].replace('.html', '');
        const location = parts[0];
        
        // カテゴリ名を生成（例: kitchen/gas-heavy.html -> kitchen-gas-heavy）
        const category = `${location}-${fileName}`;
        
        console.log(`  処理中: ${filePath} (カテゴリ: ${category})`);
        
        // カテゴリに該当する商品を取得
        const products = getProductsForCategory(productsData.products, category);
        
        if (products.length === 0) {
            console.log(`  ⚠️  商品なし: ${category}`);
            return false;
        }
        
        // HTMLファイルを読み込み
        let html = fs.readFileSync(fullPath, 'utf8');
        
        // 新しい商品セクションを生成
        const newProductSection = generateProductSectionHTML(products, category);
        
        // 既存の商品セクションを置き換え
        // パターン1: <div class="section">...<h2>おすすめ商品</h2>...</div>
        let sectionRegex = /<div class="section">\s*<h2>おすすめ商品<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|<\/body>|$)/;
        
        if (sectionRegex.test(html)) {
            html = html.replace(sectionRegex, newProductSection + '\n        ');
            console.log(`  ✅ 更新成功: ${products.length}商品`);
        } else {
            // パターン2: <div class="section">...<h2>必要な掃除アイテム</h2>...</div>
            sectionRegex = /<div class="section">\s*<h2>必要な掃除アイテム<\/h2>[\s\S]*?<\/div>\s*(?=<div class="section|<\/body>|$)/;
            
            if (sectionRegex.test(html)) {
                html = html.replace(sectionRegex, newProductSection + '\n        ');
                console.log(`  ✅ 更新成功: ${products.length}商品`);
            } else {
                // セクションが見つからない場合は、bodyの終了タグの前に挿入
                const bodyEndRegex = /<\/body>/;
                if (bodyEndRegex.test(html)) {
                    html = html.replace(bodyEndRegex, '\n' + newProductSection + '\n    </body>');
                    console.log(`  ✅ 追加成功: ${products.length}商品`);
                } else {
                    console.error(`  ❌ 挿入位置が見つかりません: ${filePath}`);
                    return false;
                }
            }
        }
        
        // ファイルを保存
        fs.writeFileSync(fullPath, html, 'utf8');
        return true;
        
    } catch (error) {
        console.error(`  ❌ エラー ${filePath}:`, error.message);
        return false;
    }
}

// すべてのHTMLファイルを更新
function updateAllHTMLFiles() {
    console.log('SDK版: 商品データを使用してHTMLファイルを更新中...\n');
    
    // 商品データを読み込み
    let productsData;
    try {
        productsData = loadProductData();
        console.log(`✅ 商品データ読み込み完了: ${productsData.products.length}商品\n`);
    } catch (error) {
        console.error('❌ エラー:', error.message);
        return;
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // 各場所のディレクトリをスキャン
    const locations = ['kitchen', 'bathroom', 'living', 'floor', 'toilet', 'window'];
    
    locations.forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        
        if (!fs.existsSync(locationPath)) {
            console.log(`⚠️  ディレクトリなし: ${location}`);
            return;
        }
        
        console.log(`\n=== ${location} ===`);
        
        // HTMLファイルを検索
        const files = fs.readdirSync(locationPath);
        files.forEach(file => {
            // -light.html または -heavy.html のパターンに一致するファイルのみ処理
            if (file.match(/-(light|heavy)\.html$/)) {
                const filePath = path.join(location, file);
                
                if (updateHTMLFile(filePath, productsData)) {
                    updatedCount++;
                } else {
                    errorCount++;
                }
            }
        });
    });
    
    console.log('\n=== 更新完了 ===');
    console.log(`✅ 成功: ${updatedCount} ファイル`);
    console.log(`❌ エラー: ${errorCount} ファイル`);
    console.log(`📁 合計: ${updatedCount + errorCount} ファイル`);
    
    // カテゴリ別の統計
    if (productsData.statistics) {
        console.log('\n📊 商品統計:');
        console.log('場所別:');
        Object.entries(productsData.statistics.byLocation || {}).forEach(([loc, count]) => {
            console.log(`  ${loc}: ${count}商品`);
        });
        console.log('\nレベル別:');
        if (productsData.statistics.byLevel) {
            console.log(`  軽い汚れ用: ${productsData.statistics.byLevel.light}商品`);
            console.log(`  頑固な汚れ用: ${productsData.statistics.byLevel.heavy}商品`);
        }
    }
}

// メイン実行
if (require.main === module) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    updateAllHTMLFiles();
}

module.exports = {
    updateHTMLFile,
    updateAllHTMLFiles,
    loadProductData
};