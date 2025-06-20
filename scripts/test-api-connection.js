require('dotenv').config();
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

// 認証情報の確認
console.log('認証情報の確認:');
console.log('Access Key:', accessKey ? `${accessKey.substring(0, 10)}...` : '未設定');
console.log('Secret Key:', secretKey ? '設定済み' : '未設定');
console.log('Partner Tag:', partnerTag || '未設定');
console.log('');

if (!accessKey || !secretKey || !partnerTag) {
  console.error('エラー: 環境変数が正しく設定されていません。');
  console.error('.envファイルを確認してください。');
  process.exit(1);
}

// リクエストパラメータ
const timestamp = new Date().toISOString();
const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`;
const payload = JSON.stringify({
  PartnerTag: partnerTag,
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.co.jp',
  Resources: ['ItemInfo.Title', 'Images.Primary.Large'],
  ItemCount: 1,
  Keywords: 'マジックリン'
});

// 日付フォーマット
const dateStamp = timestamp.split('T')[0].replace(/-/g, '');
const amzDate = timestamp.replace(/[:-]/g, '').replace(/\.\d{3}/, '');

// リクエストヘッダー
const headers = {
  'content-encoding': 'amz-1.0',
  'content-type': 'application/json; charset=utf-8',
  'host': HOST,
  'x-amz-date': amzDate,
  'x-amz-target': target
};

// 正規ヘッダー
const canonicalHeaders = Object.entries(headers)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}:${v}\n`)
  .join('');

// 署名済みヘッダー
const signedHeaders = Object.keys(headers)
  .sort()
  .join(';');

// 正規リクエストの作成
const canonicalRequest = [
  'POST',
  '/paapi5/searchitems',
  '',
  canonicalHeaders,
  signedHeaders,
  crypto.createHash('sha256').update(payload).digest('hex')
].join('\n');

// 署名文字列の作成
const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
const stringToSign = [
  'AWS4-HMAC-SHA256',
  amzDate,
  credentialScope,
  crypto.createHash('sha256').update(canonicalRequest).digest('hex')
].join('\n');

// 署名キーの作成
const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
  const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  return crypto.createHmac('sha256', kService).update('aws4_request').digest();
};

const signingKey = getSignatureKey(secretKey, dateStamp, REGION, SERVICE);
const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

// Authorizationヘッダー
headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

// リクエストオプション
const options = {
  hostname: HOST,
  path: '/paapi5/searchitems',
  method: 'POST',
  headers: headers
};

console.log('Amazon PA-APIへの接続をテスト中...\n');

// リクエスト送信
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('ステータスコード:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ API接続成功！\n');
        if (response.SearchResult && response.SearchResult.Items && response.SearchResult.Items.length > 0) {
          const item = response.SearchResult.Items[0];
          console.log('テスト商品情報:');
          console.log('- タイトル:', item.ItemInfo?.Title?.DisplayValue || 'タイトルなし');
          console.log('- ASIN:', item.ASIN);
          console.log('- URL:', item.DetailPageURL);
        }
      } else {
        console.error('\n❌ APIエラー:');
        console.error(JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.error('\n❌ レスポンス解析エラー:');
      console.error(data);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ 接続エラー:');
  console.error(e.message);
});

req.write(payload);
req.end();