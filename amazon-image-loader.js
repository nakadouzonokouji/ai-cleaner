/**
 * Amazon画像ローダー（2025年1月版）
 * 複数の方法を組み合わせて確実にAmazon商品画像を表示
 */

class AmazonImageLoader {
    constructor() {
        // 画像取得の優先順位設定
        this.methods = {
            api: true,        // PA-API経由
            static: true,     // 静的URLパターン
            proxy: true,      // プロキシ経由
            widget: false     // ウィジェット（必要に応じて）
        };
        
        // CDNドメインリスト（フォールバック用）
        this.cdnDomains = [
            'm.media-amazon.com',
            'images-na.ssl-images-amazon.com', 
            'images-fe.ssl-images-amazon.com',
            'images-eu.ssl-images-amazon.com'
        ];
        
        // 画像サイズ
        this.sizes = {
            small: 160,
            medium: 300,
            large: 500,
            xlarge: 1000,
            xxlarge: 1500
        };
        
        // キャッシュ設定
        this.imageCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24時間
        
        // レート制限
        this.requestQueue = [];
        this.isProcessing = false;
        this.maxConcurrent = 5;
        this.requestDelay = 100; // ms
    }
    
    /**
     * 商品画像を取得（メインメソッド）
     */
    async getProductImage(asin, options = {}) {
        const {
            size = 'large',
            imageId = null,
            useCache = true,
            fallbackImage = null
        } = options;
        
        // キャッシュチェック
        if (useCache) {
            const cached = this.getFromCache(asin, size);
            if (cached) {
                console.log(`✅ キャッシュから画像取得: ${asin}`);
                return cached;
            }
        }
        
        let imageUrls = [];
        
        try {
            // 1. PA-API経由で取得を試みる
            if (this.methods.api && window.amazonAPI) {
                const apiData = await this.fetchFromAPI(asin);
                if (apiData?.images) {
                    imageUrls = this.extractImageUrls(apiData.images, size);
                }
            }
            
            // 2. 静的URLパターンを使用
            if (this.methods.static && imageId) {
                const staticUrls = this.buildStaticUrls(imageId, size);
                imageUrls = [...imageUrls, ...staticUrls];
            }
            
            // 3. プロキシ経由で取得
            if (this.methods.proxy && imageUrls.length === 0) {
                const proxyData = await this.fetchViaProxy(asin);
                if (proxyData?.imageUrl) {
                    imageUrls.push(proxyData.imageUrl);
                }
            }
            
            // 4. デフォルトのフォールバック
            if (imageUrls.length === 0 && fallbackImage) {
                imageUrls.push(fallbackImage);
            }
            
            // キャッシュに保存
            if (useCache && imageUrls.length > 0) {
                this.saveToCache(asin, size, imageUrls);
            }
            
            return imageUrls;
            
        } catch (error) {
            console.error(`❌ 画像取得エラー (${asin}):`, error);
            return fallbackImage ? [fallbackImage] : [];
        }
    }
    
    /**
     * PA-APIから画像データを取得
     */
    async fetchFromAPI(asin) {
        try {
            const products = await window.amazonAPI.getItems([asin]);
            return products[asin] || null;
        } catch (error) {
            console.warn('API取得失敗:', error);
            return null;
        }
    }
    
    /**
     * プロキシサーバー経由で画像を取得
     */
    async fetchViaProxy(asin) {
        try {
            const response = await fetch(`/api/amazon-image/${asin}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Proxy error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('プロキシ取得失敗:', error);
            return null;
        }
    }
    
    /**
     * 静的URLパターンを構築
     */
    buildStaticUrls(imageId, size = 'large') {
        const urls = [];
        const sizeValue = this.sizes[size] || this.sizes.large;
        
        // 各CDNドメインに対してURL生成
        this.cdnDomains.forEach(domain => {
            // メインサイズ
            urls.push(`https://${domain}/images/I/${imageId}._AC_SL${sizeValue}_.jpg`);
            
            // フォールバックサイズも追加
            if (sizeValue !== 300) {
                urls.push(`https://${domain}/images/I/${imageId}._AC_SL300_.jpg`);
            }
        });
        
        return urls;
    }
    
    /**
     * APIレスポンスから画像URLを抽出
     */
    extractImageUrls(images, preferredSize) {
        const urls = [];
        
        if (images.large) urls.push(images.large);
        if (images.medium) urls.push(images.medium);
        if (images.small) urls.push(images.small);
        
        // フォールバックURLも追加
        if (images.fallback && Array.isArray(images.fallback)) {
            urls.push(...images.fallback);
        }
        
        return urls;
    }
    
