const fs = require('fs');
const path = require('path');

// ih-heavy.htmlから抽出した実際の商品データ
const templateProducts = {
    cleaners: [
        {
            id: "B003ALBRXK",
            name: "レック(LEC) IHクッキングヒーター クリーナー",
            image: "https://m.media-amazon.com/images/I/4151+bqTJYL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1700
        },
        {
            id: "B09TSPZ74F",
            name: "カネヨ石鹸 カネヨ IHキッチンクリーナー 400g ガラストップ用 コゲ・焼きつき汚れ",
            image: "https://m.media-amazon.com/images/I/31V5-ngX8WL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 290
        },
        {
            id: "B0C1JSBJVP",
            name: "コモライフ コゲトリーナ ガラストップIH用 コゲ取り クリーナー IH ガラス 掃除 日本製",
            image: "https://m.media-amazon.com/images/I/411V1cUYf5L._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 998
        },
        {
            id: "B07J713GBT",
            name: "アイセン IH ガラストップ クリーナー ミガキ ゴールド 約5×5×1cm 抗菌仕様 キッチン 機能性クリーナー 日本製 KKS01",
            image: "https://m.media-amazon.com/images/I/51-ywk2Yg4L._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 337
        },
        {
            id: "B004JKV844",
            name: "ソフト99(SOFT99) ラクラクIH・ガラストップ専用クリーナー",
            image: "https://m.media-amazon.com/images/I/511nFTZ9pzL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1260
        }
    ],
    tools: [
        {
            id: "B08NJDJHXL",
            name: "焦げ落とし スポンジ (５個セット) こげ落とし 専用 キッチンスポンジ [焦げた鍋具・さび取りの際の たわし の代わりにご使用ください！] こげとりスポンジ 【TORYTON】",
            image: "https://m.media-amazon.com/images/I/5172WX9jJ5L._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1180
        },
        {
            id: "B071HB5CVN",
            name: "下村企販 たわし ステンレスたわし 2個組 【日本製】 鉄フライパン 鍋のお手入れに 錆び落とし 焦げ付き 油汚れ 掃除がラク 36588",
            image: "https://m.media-amazon.com/images/I/51xZeYE55ML._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 660
        },
        {
            id: "B005FIYBJS",
            name: "オーエ プレミアムステンレスたわし レギュラー",
            image: "https://m.media-amazon.com/images/I/41Zig11cdFL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 145
        },
        {
            id: "B07N2T15GN",
            name: "ボンスタｰ PKステンレスたわし 50g PK-160",
            image: "https://m.media-amazon.com/images/I/51oVhsLYsbL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 109
        },
        {
            id: "B0C7TTF7GT",
            name: "ステンレスタワシ 6g×10個入り 金たわし タワシ 束子",
            image: "https://m.media-amazon.com/images/I/41HxaHFE0FL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 443
        }
    ],
    protections: [
        {
            id: "B097M43HCK",
            name: "ファミリー [まとめ買い] ビニール手袋 厚手 指・手のひら強化 Mサイズ パープル×5個 園芸 庭仕事 掃除 洗濯 洗車 キッチン 食器洗い ビニール 手袋",
            image: "https://m.media-amazon.com/images/I/512MX3ujcWL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1187
        },
        {
            id: "B09DPL7G6V",
            name: "ファミリー [まとめ買い] ビニール手袋 中厚手 指先強化 Mサイズ ピンク×4個 キッチン 食器洗い 掃除 洗濯 ガーデニング ビニール 手袋",
            image: "https://m.media-amazon.com/images/I/51qAfNb8CeL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 800
        },
        {
            id: "B0CC8RZPP1",
            name: "[PROMEDIX] ゴム手袋 8mil|0.25mm 極厚タイプ 強耐久性 使い捨て 作業用 ニトリル手袋 【食品衛生法適合品】 使い捨て手袋 耐油性 強伸縮 自動車整備 油仕事 DIY作業 塗装 （50枚入/黒/M)",
            image: "https://m.media-amazon.com/images/I/51jWj9m-dZL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1759
        },
        {
            id: "B001QW9F1G",
            name: "ショーワグローブ(Showaglove) 【耐油手袋】簡易包装 耐油ビニローブ Lサイズ 10双",
            image: "https://m.media-amazon.com/images/I/51liB+H6NjL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 3245
        },
        {
            id: "B0DMFJWNZR",
            name: "[OMAYOU] ゴム手袋 ニトリル手袋 使い捨て手袋 厚手0.25mm / 8mi極厚タイプ ニトリルグローブ 強耐久性 耐油性 強伸縮 自動車整備 油仕事 DIY作業 塗装 バイク整備作業用 ガーデニング 破れにくい 粉なし スマホタッチ対応 ブラック（L / 50枚入）",
            image: "https://m.media-amazon.com/images/I/51hLerLRgbL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 1799
        }
    ]
};

