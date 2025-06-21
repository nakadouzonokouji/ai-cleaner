const fs = require('fs');
const path = require('path');

// 全ページのリスト
const pages = [
    // バスルーム
    { path: 'bathroom/bathtub-heavy.html', title: '浴槽ひどい汚れ掃除ガイド', category: 'bathroom-bathtub-heavy' },
    { path: 'bathroom/bathtub-light.html', title: '浴槽軽い汚れ掃除ガイド', category: 'bathroom-bathtub-light' },
    { path: 'bathroom/drain-heavy.html', title: '排水口ひどい汚れ掃除ガイド', category: 'bathroom-drain-heavy' },
    { path: 'bathroom/drain-light.html', title: '排水口軽い汚れ掃除ガイド', category: 'bathroom-drain-light' },
    { path: 'bathroom/shower-heavy.html', title: 'シャワーひどい汚れ掃除ガイド', category: 'bathroom-shower-heavy' },
    { path: 'bathroom/shower-light.html', title: 'シャワー軽い汚れ掃除ガイド', category: 'bathroom-shower-light' },
    { path: 'bathroom/toilet-heavy.html', title: 'トイレひどい汚れ掃除ガイド', category: 'bathroom-toilet-heavy' },
    { path: 'bathroom/toilet-light.html', title: 'トイレ軽い汚れ掃除ガイド', category: 'bathroom-toilet-light' },
    { path: 'bathroom/ventilation-heavy.html', title: '換気扇ひどい汚れ掃除ガイド', category: 'bathroom-ventilation-heavy' },
    { path: 'bathroom/ventilation-light.html', title: '換気扇軽い汚れ掃除ガイド', category: 'bathroom-ventilation-light' },
    { path: 'bathroom/washstand-heavy.html', title: '洗面台ひどい汚れ掃除ガイド', category: 'bathroom-washstand-heavy' },
    { path: 'bathroom/washstand-light.html', title: '洗面台軽い汚れ掃除ガイド', category: 'bathroom-washstand-light' },
    
    // 床
    { path: 'floor/carpet-heavy.html', title: 'カーペットひどい汚れ掃除ガイド', category: 'floor-carpet-heavy' },
    { path: 'floor/carpet-light.html', title: 'カーペット軽い汚れ掃除ガイド', category: 'floor-carpet-light' },
    { path: 'floor/flooring-heavy.html', title: 'フローリングひどい汚れ掃除ガイド', category: 'floor-flooring-heavy' },
    { path: 'floor/flooring-light.html', title: 'フローリング軽い汚れ掃除ガイド', category: 'floor-flooring-light' },
    { path: 'floor/tatami-heavy.html', title: '畳ひどい汚れ掃除ガイド', category: 'floor-tatami-heavy' },
    { path: 'floor/tatami-light.html', title: '畳軽い汚れ掃除ガイド', category: 'floor-tatami-light' },
    { path: 'floor/tile-heavy.html', title: 'タイルひどい汚れ掃除ガイド', category: 'floor-tile-heavy' },
    { path: 'floor/tile-light.html', title: 'タイル軽い汚れ掃除ガイド', category: 'floor-tile-light' },
    
    // キッチン
    { path: 'kitchen/gas-heavy.html', title: 'ガスコンロひどい汚れ掃除ガイド', category: 'kitchen-gas-heavy' },
    { path: 'kitchen/gas-light.html', title: 'ガスコンロ軽い汚れ掃除ガイド', category: 'kitchen-gas-light' },
    // ih-heavy.htmlはテンプレートなのでスキップ
    { path: 'kitchen/ih-light.html', title: 'IHクッキングヒーター軽い汚れ掃除ガイド', category: 'kitchen-ih-light' },
    { path: 'kitchen/sink-heavy.html', title: 'シンクひどい汚れ掃除ガイド', category: 'kitchen-sink-heavy' },
    { path: 'kitchen/sink-light.html', title: 'シンク軽い汚れ掃除ガイド', category: 'kitchen-sink-light' },
    { path: 'kitchen/ventilation-heavy.html', title: 'レンジフードひどい汚れ掃除ガイド', category: 'kitchen-ventilation-heavy' },
    { path: 'kitchen/ventilation-light.html', title: 'レンジフード軽い汚れ掃除ガイド', category: 'kitchen-ventilation-light' },
    
    // リビング
    { path: 'living/carpet-heavy.html', title: 'リビングカーペットひどい汚れ掃除ガイド', category: 'living-carpet-heavy' },
    { path: 'living/carpet-light.html', title: 'リビングカーペット軽い汚れ掃除ガイド', category: 'living-carpet-light' },
    { path: 'living/sofa-heavy.html', title: 'ソファひどい汚れ掃除ガイド', category: 'living-sofa-heavy' },
    { path: 'living/sofa-light.html', title: 'ソファ軽い汚れ掃除ガイド', category: 'living-sofa-light' },
    { path: 'living/table-heavy.html', title: 'テーブルひどい汚れ掃除ガイド', category: 'living-table-heavy' },
    { path: 'living/table-light.html', title: 'テーブル軽い汚れ掃除ガイド', category: 'living-table-light' },
    { path: 'living/wall-heavy.html', title: '壁ひどい汚れ掃除ガイド', category: 'living-wall-heavy' },
    { path: 'living/wall-light.html', title: '壁軽い汚れ掃除ガイド', category: 'living-wall-light' },
    
    // トイレ
    { path: 'toilet/floor-heavy.html', title: 'トイレ床ひどい汚れ掃除ガイド', category: 'toilet-floor-heavy' },
    { path: 'toilet/floor-light.html', title: 'トイレ床軽い汚れ掃除ガイド', category: 'toilet-floor-light' },
    { path: 'toilet/toilet-heavy.html', title: '便器ひどい汚れ掃除ガイド', category: 'toilet-toilet-heavy' },
    { path: 'toilet/toilet-light.html', title: '便器軽い汚れ掃除ガイド', category: 'toilet-toilet-light' },
    
    // 窓
    { path: 'window/glass-heavy.html', title: '窓ガラスひどい汚れ掃除ガイド', category: 'window-glass-heavy' },
    { path: 'window/glass-light.html', title: '窓ガラス軽い汚れ掃除ガイド', category: 'window-glass-light' },
    { path: 'window/sash-heavy.html', title: '窓サッシひどい汚れ掃除ガイド', category: 'window-sash-heavy' },
    { path: 'window/sash-light.html', title: '窓サッシ軽い汚れ掃除ガイド', category: 'window-sash-light' }
];

