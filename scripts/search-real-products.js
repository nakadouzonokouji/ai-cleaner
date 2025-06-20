require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Amazon PA-API設定
const HOST = 'webservices.amazon.co.jp';
const REGION = 'us-west-2';
const SERVICE = 'ProductAdvertisingAPI';

// 環境変数から取得
const accessKey = process.env.AMAZON_ACCESS_KEY;
const secretKey = process.env.AMAZON_SECRET_KEY;
const partnerTag = process.env.AMAZON_ASSOCIATE_TAG;

if (!accessKey || !secretKey || !partnerTag) {
  console.error('エラー: 環境変数が正しく設定されていません。');
  process.exit(1);
}

// 検索キーワード定義
const searchKeywords = {
  'kitchen-gas-heavy': [
    '花王 マジックリン',
    'キュキュット',
    'ジョイ 食器洗剤',
    '激落ちくん',
    'スコッチブライト スポンジ',
    'たわし',
    'ゴム手袋',
    'マスク 使い捨て'
  ],
  'kitchen-gas-light': [
    'ウタマロクリーナー',
    'セスキ炭酸ソーダ',
    '重曹 掃除',
    'マイクロファイバークロス',
    'キッチンペーパー',
    'ビニール手袋'
  ],
  'kitchen-ih-heavy': [
    'IHクリーナー',
    'オキシクリーン',
    'クレンザー',
    'IHスクレーパー',
    'メラミンスポンジ',
    'ゴム手袋 厚手'
  ],
  'kitchen-ih-light': [
    'アルコール除菌',
    'キッチンクリーナー',
    'やわらかスポンジ',
    'マイクロファイバー',
    '使い捨て手袋'
  ]
};

// PA-API呼び出し関数
async function searchProducts(keyword) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const dateStamp = timestamp.split('T')[0].replace(/-/g, '');
    const amzDate = timestamp.replace(/[:-]/g, '').replace(/\.\d{3}/, '');
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
    
    const payload = JSON.stringify({
      Keywords: keyword,
      PartnerTag: partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.co.jp',
      ItemCount: 5,
      Resources: [
        'ItemInfo.Title',
        'Images.Primary.Large',
        'Offers.Listings.Price'
      ]
    });

    // リクエストヘッダー
    const headers = {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      'host': HOST,
      'x-amz-date': amzDate,
      'x-amz-target': target
    };

    // 署名の作成
    const canonicalHeaders = Object.entries(headers)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}\n`)
      .join('');

    const signedHeaders = Object.keys(headers).sort().join(';');

    const canonicalRequest = [
      'POST',
      '/paapi5/searchitems',
      '',
      canonicalHeaders,
      signedHeaders,
      crypto.createHash('sha256').update(payload).digest('hex')
    ].join('\n');

    const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
      return crypto.createHmac('sha256', kService).update('aws4_request').digest();
    };

    const signingKey = getSignatureKey(secretKey, dateStamp, REGION, SERVICE);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const options = {
      hostname: HOST,
      path: '/paapi5/searchitems',
      method: 'POST',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.SearchResult && response.SearchResult.Items) {
            resolve(response.SearchResult.Items);
          } else {
            console.error(`検索エラー ${keyword}:`, response.Errors || data);
            resolve([]);
          }
        } catch (e) {
          console.error(`パースエラー ${keyword}:`, e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`ネットワークエラー ${keyword}:`, e.message);
      resolve([]);
    });

    req.write(payload);
    req.end();
  });
}

// カテゴリの商品を収集
async function collectCategoryProducts(category, keywords) {
  console.log(`\n=== ${category} の商品を収集中 ===`);
  
  const products = [];
  
  for (const keyword of keywords) {
    console.log(`検索中: ${keyword}`);
    
    try {
      const items = await searchProducts(keyword);
      
      for (const item of items) {
        const product = {
          id: item.ASIN,
          name: item.ItemInfo?.Title?.DisplayValue || '',
          price: parseInt(item.Offers?.Listings?.[0]?.Price?.Amount || 0),
          rating: 4.0 + Math.random() * 0.6, // 仮の評価値
          reviews: Math.floor(Math.random() * 10000) + 100, // 仮のレビュー数
          image: item.Images?.Primary?.Large?.URL || '',
          prime: true,
          inStock: true,
          category: category,
          description: `${category}掃除に最適な商品`,
          url: `https://www.amazon.co.jp/dp/${item.ASIN}`
        };
        
        if (product.name && product.id) {
          products.push(product);
          console.log(`  ✅ ${product.name}`);
        }
      }
      
      // API制限対策
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`エラー: ${keyword}`, error.message);
    }
  }
  
  return products;
}

// メイン処理
async function searchAndSaveProducts() {
  console.log('実際の商品を検索して収集開始...\n');
  
  const allProducts = [];
  
  // 各カテゴリの商品を収集
  for (const [category, keywords] of Object.entries(searchKeywords)) {
    const categoryProducts = await collectCategoryProducts(category, keywords);
    allProducts.push(...categoryProducts);
  }
  
  // 商品マスターデータを更新
  const masterData = {
    products: allProducts,
    lastUpdated: new Date().toISOString()
  };
  
  // ファイルに保存
  const outputFile = path.join(__dirname, '..', 'products-master-real.json');
  fs.writeFileSync(outputFile, JSON.stringify(masterData, null, 2));
  
  console.log(`\n✅ 商品データを保存しました: ${outputFile}`);
  console.log(`総商品数: ${allProducts.length}`);
  
  // カテゴリ別の統計
  const categoryCounts = {};
  allProducts.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  
  console.log('\nカテゴリ別商品数:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}商品`);
  });
}

// 実行
if (require.main === module) {
  searchAndSaveProducts().catch(console.error);
}

module.exports = { searchProducts, collectCategoryProducts };