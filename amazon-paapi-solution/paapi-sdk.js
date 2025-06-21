require('dotenv').config();

// PA-API 5.0 SDK のインポート
const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

// デフォルトクライアントの設定
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = 'webservices.amazon.co.jp';
defaultClient.region = 'us-west-2';

// GetItemsリクエストの設定
const api = new ProductAdvertisingAPIv1.DefaultApi();

// GetItemsリクエストを作成する関数
function createGetItemsRequest(asinList) {
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
    
    getItemsRequest['PartnerTag'] = process.env.AMAZON_ASSOCIATE_TAG;
    getItemsRequest['PartnerType'] = ProductAdvertisingAPIv1.PartnerType.Associates;
    getItemsRequest['Marketplace'] = 'www.amazon.co.jp';
    getItemsRequest['ItemIds'] = asinList;
    getItemsRequest['Resources'] = [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'Images.Primary.Small',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price'
    ];
    
    return getItemsRequest;
}

// 商品情報を取得する関数（エラーハンドリング強化版）
async function getItemsInfo(asinList) {
    try {
        const getItemsRequest = createGetItemsRequest(asinList);
        
        const response = await new Promise((resolve, reject) => {
            api.getItems(getItemsRequest, (error, data, response) => {
                if (error) {
                    // エラーの詳細を解析
                    if (error.status === 429) {
                        console.log('リクエスト制限に達しました。しばらく待ってから再試行してください。');
                        reject(new Error('RATE_LIMIT_EXCEEDED'));
                    } else if (error.status === 403) {
                        console.log('認証エラー: アクセスキーまたはシークレットキーを確認してください。');
                        reject(new Error('AUTHENTICATION_ERROR'));
                    } else if (error.status === 400) {
                        console.log('リクエストエラー: パラメータを確認してください。');
                        reject(new Error('BAD_REQUEST'));
                    } else {
                        reject(error);
                    }
                } else {
                    resolve(data);
                }
            });
        });
        
        return response;
    } catch (error) {
        console.error('Error fetching items:', error.message);
        throw error;
    }
}

// 画像URLを抽出する関数
function extractImageUrls(itemsResponse) {
    const imageUrls = {};
    
    if (itemsResponse.ItemsResult && itemsResponse.ItemsResult.Items) {
        itemsResponse.ItemsResult.Items.forEach(item => {
            const asin = item.ASIN;
            const images = item.Images;
            
            if (images && images.Primary) {
                imageUrls[asin] = {
                    large: images.Primary.Large ? images.Primary.Large.URL : null,
                    medium: images.Primary.Medium ? images.Primary.Medium.URL : null,
                    small: images.Primary.Small ? images.Primary.Small.URL : null
                };
            }
        });
    }
    
    return imageUrls;
}

// 遅延実行関数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// バッチ処理で複数のASINを処理する関数
async function processAsinsInBatches(asinList, batchSize = 10, delayMs = 1000) {
    const results = {};
    
    for (let i = 0; i < asinList.length; i += batchSize) {
        const batch = asinList.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`);
        
        try {
            const response = await getItemsInfo(batch);
            const imageUrls = extractImageUrls(response);
            Object.assign(results, imageUrls);
            
            // 次のバッチまで待機
            if (i + batchSize < asinList.length) {
                console.log(`Waiting ${delayMs}ms before next batch...`);
                await delay(delayMs);
            }
        } catch (error) {
            if (error.message === 'RATE_LIMIT_EXCEEDED') {
                console.log(`Rate limit exceeded for batch. Waiting 5 seconds...`);
                await delay(5000);
                i -= batchSize; // このバッチを再試行
            } else {
                console.error(`Error processing batch: ${error.message}`);
            }
        }
    }
    
    return results;
}

// モジュールとして使用する場合のエクスポート
module.exports = {
    getItemsInfo,
    extractImageUrls,
    createGetItemsRequest,
    processAsinsInBatches
};

// 直接実行された場合のテスト（デモモード）
if (require.main === module) {
    console.log('PA-API 5.0 SDK 設定テスト');
    console.log('認証情報:');
    console.log('- Access Key:', process.env.AMAZON_ACCESS_KEY ? '設定済み' : '未設定');
    console.log('- Secret Key:', process.env.AMAZON_SECRET_KEY ? '設定済み' : '未設定');
    console.log('- Associate Tag:', process.env.AMAZON_ASSOCIATE_TAG ? '設定済み' : '未設定');
    console.log('');
    console.log('SDKの設定は正常に完了しました。');
    console.log('実際のAPIテストは、リクエスト制限を避けるため、必要に応じて実行してください。');
}