// products-master-real.jsonを読み込む
const productsMaster = JSON.parse(fs.readFileSync('products-master-real.json', 'utf8'));

// 場所とカテゴリーに基づいて適切な商品を選択する関数
function selectProductsForPage(category) {
    const [location, item, level] = category.split('-');
    
    // 該当するカテゴリーの商品を取得
    let relevantProducts = productsMaster.products.filter(product => 
        product.category === category
    );
    
    // 商品が見つからない場合は、同じ場所の他の商品を使用
    if (relevantProducts.length < 15) {
        const locationProducts = productsMaster.products.filter(product => {
            const productLocation = product.category.split('-')[0];
            return productLocation === location;
        });
        
        // 重複を除いて追加
        locationProducts.forEach(product => {
            if (!relevantProducts.find(p => p.id === product.id)) {
                relevantProducts.push(product);
            }
        });
    }
    
    // 商品名に基づいてカテゴリー分類
    const cleaners = [];
    const tools = [];
    const protections = [];
    
    relevantProducts.forEach(product => {
        const name = product.name.toLowerCase();
        
        // 洗剤・クリーナー
        if (name.includes('洗剤') || name.includes('クリーナー') || 
            name.includes('マジックリン') || name.includes('カビキラー') ||
            name.includes('重曹') || name.includes('セスキ') || 
            name.includes('クエン酸') || name.includes('漂白') ||
            name.includes('除菌') || name.includes('消臭')) {
            cleaners.push(product);
        }
        // 掃除道具
        else if (name.includes('スポンジ') || name.includes('ブラシ') || 
                 name.includes('たわし') || name.includes('クロス') ||
                 name.includes('モップ') || name.includes('雑巾') ||
                 name.includes('スクレーパー') || name.includes('パッド')) {
            tools.push(product);
        }
        // 保護具
        else if (name.includes('手袋') || name.includes('グローブ') || 
                 name.includes('マスク') || name.includes('ゴーグル') ||
                 name.includes('保護') || name.includes('エプロン')) {
            protections.push(product);
        }
        // 分類できない場合は道具として扱う
        else {
            tools.push(product);
        }
    });
    
    // 各カテゴリーから5個ずつ選択
    const selectedCleaners = selectTopProducts(cleaners, 5);
    const selectedTools = selectTopProducts(tools, 5);
    const selectedProtections = selectTopProducts(protections, 5);
    
    // 不足分を汎用商品で補完
    if (selectedCleaners.length < 5) {
        const genericCleaners = productsMaster.products.filter(p => 
            p.name.includes('マジックリン') || p.name.includes('洗剤')
        ).slice(0, 5 - selectedCleaners.length);
        selectedCleaners.push(...genericCleaners);
    }
    
    if (selectedTools.length < 5) {
        const genericTools = productsMaster.products.filter(p => 
            p.name.includes('スポンジ') || p.name.includes('ブラシ')
        ).slice(0, 5 - selectedTools.length);
        selectedTools.push(...genericTools);
    }
    
    if (selectedProtections.length < 5) {
        const genericProtections = productsMaster.products.filter(p => 
            p.name.includes('手袋') || p.name.includes('マスク')
        ).slice(0, 5 - selectedProtections.length);
        selectedProtections.push(...genericProtections);
    }
    
    return {
        cleaners: selectedCleaners.slice(0, 5),
        tools: selectedTools.slice(0, 5),
        protections: selectedProtections.slice(0, 5)
    };
}

