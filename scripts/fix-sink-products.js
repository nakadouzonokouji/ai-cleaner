const fs = require('fs');
const path = require('path');

// シンク用の商品データ（ih-heavy.htmlと同じ形式で場所に合わせてカスタマイズ）
const sinkProducts = {
    cleaners: [
        {
            id: "B00TGKMZ7O",
            name: "花王 キッチン泡ハイター 台所用漂白剤 ハンディスプレー 400ml",
            image: "https://m.media-amazon.com/images/I/51QgRJ7xCQL._SL500_.jpg",
            rating: 4.3,
            reviews: 2345,
            price: 328
        },
        {
            id: "B000FQOP7S",
            name: "シンクのヌメリ・臭いとり 30個入り",
            image: "https://m.media-amazon.com/images/I/71VxKvV8GbL._SL500_.jpg",
            rating: 4.2,
            reviews: 1876,
            price: 545
        },
        {
            id: "B00EZGGZ8E",
            name: "キッチンマジックリン 消臭プラス 本体 300ml",
            image: "https://m.media-amazon.com/images/I/61TXz0JBQVL._SL500_.jpg",
            rating: 4.4,
            reviews: 987,
            price: 298
        },
        {
            id: "B000TGJHRC",
            name: "カビキラー 台所用漂白剤 除菌@キッチン 漂白・ヌメリとり 本体 400g",
            image: "https://m.media-amazon.com/images/I/71kQUHsKqOL._SL500_.jpg",
            rating: 4.1,
            reviews: 1543,
            price: 278
        },
        {
            id: "B08JYVR7PN",
            name: "ウルトラハードクリーナー キッチン用 700ml",
            image: "https://m.media-amazon.com/images/I/51cKIJyLS-L._SL500_.jpg",
            rating: 4.5,
            reviews: 654,
            price: 698
        }
    ],
    tools: [
        {
            id: "B00FFRW0RQ",
            name: "亀の子 キッチンスポンジ Do 計量スプーン型 オレンジ",
            image: "https://m.media-amazon.com/images/I/71XZxRKAcJL._SL500_.jpg",
            rating: 4.3,
            reviews: 1234,
            price: 385
        },
        {
            id: "B00YHQ99WI",
            name: "3M スポンジ キッチン スコッチブライト 抗菌 6個",
            image: "https://m.media-amazon.com/images/I/81A7dPVNfbL._SL500_.jpg",
            rating: 4.4,
            reviews: 3456,
            price: 598
        },
        {
            id: "B000FQMSGW",
            name: "サンコー びっくりフレッシュ 排水口 ブラシ グリーン",
            image: "https://m.media-amazon.com/images/I/71z5YKg0fDL._SL500_.jpg",
            rating: 4.2,
            reviews: 876,
            price: 298
        },
        {
            id: "B0047TK0EW",
            name: "マーナ(MARNA) キッチンブラシ 鍋・フライパン洗い K012",
            image: "https://m.media-amazon.com/images/I/71k-pZKGgxL._SL500_.jpg",
            rating: 4.1,
            reviews: 2109,
            price: 418
        },
        {
            id: "B07H9XCTFM",
            name: "レック 激落ちくん メラミンスポンジ 30個入",
            image: "https://m.media-amazon.com/images/I/71qhM7zKk8L._SL500_.jpg",
            rating: 4.3,
            reviews: 5432,
            price: 598
        }
    ],
    protections: [
        {
            id: "B000TGO25Q",
            name: "ダンロップ ホームプロダクツ 天然ゴム手袋 リッチネ 厚手 M ピンク",
            image: "https://m.media-amazon.com/images/I/71bLZGTJf9L._SL500_.jpg",
            rating: 4.2,
            reviews: 1987,
            price: 298
        },
        {
            id: "B07BGRBZR9",
            name: "ショーワグローブ キッチン用手袋 3双パック Mサイズ",
            image: "https://m.media-amazon.com/images/I/81HYXKqPKBL._SL500_.jpg",
            rating: 4.3,
            reviews: 876,
            price: 648
        },
        {
            id: "B08CXYR6V9",
            name: "オカモト キッチン用手袋 長持ち フィットタイプ Mサイズ 2双パック",
            image: "https://m.media-amazon.com/images/I/71TpQBY6MQL._SL500_.jpg",
            rating: 4.4,
            reviews: 543,
            price: 498
        },
        {
            id: "B07KQWYNMV",
            name: "エステー 使い捨て手袋 ニトリルゴム 100枚 Mサイズ",
            image: "https://m.media-amazon.com/images/I/61VqNOOBsFL._SL500_.jpg",
            rating: 4.1,
            reviews: 3210,
            price: 1280
        },
        {
            id: "B08L7NKDFJ",
            name: "キッチン用エプロン 防水 男女兼用 首掛け式 ポケット付き",
            image: "https://m.media-amazon.com/images/I/71Yf9L9rOPL._SL500_.jpg",
            rating: 4.2,
            reviews: 765,
            price: 1380
        }
    ]
};

// 商品HTMLを生成する関数（ih-heavy.htmlと同じ形式）
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

// sink-light.htmlとsink-heavy.htmlを修正
const files = ['kitchen/sink-light.html', 'kitchen/sink-heavy.html'];

files.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // おすすめ商品セクションを探す
    const productHeaderIndex = content.indexOf('<h2>おすすめ商品</h2>');
    if (productHeaderIndex === -1) {
        console.log(`No products section found in: ${filePath}`);
        return;
    }
    
    // セクションの開始位置を探す
    const sectionStart = content.lastIndexOf('<div class="section">', productHeaderIndex);
    const nextSectionIndex = content.indexOf('<div class="section', productHeaderIndex + 1);
    const bodyEndIndex = content.indexOf('</body>', productHeaderIndex);
    const sectionEnd = nextSectionIndex !== -1 && nextSectionIndex < bodyEndIndex ? nextSectionIndex : bodyEndIndex;
    
    // 新しい商品セクションを生成
    const newProductSection = `<div class="section">
            <h2>おすすめ商品</h2>
            <h3>洗剤・クリーナー</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${sinkProducts.cleaners.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>掃除道具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${sinkProducts.tools.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
            <h3>保護具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
${sinkProducts.protections.map(p => generateProductHTML(p)).join('\n')}
                </div>
            </div>
        </div>`;
    
    // コンテンツを更新
    content = content.substring(0, sectionStart) + newProductSection + '\n        ' + content.substring(sectionEnd);
    
    // ファイルを保存
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed products in: ${filePath}`);
});

console.log('Sink product fix complete!');