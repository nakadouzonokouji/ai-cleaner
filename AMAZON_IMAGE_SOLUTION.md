# Amazon商品画像表示の解決ガイド

## 問題の概要
Amazon商品画像が404エラーで表示されない問題を解決するための実装ガイドです。

## 解決方法

### 1. クライアントサイドの改善

#### 複数URLパターンの試行
```javascript
// app.js の displayProducts メソッドを以下のように修正

// 画像URL生成部分を改善
const imageUrls = [
    // パターン1: ASINベースの画像URL
    `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg`,
    
    // パターン2: 画像IDベース（画像IDがある場合）
    product.imageId ? `https://m.media-amazon.com/images/I/${product.imageId}._AC_SL500_.jpg` : null,
    
    // パターン3: APIから取得した画像
    product.images?.large,
    product.images?.medium,
    
    // フィルタリング（nullを除外）
].filter(url => url);

// HTML生成時に複数のURLを試すように変更
html += `
    <div class="relative mb-4">
        <img src="${imageUrls[0]}" 
             alt="${product.name}" 
             class="w-full h-40 object-contain rounded-lg" 
             onerror="this.onerror=null; tryNextImage(this, ${JSON.stringify(imageUrls)}, 1);">
        <div class="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center" style="display:none;">
            <div class="text-center">
                <div class="text-5xl mb-2">${product.emoji}</div>
                <div class="text-sm text-gray-600">${product.name.split(' ')[0]}</div>
            </div>
        </div>
    </div>
`;
```

#### グローバル関数の追加
```javascript
// グローバルスコープに追加
window.tryNextImage = function(img, urls, index) {
    if (index < urls.length) {
        img.src = urls[index];
        img.onerror = function() {
            tryNextImage(img, urls, index + 1);
        };
    } else {
        // すべて失敗した場合はフォールバック表示
        img.style.display = 'none';
        img.nextElementSibling.style.display = 'flex';
    }
};
```

### 2. サーバーサイドプロキシの利用

#### PHPプロキシ設定（エックスサーバー用）
1. `/server/amazon-image-proxy.php` をサーバーにアップロード
2. キャッシュディレクトリに書き込み権限を設定
```bash
chmod 755 server/cache/images/
```

#### JavaScript側の実装
```javascript
async function getAmazonImageUrl(asin) {
    try {
        const response = await fetch('/server/amazon-image-proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ asin })
        });
        
        const data = await response.json();
        if (data.success && data.imageUrl) {
            return data.imageUrl;
        }
    } catch (error) {
        console.error('画像URL取得エラー:', error);
    }
    
    // フォールバック
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
}
```

### 3. Amazon PA-API の正しい利用

#### 画像URL取得の修正
```javascript
// amazon-api.js の processAmazonResponse を確認
// APIレスポンスから正しく画像URLを取得
const imageUrl = item.Images?.Primary?.Large?.URL || 
                 item.Images?.Primary?.Medium?.URL ||
                 item.Images?.Primary?.Small?.URL;
```

### 4. 推奨される実装順序

1. **まず試すべき方法**
   - クライアントサイドで複数のURLパターンを試す実装を追加
   - これだけで多くの画像が表示されるようになる

2. **それでも表示されない場合**
   - サーバーサイドプロキシを実装
   - スクレイピングによる画像URL取得

3. **最終手段**
   - Amazon PA-API を正しく設定して利用
   - リアルタイムで正確な画像URLを取得

## デバッグ方法

### ブラウザコンソールでのテスト
```javascript
// 画像URLパターンをテスト
const testAsin = 'B07C44DM6S';
const patterns = [
    `https://images-na.ssl-images-amazon.com/images/P/${testAsin}.01._SCLZZZZZZZ_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${testAsin}.01.LZZZZZZZ.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${testAsin}.01._SL500_.jpg`
];

patterns.forEach(url => {
    const img = new Image();
    img.onload = () => console.log('✓ 成功:', url);
    img.onerror = () => console.log('✗ 失敗:', url);
    img.src = url;
});
```

## 注意事項

1. **CORS制限**
   - 一部のAmazon画像URLはCORS制限があるため、直接アクセスできない場合がある
   - サーバーサイドプロキシを使用することで回避可能

2. **レート制限**
   - 画像URLへの大量アクセスは避ける
   - キャッシュを活用して負荷を軽減

3. **利用規約**
   - Amazon の利用規約を遵守する
   - 商業利用の場合は Amazon アソシエイトプログラムへの登録が必要

## まとめ

最も簡単で効果的な解決方法は、クライアントサイドで複数のURLパターンを順番に試すことです。
これにより、ほとんどの商品画像が表示されるようになります。
それでも表示されない場合は、サーバーサイドプロキシやPA-APIの利用を検討してください。