// 指定数の商品を選択する関数
function selectTopProducts(products, count) {
    // 評価とレビュー数でソート
    const sorted = products.sort((a, b) => {
        const scoreA = (a.rating || 4.0) * Math.log(a.reviews || 100);
        const scoreB = (b.rating || 4.0) * Math.log(b.reviews || 100);
        return scoreB - scoreA;
    });
    
    return sorted.slice(0, count);
}

// 商品HTMLを生成する関数
function generateProductHTML(product) {
    return `    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.name}</h4>
        <div class="product-rating">
            <span class="stars">★${product.rating ? product.rating.toFixed(1) : '4.3'}</span>
            <span class="review-count">(${product.reviews ? product.reviews.toLocaleString() : '1,234'})</span>
        </div>
        <p class="price">¥${product.price.toLocaleString()}</p>
        <a href="https://www.amazon.co.jp/dp/${product.id}?tag=asdfghj12-22" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

// ページを更新する関数
function updatePage(pageInfo) {
    const filePath = path.join(__dirname, '..', pageInfo.path);
    
    // 現在のファイルを読み込む
    let content = fs.readFileSync(filePath, 'utf8');
    
    // タイトルを更新
    content = content.replace(/<title>.*?<\/title>/, `<title>${pageInfo.title}</title>`);
    content = content.replace(/<h1>.*?<\/h1>/, `<h1>${pageInfo.title}</h1>`);
    
    // body要素にdata-category属性を追加
    content = content.replace(/<body[^>]*>/, `<body data-category="${pageInfo.category}">`);
    
    // 商品を選択
    const products = selectProductsForPage(pageInfo.category);
    
    // デバッグ出力
    console.log(`  Found ${products.cleaners.length} cleaners, ${products.tools.length} tools, ${products.protections.length} protections`);
    
    // おすすめ商品セクションを生成
    const productsSection = `                                <div class="section">
            <h2>おすすめ商品</h2>
            <h3>洗剤・クリーナー</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${products.cleaners.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>掃除道具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${products.tools.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>保護具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${products.protections.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
        </div>`;
    
    // 既存のおすすめ商品セクションを置き換え
    const productSectionRegex = /<div class="section">\s*<h2>おすすめ商品<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
    
    if (productSectionRegex.test(content)) {
        content = content.replace(productSectionRegex, productsSection);
    } else {
        // おすすめ商品セクションが見つからない場合は、掃除手順の後に追加
        const stepsEndRegex = /(<\/div>\s*<\/div>\s*)(<div class="section method-feedback">)/;
        if (stepsEndRegex.test(content)) {
            content = content.replace(stepsEndRegex, `$1\n        ${productsSection}\n        $2`);
        }
    }
    
    // 「必要な掃除アイテム」セクションを削除
    content = content.replace(/<div class="section">\s*<h2>必要な掃除アイテム<\/h2>\s*<\/div>/g, '');
    
    // スタイルが不足している場合は追加
    if (!content.includes('.product-grid')) {
        const styleToAdd = `        .product-grid{overflow-x:auto;margin-bottom:30px}
        .product-grid-inner{display:flex;gap:15px;padding-bottom:10px}
        .product-card{flex:0 0 200px;border:1px solid #ddd;padding:15px;border-radius:8px;background:white}
        .product-card img{width:100%;height:150px;object-fit:contain;margin-bottom:10px}
        .product-card h4{margin:10px 0 5px;font-size:14px;line-height:1.3;height:36px;overflow:hidden}
        .price{color:#667eea;font-weight:bold;font-size:18px;margin:8px 0}
        .buy-button{display:block;background:#ff9500;color:white;text-align:center;padding:10px;border-radius:5px;text-decoration:none;margin-top:10px;font-weight:bold}
        .buy-button:hover{background:#e88600}`;
        
        content = content.replace(
            /(.warning{[^}]+})\s*<\/style>/,
            `$1\n${styleToAdd}\n    </style>`
        );
    }
    
    // ファイルを保存
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${pageInfo.path}`);
}

// メイン処理
console.log('Starting standardization of all pages...');
console.log(`Total pages to update: ${pages.length}`);

pages.forEach((page, index) => {
    console.log(`\nProcessing ${index + 1}/${pages.length}: ${page.path}`);
    try {
        updatePage(page);
    } catch (error) {
        console.error(`Error updating ${page.path}:`, error.message);
    }
});

console.log('\nStandardization complete!');