// 各場所に応じた商品タイトルのカスタマイズ
const productCustomization = {
    'bathroom': {
        cleaners: ['バスマジックリン', 'カビキラー', 'バスクリーナー', '風呂用洗剤', 'お風呂用クリーナー'],
        tools: ['バススポンジ', 'お風呂ブラシ', 'バスブラシ', '風呂掃除用具', 'バスクリーナー'],
        protections: ['ゴム手袋', '掃除用手袋', '防水手袋', '作業用手袋', 'ビニール手袋']
    },
    'floor': {
        cleaners: ['フローリングクリーナー', 'ワックス', '床用洗剤', 'フロアクリーナー', '床掃除用洗剤'],
        tools: ['フローリングワイパー', 'モップ', '雑巾', '床掃除用具', 'フロアモップ'],
        protections: ['掃除用手袋', '膝パッド', '作業用手袋', 'ゴム手袋', '保護具']
    },
    'kitchen': {
        cleaners: ['キッチンクリーナー', 'マジックリン', '油汚れ用洗剤', 'キッチン用洗剤', '台所用洗剤'],
        tools: ['キッチンスポンジ', 'たわし', 'スクレーパー', 'キッチンブラシ', '掃除道具'],
        protections: ['ゴム手袋', 'キッチン手袋', '耐油手袋', '作業用手袋', '厚手手袋']
    },
    'living': {
        cleaners: ['多目的クリーナー', 'リビング用洗剤', '住居用洗剤', 'マルチクリーナー', '万能洗剤'],
        tools: ['ハンディモップ', 'ダスター', 'クロス', '掃除機', 'ほこり取り'],
        protections: ['掃除用手袋', 'マスク', 'エプロン', '作業着', '保護具']
    },
    'toilet': {
        cleaners: ['トイレクリーナー', 'サンポール', 'トイレ用洗剤', '便器洗剤', 'トイレハイター'],
        tools: ['トイレブラシ', 'トイレクリーナー', '便器ブラシ', 'トイレ掃除道具', 'ブラシ'],
        protections: ['ゴム手袋', 'トイレ用手袋', '使い捨て手袋', '防護手袋', 'ビニール手袋']
    },
    'window': {
        cleaners: ['ガラスクリーナー', 'ガラスマジックリン', '窓用洗剤', 'ガラス用洗剤', 'ウインドウクリーナー'],
        tools: ['窓用ワイパー', 'スクイージー', 'ガラスクロス', '窓掃除道具', 'ワイパー'],
        protections: ['作業用手袋', '安全手袋', 'ゴム手袋', '保護手袋', '滑り止め手袋']
    }
};

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
    
    // キッチン（ih-heavy.htmlはスキップ）
    { path: 'kitchen/gas-heavy.html', title: 'ガスコンロひどい汚れ掃除ガイド', category: 'kitchen-gas-heavy' },
    { path: 'kitchen/gas-light.html', title: 'ガスコンロ軽い汚れ掃除ガイド', category: 'kitchen-gas-light' },
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

// 商品HTMLを生成する関数
function generateProductHTML(product) {
    return `    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.name}</h4>
        <div class="product-rating">
            <span class="stars">★${product.rating}</span>
            <span class="review-count">(${product.reviews.toLocaleString()})</span>
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
    
    // 場所を取得
    const location = pageInfo.category.split('-')[0];
    
    // 場所に応じた商品名のカスタマイズを取得
    const customNames = productCustomization[location] || productCustomization['kitchen'];
    
    // 商品データをコピーして名前をカスタマイズ
    const customizedProducts = {
        cleaners: templateProducts.cleaners.map((product, index) => ({
            ...product,
            name: product.name.replace(/IH|クッキングヒーター|キッチン/g, customNames.cleaners[index] || '洗剤')
        })),
        tools: templateProducts.tools.map((product, index) => ({
            ...product,
            name: product.name.replace(/焦げ|キッチン/g, customNames.tools[index] || '掃除道具')
        })),
        protections: templateProducts.protections
    };
    
    // おすすめ商品セクションを生成
    const productsSection = `                                <div class="section">
            <h2>おすすめ商品</h2>
            <h3>洗剤・クリーナー</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${customizedProducts.cleaners.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>掃除道具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${customizedProducts.tools.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>保護具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${customizedProducts.protections.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
        </div>`;
    
    // 既存のおすすめ商品セクションを置き換え
    // まず、おすすめ商品セクションの開始位置を探す
    const productStartRegex = /<div class="section">\s*<h2>おすすめ商品<\/h2>/;
    const productStartMatch = content.match(productStartRegex);
    
    if (productStartMatch) {
        // おすすめ商品セクションの開始位置から、次のセクションまでを探す
        const startIndex = productStartMatch.index;
        
        // 次のセクション（method-feedbackまたは終了タグ）を探す
        const remainingContent = content.substring(startIndex);
        const nextSectionRegex = /<div class="section method-feedback">|<\/div>\s*<\/body>/;
        const nextSectionMatch = remainingContent.match(nextSectionRegex);
        
        if (nextSectionMatch) {
            // 既存のセクションを新しいものに置き換え
            const endIndex = startIndex + nextSectionMatch.index;
            content = content.substring(0, startIndex) + productsSection + '\n        ' + content.substring(endIndex);
        }
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
        .buy-button:hover{background:#e88600}
        .product-rating{font-size:14px;color:#666;margin:5px 0}
        .stars{color:#ff9500}`;
        
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