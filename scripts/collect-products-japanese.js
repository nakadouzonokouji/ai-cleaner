const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const amazonPaapi = require('amazon-paapi');

// 共通パラメータ
const commonParameters = {
    AccessKey: process.env.AMAZON_ACCESS_KEY,
    SecretKey: process.env.AMAZON_SECRET_KEY,
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.co.jp'
};

// 単一商品のテスト関数
async function testSingleProduct(keyword) {
    try {
        const requestParameters = {
            Keywords: keyword,
            SearchIndex: 'All',
            ItemCount: 1,
            Resources: [
                'Images.Primary.Large',
                'ItemInfo.Title',
                'Offers.Listings.Price'
            ],
            LanguageOfPreference: 'ja_JP'  // 日本語設定を追加
        };
        
        console.log('検索中:', keyword);
        const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);
        
        if (response.SearchResult && response.SearchResult.Items && response.SearchResult.Items.length > 0) {
            const item = response.SearchResult.Items[0];
            const product = {
                asin: item.ASIN,
                title: item.ItemInfo?.Title?.DisplayValue || 'タイトル不明',
                price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '価格不明',
                link: `https://www.amazon.co.jp/dp/${item.ASIN}?tag=${process.env.AMAZON_ASSOCIATE_TAG}`
            };
            console.log('✓ 商品が見つかりました:');
            console.log(product);
            return product;
        } else {
            console.log('✗ 商品が見つかりませんでした');
            return null;
        }
    } catch (error) {
        console.error('エラー:', error.message);
        return null;
    }
}

// コマンドラインから実行された場合
if (require.main === module) {
    const keyword = process.argv[2] || 'ウタマロクリーナー';
    testSingleProduct(keyword);
}

module.exports = { testSingleProduct };