const { searchWithSDK } = require('./collect-all-products-sdk');

async function testSingleCategory() {
    console.log('テスト: 単一カテゴリの商品検索');
    
    try {
        const results = await searchWithSDK('ウタマロクリーナー', 3);
        console.log('\n検索結果:');
        console.log(`商品数: ${results.length}`);
        
        if (results.length > 0) {
            console.log('\n最初の商品:');
            const product = results[0];
            console.log({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image ? '画像URL有り' : '画像なし',
                url: product.url
            });
        }
    } catch (error) {
        console.error('エラー:', error.message);
    }
}

testSingleCategory();