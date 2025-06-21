const fs = require('fs');
const path = require('path');
require('dotenv').config();
const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

// クライアント設定
const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY;
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY;
defaultClient.host = 'webservices.amazon.co.jp';
defaultClient.region = 'us-west-2';

const api = new ProductAdvertisingAPIv1.DefaultApi();

// HTMLファイルからASINを抽出
function extractASINsFromHTML(htmlContent) {
    const asinRegex = /https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/g;
    const asins = new Set();
    let match;
    
    while ((match = asinRegex.exec(htmlContent)) !== null) {
        asins.add(match[1]);
    }
    
    return Array.from(asins);
}

// SDKで商品情報を取得
async function getProductInfo(asins) {
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
    
    getItemsRequest['PartnerTag'] = process.env.AMAZON_ASSOCIATE_TAG || 'asdfghj12-22';
    getItemsRequest['PartnerType'] = 'Associates';
    getItemsRequest['ItemIds'] = asins;
    getItemsRequest['Resources'] = [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'Images.Primary.Small',
        'ItemInfo.Title'
    ];

    try {
        const response = await api.getItems(getItemsRequest);
        if (response.ItemsResult && response.ItemsResult.Items) {
            return response.ItemsResult.Items;
        }
        return [];
    } catch (error) {
        console.error('PA-API Error:', error);
        return [];
    }
}

// HTMLファイルの画像URLを更新
function updateImageURLs(htmlContent, productData) {
    let updatedContent = htmlContent;
    
    productData.forEach(product => {
        if (product.Images && product.Images.Primary) {
            const asin = product.ASIN;
            const newImageUrl = product.Images.Primary.Large?.URL || 
                              product.Images.Primary.Medium?.URL || 
                              product.Images.Primary.Small?.URL;
            
            if (newImageUrl) {
                // 古い画像URLパターンを新しいURLに置換
                const oldImagePattern = new RegExp(
                    `<img[^>]*data-product-asin="${asin}"[^>]*src="[^"]*"`,
                    'g'
                );
                
                updatedContent = updatedContent.replace(oldImagePattern, (match) => {
                    return match.replace(/src="[^"]*"/, `src="${newImageUrl}"`);
                });
                
                // 別のパターン（ASINがリンクに含まれている場合）
                const linkPattern = new RegExp(
                    `(<a[^>]*href="https://www\\.amazon\\.co\\.jp/dp/${asin}[^"]*"[^>]*>\\s*<img[^>]*src=")[^"]*("`,
                    'g'
                );
                
                updatedContent = updatedContent.replace(linkPattern, `$1${newImageUrl}$2`);
                
                console.log(`Updated image for ASIN ${asin}: ${newImageUrl}`);
            }
        }
    });
    
    return updatedContent;
}

// メイン処理
async function updateImages(htmlFilePath) {
    try {
        // HTMLファイルを読み込み
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        console.log(`Processing: ${htmlFilePath}`);
        
        // ASINを抽出
        const asins = extractASINsFromHTML(htmlContent);
        console.log(`Found ${asins.length} ASINs:`, asins);
        
        if (asins.length === 0) {
            console.log('No ASINs found in the HTML file.');
            return;
        }
        
        // 10個ずつ処理（PA-APIの制限）
        let allProductData = [];
        for (let i = 0; i < asins.length; i += 10) {
            const batch = asins.slice(i, i + 10);
            console.log(`Fetching batch ${Math.floor(i/10) + 1}/${Math.ceil(asins.length/10)}...`);
            
            const productData = await getProductInfo(batch);
            allProductData = allProductData.concat(productData);
            
            // レート制限対策（1秒待機）
            if (i + 10 < asins.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`Retrieved data for ${allProductData.length} products`);
        
        // 画像URLを更新
        const updatedContent = updateImageURLs(htmlContent, allProductData);
        
        // バックアップを作成
        const backupPath = htmlFilePath.replace('.html', '-backup.html');
        fs.writeFileSync(backupPath, htmlContent);
        console.log(`Backup created: ${backupPath}`);
        
        // 更新されたHTMLを保存
        fs.writeFileSync(htmlFilePath, updatedContent);
        console.log(`Updated: ${htmlFilePath}`);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// コマンドライン引数を取得
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('Usage: node update-images-sdk.js <html-file-path>');
    process.exit(1);
}

const htmlFilePath = path.resolve(args[0]);
if (!fs.existsSync(htmlFilePath)) {
    console.error(`File not found: ${htmlFilePath}`);
    process.exit(1);
}

// 実行
updateImages(htmlFilePath).catch(console.error);