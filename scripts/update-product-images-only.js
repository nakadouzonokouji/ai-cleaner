const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

// AWS SDKの設定を試す
try {
    const AWS = require('aws-sdk');
    console.log('AWS SDK loaded successfully');
} catch (error) {
    console.error('AWS SDK not found. Installing manually...');
    const { execSync } = require('child_process');
    execSync('npm install aws-sdk', { stdio: 'inherit' });
    const AWS = require('aws-sdk');
}

const AWS = require('aws-sdk');

// 設定
const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const PARTNER_TAG = 'imotokoiku-22';
const AWS_REGION = 'us-west-2';
const HOST = 'webservices.amazon.co.jp';
const ENDPOINT = `https://${HOST}/paapi5/getitems`;

// HTMLファイルのパスを取得
function getHtmlFiles() {
    const locations = ['bathroom', 'floor', 'kitchen', 'living', 'toilet', 'window'];
    const htmlFiles = [];
    
    locations.forEach(location => {
        const locationPath = path.join(__dirname, '..', location);
        if (fs.existsSync(locationPath)) {
            const files = fs.readdirSync(locationPath);
            files.forEach(file => {
                if (file.endsWith('.html') && file !== 'index.html') {
                    htmlFiles.push(path.join(locationPath, file));
                }
            });
        }
    });
    
    return htmlFiles;
}

// ASINを抽出
function extractASINs(html) {
    const asins = [];
    
    // data-asin属性から抽出
    const asinPattern = /data-asin="([A-Z0-9]{10})"/g;
    let match;
    
    while ((match = asinPattern.exec(html)) !== null) {
        if (!asins.includes(match[1])) {
            asins.push(match[1]);
        }
    }
    
    // Amazon URLから抽出
    const urlPattern = /href="[^"]*amazon\.co\.jp\/dp\/([A-Z0-9]{10})[^"]*"/g;
    
    while ((match = urlPattern.exec(html)) !== null) {
        if (!asins.includes(match[1])) {
            asins.push(match[1]);
        }
    }
    
    return asins;
}

// PA-APIリクエストを作成
function createRequest(asins) {
    const params = {
        ItemIds: asins,
        PartnerTag: PARTNER_TAG,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.jp',
        Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title'
        ]
    };
    
    return JSON.stringify(params);
}

// 署名を生成
function sign(key, msg) {
    return crypto.createHmac('sha256', key).update(msg).digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = sign('AWS4' + key, dateStamp);
    const kRegion = sign(kDate, regionName);
    const kService = sign(kRegion, serviceName);
    const kSigning = sign(kService, 'aws4_request');
    return kSigning;
}

// PA-APIリクエストを送信
async function callPAAPI(asins) {
    if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY) {
        console.error('AWS credentials not found in environment variables');
        return null;
    }
    
    const service = 'ProductAdvertisingAPI';
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);
    
    const requestPayload = createRequest(asins);
    const canonicalUri = '/paapi5/getitems';
    const canonicalQuerystring = '';
    const canonicalHeaders = 
        'content-type:application/json; charset=UTF-8\n' +
        'host:' + HOST + '\n' +
        'x-amz-date:' + amzDate + '\n' +
        'x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n';
    const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
    
    const payloadHash = crypto.createHash('sha256').update(requestPayload).digest('hex');
    const canonicalRequest = 'POST\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + 
        canonicalHeaders + '\n' + signedHeaders + '\n' + payloadHash;
    
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = dateStamp + '/' + AWS_REGION + '/' + service + '/aws4_request';
    const stringToSign = algorithm + '\n' + amzDate + '\n' + credentialScope + '\n' + 
        crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const signingKey = getSignatureKey(AMAZON_SECRET_KEY, dateStamp, AWS_REGION, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    
    const authorizationHeader = algorithm + ' Credential=' + AMAZON_ACCESS_KEY + '/' + 
        credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
    
    const options = {
        hostname: HOST,
        path: canonicalUri,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Amz-Date': amzDate,
            'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
            'Authorization': authorizationHeader,
            'Content-Length': Buffer.byteLength(requestPayload)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.Errors) {
                        console.error('PA-API errors:', response.Errors);
                        resolve(null);
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    console.error('Failed to parse response:', error);
                    resolve(null);
                }
            });
        });
        
        req.on('error', error => {
            console.error('Request error:', error);
            resolve(null);
        });
        
        req.write(requestPayload);
        req.end();
    });
}

// HTMLファイルの画像URLを更新
async function updateImageUrls(filePath) {
    console.log(`\nProcessing: ${filePath}`);
    
    const html = fs.readFileSync(filePath, 'utf8');
    const asins = extractASINs(html);
    
    if (asins.length === 0) {
        console.log('No ASINs found in file');
        return;
    }
    
    console.log(`Found ${asins.length} ASINs`);
    
    // PA-APIは一度に10個までのASINを処理可能
    const imageMap = {};
    
    for (let i = 0; i < asins.length; i += 10) {
        const batch = asins.slice(i, i + 10);
        console.log(`Fetching images for batch ${Math.floor(i/10) + 1}/${Math.ceil(asins.length/10)}`);
        
        const response = await callPAAPI(batch);
        
        if (response && response.ItemsResult && response.ItemsResult.Items) {
            response.ItemsResult.Items.forEach(item => {
                if (item.Images && item.Images.Primary && item.Images.Primary.Large) {
                    imageMap[item.ASIN] = item.Images.Primary.Large.URL;
                    console.log(`✓ ${item.ASIN}: ${item.Images.Primary.Large.URL}`);
                }
            });
        }
        
        // レート制限を避けるため少し待機
        if (i + 10 < asins.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // HTMLを更新
    let updatedHtml = html;
    let updateCount = 0;
    
    Object.entries(imageMap).forEach(([asin, newImageUrl]) => {
        // data-asinを持つ製品カードを探して画像URLを更新
        const productPattern = new RegExp(
            `(<div[^>]*data-asin="${asin}"[^>]*>.*?<img[^>]*src=")([^"]+)("[^>]*>)`,
            'gs'
        );
        
        updatedHtml = updatedHtml.replace(productPattern, (match, before, oldUrl, after) => {
            updateCount++;
            console.log(`Replacing image for ${asin}`);
            return before + newImageUrl + after;
        });
    });
    
    if (updateCount > 0) {
        fs.writeFileSync(filePath, updatedHtml);
        console.log(`✅ Updated ${updateCount} images in ${path.basename(filePath)}`);
    } else {
        console.log(`⚠️ No images updated in ${path.basename(filePath)}`);
    }
}

// メイン処理
async function main() {
    console.log('Starting image URL update process...');
    
    // 環境変数のチェック
    if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY) {
        console.error('\n❌ AWS credentials not found!');
        console.error('Please set AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY environment variables');
        process.exit(1);
    }
    
    // 特定のファイルが指定されているか確認
    const targetFile = process.argv[2];
    
    if (targetFile) {
        // 特定のファイルのみ処理
        if (!fs.existsSync(targetFile)) {
            console.error(`File not found: ${targetFile}`);
            process.exit(1);
        }
        await updateImageUrls(targetFile);
    } else {
        // すべてのHTMLファイルを処理
        const htmlFiles = getHtmlFiles();
        console.log(`Found ${htmlFiles.length} HTML files to process`);
        
        for (const file of htmlFiles) {
            await updateImageUrls(file);
            // レート制限を避けるため待機
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n✅ Image update process completed!');
}

// 実行
main().catch(console.error);