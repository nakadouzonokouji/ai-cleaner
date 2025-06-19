#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// カテゴリーと対応するファイル一覧
const categories = {
    'kitchen': {
        'sink-light': '軽い汚れのシンク掃除用品',
        'sink-heavy': '頑固な汚れのシンク掃除用品',
        'gas-light': '軽い汚れのガスコンロ掃除用品',
        'gas-heavy': '頑固な汚れのガスコンロ掃除用品',
        'ih-light': '軽い汚れのIHコンロ掃除用品',
        'ih-heavy': '頑固な汚れのIHコンロ掃除用品',
        'ventilation-light': '軽い汚れの換気扇掃除用品',
        'ventilation-heavy': '頑固な汚れの換気扇掃除用品'
    },
    'bathroom': {
        'bathtub-light': '軽い汚れの浴槽掃除用品',
        'bathtub-heavy': '頑固な汚れの浴槽掃除用品',
        'shower-light': '軽い汚れのシャワー掃除用品',
        'shower-heavy': '頑固な汚れのシャワー掃除用品',
        'toilet-light': '軽い汚れのトイレ掃除用品',
        'toilet-heavy': '頑固な汚れのトイレ掃除用品',
        'washstand-light': '軽い汚れの洗面台掃除用品',
        'washstand-heavy': '頑固な汚れの洗面台掃除用品',
        'drain-light': '軽い汚れの排水口掃除用品',
        'drain-heavy': '頑固な汚れの排水口掃除用品',
        'ventilation-light': '軽い汚れの換気扇掃除用品',
        'ventilation-heavy': '頑固な汚れの換気扇掃除用品'
    },
    'living': {
        'carpet-light': '軽い汚れのカーペット掃除用品',
        'carpet-heavy': '頑固な汚れのカーペット掃除用品',
        'sofa-light': '軽い汚れのソファ掃除用品',
        'sofa-heavy': '頑固な汚れのソファ掃除用品',
        'table-light': '軽い汚れのテーブル掃除用品',
        'table-heavy': '頑固な汚れのテーブル掃除用品',
        'wall-light': '軽い汚れの壁掃除用品',
        'wall-heavy': '頑固な汚れの壁掃除用品'
    },
    'floor': {
        'flooring-light': '軽い汚れのフローリング掃除用品',
        'flooring-heavy': '頑固な汚れのフローリング掃除用品',
        'carpet-light': '軽い汚れのカーペット掃除用品',
        'carpet-heavy': '頑固な汚れのカーペット掃除用品',
        'tatami-light': '軽い汚れの畳掃除用品',
        'tatami-heavy': '頑固な汚れの畳掃除用品',
        'tile-light': '軽い汚れのタイル掃除用品',
        'tile-heavy': '頑固な汚れのタイル掃除用品'
    },
    'toilet': {
        'toilet-light': '軽い汚れのトイレ掃除用品',
        'toilet-heavy': '頑固な汚れのトイレ掃除用品',
        'floor-light': '軽い汚れのトイレ床掃除用品',
        'floor-heavy': '頑固な汚れのトイレ床掃除用品'
    },
    'window': {
        'glass-light': '軽い汚れの窓ガラス掃除用品',
        'glass-heavy': '頑固な汚れの窓ガラス掃除用品',
        'sash-light': '軽い汚れのサッシ掃除用品',
        'sash-heavy': '頑固な汚れのサッシ掃除用品'
    }
};

// 商品ブランド名リスト
const brands = [
    '花王', 'ライオン', 'P&G', 'ユニリーバ', 'エステー', 'レック', 'アース製薬',
    'キンチョー', 'ジョンソン', 'スリーエム', 'ダスキン', 'リンレイ', 'ソフト99',
    'コクヨ', 'アイリスオーヤマ', 'ダイソン', 'ケルヒャー', 'マキタ', 'パナソニック'
];

// 商品名パーツ
const productParts = {
    prefix: ['激落ち', 'パワフル', 'スーパー', 'ウルトラ', 'プロ仕様', 'マイルド', '強力', '瞬間', '徹底', '完璧'],
    type: ['クリーナー', 'ワイパー', 'スプレー', 'ジェル', 'フォーム', 'パウダー', 'シート', 'ブラシ', 'スポンジ', 'クロス'],
    suffix: ['EX', 'プラス', 'プレミアム', 'ゴールド', 'プロ', 'MAX', 'DX', 'スペシャル', 'アドバンス', 'ネクスト']
};

// ASIN生成関数
function generateASIN() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let asin = 'B0';
    for (let i = 0; i < 8; i++) {
        asin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return asin;
}

// 商品生成関数
function generateProduct(category, subcategory, index) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const prefix = productParts.prefix[Math.floor(Math.random() * productParts.prefix.length)];
    const type = productParts.type[Math.floor(Math.random() * productParts.type.length)];
    const suffix = Math.random() > 0.5 ? ' ' + productParts.suffix[Math.floor(Math.random() * productParts.suffix.length)] : '';
    
    const isHeavy = subcategory.includes('heavy');
    const price = isHeavy 
        ? Math.floor(Math.random() * 3000) + 1000  // 1000-4000円
        : Math.floor(Math.random() * 1500) + 300;  // 300-1800円
    
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5.0
    const reviews = Math.floor(Math.random() * 50000) + 100;
    
    return {
        id: generateASIN(),
        category: `${category}-${subcategory}`,
        name: `${brand} ${prefix}${type}${suffix}`,
        price: price,
        rating: parseFloat(rating),
        reviews: reviews,
        image: `https://m.media-amazon.com/images/I/${Math.floor(Math.random() * 90) + 10}XXXXXXXX._AC_SL1500_.jpg`,
        description: categories[category][subcategory],
        prime: Math.random() > 0.2,
        inStock: Math.random() > 0.1,
        url: `https://www.amazon.co.jp/dp/${generateASIN()}`
    };
}

// メイン処理
function generateAllProducts() {
    const allProducts = [];
    const usedASINs = new Set();
    
    // 各カテゴリー・サブカテゴリーごとに15商品生成
    for (const [category, subcategories] of Object.entries(categories)) {
        for (const subcategory of Object.keys(subcategories)) {
            for (let i = 0; i < 15; i++) {
                let product;
                do {
                    product = generateProduct(category, subcategory, i);
                } while (usedASINs.has(product.id));
                
                usedASINs.add(product.id);
                allProducts.push(product);
            }
        }
    }
    
    // 特別ページ用の商品も追加
    const specialPages = [
        { category: 'kitchen-sink', name: 'シンク掃除用品' },
        { category: 'bathroom-bathtub', name: '浴槽掃除用品' }
    ];
    
    for (const special of specialPages) {
        for (let i = 0; i < 15; i++) {
            let product = generateProduct(
                special.category.split('-')[0],
                special.category.split('-')[1],
                i
            );
            product.category = special.category;
            allProducts.push(product);
        }
    }
    
    return allProducts;
}

// ファイル生成
const products = generateAllProducts();
const output = {
    products: products,
    metadata: {
        totalProducts: products.length,
        generatedAt: new Date().toISOString(),
        categories: Object.keys(categories).length,
        pagesCount: 53
    }
};

fs.writeFileSync(
    path.join(__dirname, 'products-master.json'),
    JSON.stringify(output, null, 2),
    'utf8'
);

console.log(`✅ 生成完了！`);
console.log(`- 総商品数: ${products.length}`);
console.log(`- カテゴリー数: ${Object.keys(categories).length}`);
console.log(`- ファイル: products-master.json`);