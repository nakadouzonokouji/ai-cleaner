// Amazon商品画像ヘルパー - 複数の画像取得方法を提供

class AmazonImageHelper {
    constructor() {
        // 複数の画像URLパターンを定義
        this.imagePatterns = [
            // 現在最も一般的なパターン
            (asin) => `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`,
            (asin) => `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
            (asin) => `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL500_.jpg`,
            
            // 画像ID を使用するパターン（画像IDが必要）
            (imageId) => `https://m.media-amazon.com/images/I/${imageId}._AC_SL500_.jpg`,
            (imageId) => `https://m.media-amazon.com/images/I/${imageId}._SL500_.jpg`,
            (imageId) => `https://images-na.ssl-images-amazon.com/images/I/${imageId}._AC_SL500_.jpg`,
            
            // 古いパターン（フォールバック用）
            (asin) => `https://ecx.images-amazon.com/images/I/${asin}._SL500_.jpg`,
            (asin) => `https://images-jp.amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`
        ];
    }

    // ASINから複数の画像URLを生成
    generateImageUrls(asin, imageId = null) {
        const urls = [];
        
        // ASINベースのURLを生成
        this.imagePatterns.forEach(pattern => {
            urls.push(pattern(asin));
        });
        
        // 画像IDが提供されている場合
        if (imageId) {
            urls.unshift(`https://m.media-amazon.com/images/I/${imageId}._AC_SL500_.jpg`);
            urls.unshift(`https://m.media-amazon.com/images/I/${imageId}._SL500_.jpg`);
        }
        
        return urls;
    }

    // 画像要素を作成（フォールバック機能付き）
    createImageElement(product) {
        const container = document.createElement('div');
        container.className = 'relative';
        
        // メイン画像要素
        const img = document.createElement('img');
        img.className = 'w-full h-40 object-contain rounded-lg';
        img.alt = product.name || 'Amazon商品';
        
        // フォールバック画像要素（絵文字表示）
        const fallback = document.createElement('div');
        fallback.className = 'w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center';
        fallback.style.display = 'none';
        fallback.innerHTML = `
            <div class="text-center">
                <div class="text-5xl mb-2">${product.emoji || '📦'}</div>
                <div class="text-sm text-gray-600">${(product.name || '商品').split(' ')[0]}</div>
            </div>
        `;
        
        // 画像URLの候補を生成
        const imageUrls = this.generateImageUrls(product.asin, product.imageId);
        
        // 順番に画像を試す
        let urlIndex = 0;
        
        const tryNextUrl = () => {
            if (urlIndex < imageUrls.length) {
                img.src = imageUrls[urlIndex];
                urlIndex++;
            } else {
                // すべてのURLが失敗した場合
                img.style.display = 'none';
                fallback.style.display = 'flex';
                console.warn(`画像が見つかりません: ${product.asin}`);
            }
        };
        
        img.onerror = tryNextUrl;
        img.onload = () => {
            console.log(`画像読み込み成功: ${img.src}`);
        };
        
        // 最初のURLを設定
        tryNextUrl();
        
        container.appendChild(img);
        container.appendChild(fallback);
        
        return container;
    }

    // プロキシ経由で画像を取得（サーバーサイドで画像を取得）
    async getImageViaProxy(asin) {
        try {
            const response = await fetch('/api/amazon-image-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asin })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.imageUrl;
            }
        } catch (error) {
            console.error('プロキシ経由の画像取得エラー:', error);
        }
        return null;
    }

    // Open Graph メタデータから画像を取得する方法
    async getImageFromOpenGraph(asin) {
        try {
            // 注意: これはCORS制限のため、サーバーサイドで実行する必要があります
            const url = `https://www.amazon.co.jp/dp/${asin}`;
            // サーバーサイドでのスクレイピングが必要
            console.log('Open Graph画像取得にはサーバーサイドの実装が必要です');
        } catch (error) {
            console.error('Open Graph画像取得エラー:', error);
        }
        return null;
    }
}

// グローバルに公開
window.AmazonImageHelper = AmazonImageHelper;