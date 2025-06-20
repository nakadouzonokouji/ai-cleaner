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

// 商品マスターファイルを読み込む
const productsFile = path.join(__dirname, '..', 'products-master.json');
const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// PA-API呼び出し関数
async function fetchProductFromAPI(asin) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const dateStamp = timestamp.split('T')[0].replace(/-/g, '');
    const amzDate = timestamp.replace(/[:-]/g, '').replace(/\.\d{3}/, '');
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
    
    const payload = JSON.stringify({
      ItemIds: [asin],
      PartnerTag: partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.co.jp',
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

    // 署名の作成（test-api-connection.jsと同じロジック）
    const canonicalHeaders = Object.entries(headers)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}\n`)
      .join('');

    const signedHeaders = Object.keys(headers).sort().join(';');

    const canonicalRequest = [
      'POST',
      '/paapi5/getitems',
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
      path: '/paapi5/getitems',
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
          if (res.statusCode === 200 && response.ItemsResult) {
            resolve(response.ItemsResult);
          } else {
            console.error(`ASINエラー ${asin}:`, response.Errors || data);
            resolve(null);
          }
        } catch (e) {
          console.error(`パースエラー ${asin}:`, e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`ネットワークエラー ${asin}:`, e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

// 商品情報を更新
async function updateProductInfo(product) {
  console.log(`商品情報を取得中: ${product.id} - ${product.name}`);
  
  const result = await fetchProductFromAPI(product.id);
  
  if (result && result.Items && result.Items.length > 0) {
    const item = result.Items[0];
    
    // 商品情報を更新
    const updatedProduct = {
      ...product,
      name: item.ItemInfo?.Title?.DisplayValue || product.name,
      price: item.Offers?.Listings?.[0]?.Price?.Amount || product.price,
      rating: product.rating, // CustomerReviewsは別途取得が必要
      reviews: product.reviews, // CustomerReviewsは別途取得が必要
      image: item.Images?.Primary?.Large?.URL || product.image,
      prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || product.prime,
      inStock: true, // Availabilityは別途取得が必要
      url: `https://www.amazon.co.jp/dp/${product.id}?tag=${partnerTag}`,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`✅ 更新成功: ${product.id}`);
    return updatedProduct;
  } else {
    console.log(`❌ 更新失敗: ${product.id} - APIから情報を取得できませんでした`);
    return product;
  }
}

// メイン処理
async function collectAllProducts() {
  console.log('Amazon PA-APIを使用して商品データを収集開始...\n');
  
  const updatedProducts = [];
  const batchSize = 1; // 一度に処理する商品数（API制限のため1に減らす）
  const delay = 2000; // バッチ間の遅延（ミリ秒）
  
  // バッチ処理（テストのため最初の10件のみ）
  const testLimit = Math.min(10, productsData.products.length);
  for (let i = 0; i < testLimit; i += batchSize) {
    const batch = productsData.products.slice(i, i + batchSize);
    
    console.log(`\nバッチ ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsData.products.length / batchSize)} を処理中...`);
    
    // バッチ内の商品を並列処理
    const batchResults = await Promise.all(
      batch.map(product => updateProductInfo(product))
    );
    
    updatedProducts.push(...batchResults);
    
    // 次のバッチまで待機（API制限対策）
    if (i + batchSize < productsData.products.length) {
      console.log(`次のバッチまで ${delay / 1000} 秒待機...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 更新されたデータを保存
  const updatedData = {
    ...productsData,
    products: updatedProducts,
    lastUpdated: new Date().toISOString()
  };
  
  // バックアップを作成
  const backupFile = path.join(__dirname, '..', 'products-master-backup.json');
  fs.writeFileSync(backupFile, JSON.stringify(productsData, null, 2));
  console.log(`\nバックアップを作成: ${backupFile}`);
  
  // 更新されたデータを保存
  fs.writeFileSync(productsFile, JSON.stringify(updatedData, null, 2));
  console.log(`商品データを更新: ${productsFile}`);
  
  // 統計情報を表示
  const successCount = updatedProducts.filter(p => p.lastUpdated).length;
  console.log(`\n収集完了:`);
  console.log(`- 総商品数: ${productsData.products.length}`);
  console.log(`- 更新成功: ${successCount}`);
  console.log(`- 更新失敗: ${productsData.products.length - successCount}`);
}

// 実行
collectAllProducts().catch(console.error);