// scripts/collect-products-sdk.js
require('dotenv').config();
const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

// クライアント設定
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = 'webservices.amazon.co.jp';
defaultClient.region = 'us-west-2';

const api = new ProductAdvertisingAPIv1.DefaultApi();

// 商品検索関数
async function searchProductsWithSDK(keyword) {
    const searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
    
    searchItemsRequest['PartnerTag'] = process.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22';
    searchItemsRequest['PartnerType'] = 'Associates';
    searchItemsRequest['Keywords'] = keyword;
    searchItemsRequest['SearchIndex'] = 'All';
    searchItemsRequest['ItemCount'] = 10;
    searchItemsRequest['Resources'] = [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
        'BrowseNodeInfo.BrowseNodes',
        'ItemInfo.Classifications'
    ];

    try {
        const response = await api.searchItems(searchItemsRequest);
        if (response.SearchResult && response.SearchResult.Items) {
            return response.SearchResult.Items.map(item => ({
                asin: item.ASIN,
                title: item.ItemInfo?.Title?.DisplayValue || '',
                image: item.Images?.Primary?.Large?.URL || '',
                price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '',
                rating: item.CustomerReviews?.StarRating?.Value || 0,
                url: `https://www.amazon.co.jp/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`,
                features: item.ItemInfo?.Features?.DisplayValues || [],
                isBestSeller: item.ItemInfo?.Classifications?.Binding?.DisplayValue?.includes('ベストセラー') || false
            }));
        }
        return [];
    } catch (error) {
        console.error(`Error searching ${keyword}:`, error);
        return [];
    }
}

// テスト実行
async function testSDK() {
    console.log('Testing PA-API SDK...');
    console.log('Access Key:', process.env.AMAZON_ACCESS_KEY ? 'Set' : 'Not set');
    console.log('Secret Key:', process.env.AMAZON_SECRET_KEY ? 'Set' : 'Not set');
    console.log('Partner Tag:', process.env.AMAZON_ASSOCIATE_TAG || 'Not set');
    
    try {
        const results = await searchProductsWithSDK('ウタマロクリーナー');
        console.log(`Found ${results.length} products`);
        if (results.length > 0) {
            console.log('First product:', results[0].title);
            console.log('ASIN:', results[0].asin);
            console.log('Price:', results[0].price);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

if (require.main === module) {
    testSDK();
}

module.exports = { searchProductsWithSDK };