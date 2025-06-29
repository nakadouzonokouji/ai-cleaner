const { chromium } = require('playwright');

async function fetchAmazonProductImage(asin) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Amazon商品ページにアクセス
        const url = `https://www.amazon.co.jp/dp/${asin}`;
        console.log(`Fetching image for ${asin} from ${url}...`);
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // 複数のセレクタを試す
        const imageSelectors = [
            'img#landingImage',
            'div#imgTagWrapperId img',
            'div.imgTagWrapper img',
            'div[data-a-image-container] img',
            'img[data-a-hires]',
            'img[data-old-hires]'
        ];
        
        let imageUrl = null;
        
        for (const selector of imageSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    // data-old-hires属性を優先
                    imageUrl = await element.getAttribute('data-old-hires') ||
                               await element.getAttribute('data-a-hires') ||
                               await element.getAttribute('src');
                    
                    if (imageUrl && imageUrl.includes('/images/I/')) {
                        console.log(`Found image URL with selector ${selector}: ${imageUrl}`);
                        break;
                    }
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        // JavaScriptから画像URLを取得
        if (!imageUrl) {
            imageUrl = await page.evaluate(() => {
                // colorImagesオブジェクトから取得
                if (window.colorImages && window.colorImages.initial) {
                    const images = window.colorImages.initial;
                    if (images.length > 0 && images[0].hiRes) {
                        return images[0].hiRes;
                    }
                }
                
                // jQuery objectから取得
                if (window.jQuery && window.jQuery('#landingImage').length) {
                    return window.jQuery('#landingImage').attr('data-old-hires') ||
                           window.jQuery('#landingImage').attr('src');
                }
                
                return null;
            });
        }
        
        await browser.close();
        
        if (imageUrl) {
            // 画像IDを抽出
            const match = imageUrl.match(/\/([A-Z0-9]+)\._/);
            const imageId = match ? match[1] : null;
            
            return {
                asin,
                imageUrl,
                imageId,
                success: true
            };
        } else {
            return {
                asin,
                success: false,
                error: 'No image found'
            };
        }
        
    } catch (error) {
        await browser.close();
        return {
            asin,
            success: false,
            error: error.message
        };
    }
}

// テスト用の商品リスト
const testProducts = [
    'B07C44DM6S', // キュキュット
    'B002E1AU3A', // チャーミーマジカ
    'B07QN4M52D', // ジョイ
    'B08KQ5F7MN'  // マジックリン
];

// 実行
(async () => {
    console.log('Starting Amazon image fetch...\n');
    
    const results = [];
    
    for (const asin of testProducts) {
        const result = await fetchAmazonProductImage(asin);
        results.push(result);
        console.log(`${asin}: ${result.success ? '✅ ' + result.imageUrl : '❌ ' + result.error}\n`);
        
        // レート制限を避けるため少し待つ
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 成功した画像URLを出力
    console.log('\n=== Results ===');
    console.log('Update dialogue-app.js with these URLs:\n');
    
    results.forEach(result => {
        if (result.success) {
            console.log(`'${result.asin}': '${result.imageUrl}',`);
        }
    });
})();