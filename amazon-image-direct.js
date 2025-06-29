/**
 * Amazon商品画像の直接URL取得
 * PA-APIを使わずに画像を表示する代替手段
 */

class AmazonImageDirect {
    constructor() {
        // Amazon画像の直接URLマッピング
        this.imageUrls = {
            // キッチン用洗剤
            'B07C44DM6S': 'https://m.media-amazon.com/images/I/41PGzN2gYsL._AC_SL500_.jpg',
            'B002E1AU3A': 'https://m.media-amazon.com/images/I/71dQm5KhU5L._AC_SL500_.jpg',
            'B07QN4M52D': 'https://m.media-amazon.com/images/I/51Y8LxDKhYL._AC_SL500_.jpg',
            'B08KQ5F7MN': 'https://m.media-amazon.com/images/I/61mUcrLlYtL._AC_SL500_.jpg',
            
            // カビ取り剤
            'B0012R4V2S': 'https://m.media-amazon.com/images/I/71HGbz23mBL._AC_SL500_.jpg',
            'B07S2J294T': 'https://m.media-amazon.com/images/I/61VQDfQzYYL._AC_SL500_.jpg',
            'B08P5KLM3N': 'https://m.media-amazon.com/images/I/71ZxWxYDjFL._AC_SL500_.jpg',
            'B09KQR8MNP': 'https://m.media-amazon.com/images/I/71hBqE06uvL._AC_SL500_.jpg',
            
            // 水垢取り
            'B07KLM5678': 'https://m.media-amazon.com/images/I/51U3MtQqRML._AC_SL500_.jpg',
            'B08NOP9012': 'https://m.media-amazon.com/images/I/61GY5MM1qdL._AC_SL500_.jpg',
            'B01QRS3456': 'https://m.media-amazon.com/images/I/71-1zWz9v3L._AC_SL500_.jpg',
            'B09LMN7890': 'https://m.media-amazon.com/images/I/61VF7xo0XEL._AC_SL500_.jpg',
            
            // トイレ用洗剤
            'B0019R4QX2': 'https://m.media-amazon.com/images/I/71V1LrYwEYL._AC_SL500_.jpg',
            'B07YHL4567': 'https://m.media-amazon.com/images/I/61N+rXAe3nL._AC_SL500_.jpg',
            'B08YTR8901': 'https://m.media-amazon.com/images/I/71tN6mfBxdL._AC_SL500_.jpg',
            'B09WXY2345': 'https://m.media-amazon.com/images/I/71W9W8ZQGYL._AC_SL500_.jpg',
            
            // フロア掃除
            'B01N05Y41E': 'https://m.media-amazon.com/images/I/71CrYf0ttlL._AC_SL500_.jpg',
            'B005335D9S': 'https://m.media-amazon.com/images/I/71p5MddjqSL._AC_SL500_.jpg',
            'B005AILJ3O': 'https://m.media-amazon.com/images/I/81BCa8ZMceL._AC_SL500_.jpg',
            'B00OOCWP44': 'https://m.media-amazon.com/images/I/71nSGLs5QzL._AC_SL500_.jpg',
            
            // 掃除道具
            'B073C4QRLS': 'https://m.media-amazon.com/images/I/61v3xBheOuL._AC_SL500_.jpg',
            'B07BQFJ5K9': 'https://m.media-amazon.com/images/I/71J-sxBixJL._AC_SL500_.jpg',
            'B01KLM2345': 'https://m.media-amazon.com/images/I/71Bx8hhLzFL._AC_SL500_.jpg',
            'B08BCD3456': 'https://m.media-amazon.com/images/I/718BxWt0CEL._AC_SL500_.jpg'
        };
    }
    
    getImageUrl(asin) {
        return this.imageUrls[asin] || null;
    }
    
    getAllImages() {
        return this.imageUrls;
    }
    
    // 画像の有効性をチェック
    async checkImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // 有効な画像URLのみを返す
    async getValidImages() {
        const validImages = {};
        const checks = [];
        
        for (const [asin, url] of Object.entries(this.imageUrls)) {
            checks.push(
                this.checkImage(url).then(isValid => {
                    if (isValid) {
                        validImages[asin] = url;
                    }
                })
            );
        }
        
        await Promise.all(checks);
        return validImages;
    }
}

// グローバルに公開
window.AmazonImageDirect = AmazonImageDirect;