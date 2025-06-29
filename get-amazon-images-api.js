/**
 * Amazon PA-API を使用して商品画像を取得
 */

console.log('🔧 get-amazon-images-api.js 読み込み開始');

class AmazonImageFetcher {
    constructor() {
        // cxmainte.comの場合はPHPプロキシを使用
        if (window.location.hostname === 'cxmainte.com' || window.location.hostname === 'www.cxmainte.com') {
            this.proxyUrl = '/tools/ai-cleaner/server/amazon-proxy.php';
        } else if (window.location.hostname.includes('netlify.app')) {
            this.proxyUrl = '/.netlify/functions/amazon-proxy';
        } else {
            // ローカル開発環境
            this.proxyUrl = '/server/amazon-proxy.php';
        }
        
        console.log('Amazon API Proxy URL:', this.proxyUrl);
    }

    async fetchProductImages(asins) {
        try {
            console.log('PA-APIで商品画像を取得中...', asins);
            
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asins: asins,
                    config: {
                        accessKey: window.AMAZON_CONFIG?.accessKey,
                        secretKey: window.AMAZON_CONFIG?.secretKey,
                        associateTag: window.AMAZON_CONFIG?.associateTag || 'asdfghj12-22'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.products) {
                console.log('✅ PA-APIから商品データ取得成功:', data.products);
                return this.extractImageUrls(data.products);
            } else {
                throw new Error(data.error || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('❌ PA-API エラー:', error);
            return null;
        }
    }

    extractImageUrls(products) {
        const imageMap = {};
        
        Object.entries(products).forEach(([asin, product]) => {
            if (product.images) {
                // 優先順位: large > medium > small
                const imageUrl = product.images.large || 
                                product.images.medium || 
                                product.images.small ||
                                null;
                
                if (imageUrl) {
                    imageMap[asin] = imageUrl;
                    console.log(`✅ ${asin}: ${imageUrl}`);
                }
            }
        });
        
        return imageMap;
    }

    async updateProductImages() {
        // すべての商品ASINを収集
        const asins = [
            // キッチン用洗剤
            'B07C44DM6S', 'B002E1AU3A', 'B07QN4M52D', 'B08KQ5F7MN',
            // カビ取り剤
            'B0012R4V2S', 'B07S2J294T', 'B08P5KLM3N', 'B09KQR8MNP',
            // 水垢取り
            'B07KLM5678', 'B08NOP9012', 'B01QRS3456', 'B09LMN7890',
            // トイレ用洗剤
            'B0019R4QX2', 'B07YHL4567', 'B08YTR8901', 'B09WXY2345',
            // フロア掃除
            'B01N05Y41E', 'B005335D9S', 'B005AILJ3O', 'B00OOCWP44',
            // 掃除道具
            'B073C4QRLS', 'B07BQFJ5K9', 'B01KLM2345', 'B08BCD3456'
        ];

        // PA-APIは一度に10商品まで
        const chunks = [];
        for (let i = 0; i < asins.length; i += 10) {
            chunks.push(asins.slice(i, i + 10));
        }

        const allImages = {};
        
        for (const chunk of chunks) {
            const images = await this.fetchProductImages(chunk);
            if (images) {
                Object.assign(allImages, images);
            }
            // レート制限を避けるため待機
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return allImages;
    }
}

// グローバルに公開
window.AmazonImageFetcher = AmazonImageFetcher;