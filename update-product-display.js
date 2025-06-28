// 商品表示の更新関数（app.jsに統合用）

function createProductImageElement(product) {
    // 複数の画像URLパターンを試す
    const imagePatterns = [
        // パターン1: ASINベースの直接URL
        `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_.jpg`,
        `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg`,
        `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SL500_.jpg`,
        
        // パターン2: 画像IDベース（画像IDがある場合）
        product.imageId ? `https://m.media-amazon.com/images/I/${product.imageId}._AC_SL500_.jpg` : null,
        product.imageId ? `https://m.media-amazon.com/images/I/${product.imageId}._SL500_.jpg` : null,
        
        // パターン3: API経由で取得した画像URL
        product.images?.large,
        product.images?.medium,
        product.images?.small,
        
        // パターン4: フォールバック
        `https://via.placeholder.com/500x500/f0f0f0/666666?text=${encodeURIComponent(product.name || '商品画像')}`
    ].filter(url => url); // nullを除外

    // HTML構造
    const html = `
        <div class="relative mb-4">
            <div class="image-container" data-asin="${product.asin}">
                <img class="product-image w-full h-40 object-contain rounded-lg" 
                     alt="${product.name || '商品'}"
                     data-urls='${JSON.stringify(imagePatterns)}'
                     data-current-index="0">
                <div class="loading-spinner absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div class="text-gray-400">
                        <svg class="animate-spin h-8 w-8" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
                <div class="fallback-display w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center" style="display:none;">
                    <div class="text-center">
                        <div class="text-5xl mb-2">${product.emoji || '📦'}</div>
                        <div class="text-sm text-gray-600">${(product.name || '商品').split(' ')[0]}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return html;
}

// 画像の遅延読み込みとフォールバック処理
function initializeProductImages() {
    document.querySelectorAll('.image-container').forEach(container => {
        const img = container.querySelector('.product-image');
        const spinner = container.querySelector('.loading-spinner');
        const fallback = container.querySelector('.fallback-display');
        
        if (!img) return;
        
        const urls = JSON.parse(img.dataset.urls || '[]');
        let currentIndex = parseInt(img.dataset.currentIndex || '0');
        
        const loadImage = () => {
            if (currentIndex >= urls.length) {
                // すべてのURLが失敗
                img.style.display = 'none';
                spinner.style.display = 'none';
                fallback.style.display = 'flex';
                return;
            }
            
            const testImg = new Image();
            testImg.onload = () => {
                // 成功
                img.src = urls[currentIndex];
                img.style.display = 'block';
                spinner.style.display = 'none';
                fallback.style.display = 'none';
            };
            
            testImg.onerror = () => {
                // 失敗 - 次のURLを試す
                currentIndex++;
                img.dataset.currentIndex = currentIndex;
                loadImage();
            };
            
            testImg.src = urls[currentIndex];
        };
        
        // 画像の読み込みを開始
        loadImage();
    });
}

// Intersection Observerを使用した遅延読み込み
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                initializeProductImages();
                observer.unobserve(container);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    document.querySelectorAll('.image-container').forEach(container => {
        imageObserver.observe(container);
    });
}

// エクスポート（app.jsで使用）
window.ProductImageHelper = {
    createProductImageElement,
    initializeProductImages,
    setupLazyLoading
};