    /**
     * 画像要素を作成（自動フォールバック付き）
     */
    createImageElement(product, options = {}) {
        const {
            size = 'large',
            className = '',
            alt = product.name || '商品画像',
            loading = 'lazy',
            onLoad = null,
            onError = null
        } = options;
        
        const img = document.createElement('img');
        img.alt = alt;
        img.loading = loading;
        img.decoding = 'async';
        if (className) img.className = className;
        
        // 画像URLを取得して設定
        this.getProductImage(product.asin, {
            size,
            imageId: product.imageId || window.amazonAPI?.getImageId(product.asin)
        }).then(urls => {
            if (urls.length > 0) {
                this.setImageWithFallback(img, urls, onLoad, onError);
            } else {
                // 画像が見つからない場合
                this.handleNoImage(img, product);
            }
        });
        
        return img;
    }
    
    /**
     * フォールバック機能付きで画像を設定
     */
    setImageWithFallback(img, urls, onLoad, onError) {
        let currentIndex = 0;
        
        const tryNextUrl = () => {
            if (currentIndex >= urls.length) {
                // すべてのURLが失敗
                console.error('すべての画像URLが失敗しました');
                if (onError) onError(img);
                this.handleNoImage(img);
                return;
            }
            
            img.src = urls[currentIndex];
            currentIndex++;
        };
        
        img.onload = function() {
            console.log(`✅ 画像読み込み成功: ${this.src}`);
            if (onLoad) onLoad(this);
        };
        
        img.onerror = function() {
            console.warn(`❌ 画像読み込み失敗: ${this.src}`);
            tryNextUrl();
        };
        
        // 最初のURLを設定
        tryNextUrl();
    }
    
    /**
     * 画像が見つからない場合の処理
     */
    handleNoImage(img, product = {}) {
        // プレースホルダー要素に置き換え
        const placeholder = document.createElement('div');
        placeholder.className = img.className + ' no-image-placeholder';
        placeholder.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f3f4f6;
            border-radius: 8px;
            min-height: 160px;
            flex-direction: column;
            gap: 8px;
        `;
        
        placeholder.innerHTML = `
            <div class="text-5xl">${product.emoji || '📦'}</div>
            <div class="text-sm text-gray-600">${product.name?.split(' ')[0] || '商品画像'}</div>
        `;
        
        if (img.parentNode) {
            img.parentNode.replaceChild(placeholder, img);
        }
    }
    
    /**
     * キャッシュから取得
     */
    getFromCache(asin, size) {
        const key = `${asin}_${size}`;
        const cached = this.imageCache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.urls;
        }
        
        // 期限切れの場合は削除
        this.imageCache.delete(key);
        return null;
    }
    
    /**
     * キャッシュに保存
     */
    saveToCache(asin, size, urls) {
        const key = `${asin}_${size}`;
        this.imageCache.set(key, {
            urls,
            timestamp: Date.now()
        });
    }
    
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ 画像キャッシュをクリアしました');
    }
    
    /**
     * バッチ画像読み込み（複数商品を効率的に処理）
     */
    async loadBatchImages(products, options = {}) {
        const results = new Map();
        
        // レート制限を考慮してバッチ処理
        const chunks = this.chunkArray(products, this.maxConcurrent);
        
        for (const chunk of chunks) {
            const promises = chunk.map(async (product) => {
                const urls = await this.getProductImage(product.asin, {
                    ...options,
                    imageId: product.imageId
                });
                results.set(product.asin, urls);
            });
            
            await Promise.all(promises);
            
            // レート制限のための遅延
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.delay(this.requestDelay);
            }
        }
        
        return results;
    }
    
    /**
     * 配列を指定サイズのチャンクに分割
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    
    /**
     * 遅延ユーティリティ
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// グローバルインスタンスを作成
window.amazonImageLoader = new AmazonImageLoader();

// 使用例を提供
window.AmazonImageExample = {
    // 単一画像の表示
    displaySingleProduct: function(product) {
        const container = document.getElementById('product-container');
        const img = window.amazonImageLoader.createImageElement(product, {
            size: 'large',
            className: 'w-full h-40 object-contain rounded-lg',
            onLoad: (img) => console.log('画像読み込み完了:', img.src),
            onError: (img) => console.error('画像読み込み失敗')
        });
        container.appendChild(img);
    },
    
    // 複数商品の一括表示
    displayMultipleProducts: async function(products) {
        const container = document.getElementById('products-grid');
        const imageUrls = await window.amazonImageLoader.loadBatchImages(products);
        
        products.forEach(product => {
            const urls = imageUrls.get(product.asin);
            const productCard = this.createProductCard(product, urls);
            container.appendChild(productCard);
        });
    },
    
    // 商品カードの作成
    createProductCard: function(product, imageUrls) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const img = document.createElement('img');
        img.alt = product.name;
        
        if (imageUrls && imageUrls.length > 0) {
            window.amazonImageLoader.setImageWithFallback(img, imageUrls);
        } else {
            window.amazonImageLoader.handleNoImage(img, product);
        }
        
        card.appendChild(img);
        return card;
    }
};