require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// PA-API設定
const config = {
    accessKey: process.env.AMAZON_ACCESS_KEY,
    secretKey: process.env.AMAZON_SECRET_KEY,
    partnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    host: 'webservices.amazon.co.jp',
    region: 'us-west-2',
    service: 'ProductAdvertisingAPI'
};

// 場所と詳細箇所の定義
const LOCATIONS = {
    kitchen: {
        name: 'キッチン',
        areas: {
            'ih': 'IHクッキングヒーター',
            'gas': 'ガスコンロ',
            'sink': 'シンク',
            'ventilation': '換気扇'
        }
    },
    bathroom: {
        name: 'バスルーム',
        areas: {
            'bathtub': '浴槽',
            'drain': '排水口',
            'shower': 'シャワー',
            'toilet': 'トイレ',
            'washstand': '洗面台',
            'ventilation': '換気扇'
        }
    },
    living: {
        name: 'リビング',
        areas: {
            'sofa': 'ソファ',
            'carpet': 'カーペット',
            'table': 'テーブル',
            'wall': '壁'
        }
    },
    floor: {
        name: '床',
        areas: {
            'flooring': 'フローリング',
            'tatami': '畳',
            'tile': 'タイル',
            'carpet': 'カーペット'
        }
    },
    toilet: {
        name: 'トイレ',
        areas: {
            'toilet': '便器',
            'floor': '床'
        }
    },
    window: {
        name: '窓',
        areas: {
            'glass': 'ガラス',
            'sash': 'サッシ'
        }
    }
};

// 検索クエリ生成関数
function generateSearchQueries(location, area, level) {
    const queries = {
        kitchen: {
            ih: {
                light: {
                    cleaners: ['ウタマロクリーナー', 'マジックリン キッチン', '重曹 掃除', 'セスキ炭酸ソーダ', 'アルコール除菌'],
                    tools: ['マイクロファイバークロス', 'キッチンペーパー', 'メラミンスポンジ', 'スポンジ キッチン', '掃除クロス'],
                    protection: ['ゴム手袋 薄手', '使い捨て手袋', 'ビニール手袋', 'ニトリル手袋', 'エプロン']
                },
                heavy: {
                    cleaners: ['IHクリーナー 焦げ', 'オキシクリーン', '強力マジックリン', 'キッチンハイター', '焦げ落とし 専用'],
                    tools: ['IHスクレーパー', 'ステンレスたわし', '研磨パッド', '焦げ取りスポンジ', 'クレンザー用ブラシ'],
                    protection: ['ゴム手袋 厚手', 'マスク', '保護メガネ', 'アームカバー', '防水エプロン']
                }
            },
            gas: {
                light: {
                    cleaners: ['マジックリン', 'ウタマロクリーナー', '重曹', 'キュキュット', 'アルコールスプレー'],
                    tools: ['キッチンスポンジ', 'マイクロファイバー', '歯ブラシ', 'メラミンスポンジ', 'ペーパータオル'],
                    protection: ['ビニール手袋', '使い捨て手袋', 'エプロン', 'アームカバー', 'マスク']
                },
                heavy: {
                    cleaners: ['油汚れマジックリン', 'レンジクリーナー', 'オキシクリーン', '重曹ペースト', '強力洗剤'],
                    tools: ['金属たわし', 'スクレーパー', 'ワイヤーブラシ', '研磨スポンジ', '五徳ブラシ'],
                    protection: ['ゴム手袋 厚手', '保護メガネ', 'マスク N95', '防水エプロン', '長袖カバー']
                }
            },
            sink: {
                light: {
                    cleaners: ['キュキュット', 'ジョイ', '重曹', 'クエン酸', 'ハイター'],
                    tools: ['スポンジ', 'ブラシ', 'マイクロファイバー', 'メラミンスポンジ', '排水口ネット'],
                    protection: ['ゴム手袋', 'ビニール手袋', 'エプロン', 'アームカバー', 'マスク']
                },
                heavy: {
                    cleaners: ['パイプユニッシュ', 'カビキラー', 'キッチンハイター', '排水口洗浄剤', 'クレンザー'],
                    tools: ['排水口ブラシ', 'ワイヤーブラシ', 'パイプクリーナー', 'たわし', 'ヘラ'],
                    protection: ['ゴム手袋 ロング', 'マスク', '保護メガネ', '防水エプロン', '換気扇']
                }
            },
            ventilation: {
                light: {
                    cleaners: ['マジックリン', 'セスキ炭酸ソーダ', 'アルコール', '中性洗剤', 'ウタマロ'],
                    tools: ['マイクロファイバー', 'ブラシ', 'スポンジ', '綿棒', '掃除機ノズル'],
                    protection: ['手袋', 'マスク', 'エプロン', '帽子', 'ゴーグル']
                },
                heavy: {
                    cleaners: ['換気扇用洗剤', '強力マジックリン', 'オキシ漬け', '業務用洗剤', 'アルカリ洗剤'],
                    tools: ['金属ブラシ', 'スクレーパー', 'つけ置き容器', '高圧洗浄', 'ドライバー'],
                    protection: ['ゴム手袋 厚手', '防護マスク', '保護メガネ', '作業着', '安全靴']
                }
            }
        },
        bathroom: {
            bathtub: {
                light: {
                    cleaners: ['バスマジックリン', 'ウタマロクリーナー', 'バスクリーナー', '重曹', 'クエン酸'],
                    tools: ['バススポンジ', 'ブラシ', 'マイクロファイバー', 'スクイージー', 'バスタオル'],
                    protection: ['ゴム手袋', 'ビニール手袋', 'バスシューズ', 'エプロン', 'マスク']
                },
                heavy: {
                    cleaners: ['カビキラー', 'カビハイター', '強力バスクリーナー', '湯垢洗剤', '酸性洗剤'],
                    tools: ['カビ取りブラシ', 'デッキブラシ', 'スチームクリーナー', '研磨パッド', 'ヘラ'],
                    protection: ['ゴム手袋 ロング', '防護マスク', 'ゴーグル', '防水エプロン', '長靴']
                }
            },
            drain: {
                light: {
                    cleaners: ['パイプユニッシュ', '重曹 クエン酸', 'バスマジックリン', '排水口クリーナー', 'カビ予防剤'],
                    tools: ['排水口ブラシ', 'ゴムベラ', '歯ブラシ', 'ピンセット', '髪の毛取り'],
                    protection: ['ゴム手袋', 'マスク', 'ビニール手袋', 'エプロン', 'ゴーグル']
                },
                heavy: {
                    cleaners: ['パイプハイター', 'ピーピースルー', '業務用パイプクリーナー', '高濃度洗剤', 'カビハイター'],
                    tools: ['ワイヤーブラシ', 'パイプクリーナー', '高圧洗浄', 'ドレンクリーナー', '分解工具'],
                    protection: ['ゴム手袋 ロング', '防毒マスク', '保護メガネ', '防護服', '長靴']
                }
            }
            // 他のバスルームエリアも同様に定義
        },
        // 他の場所も同様に定義
    };

    // デフォルトクエリ
    const defaultQueries = {
        cleaners: ['万能クリーナー', '中性洗剤', 'アルカリ洗剤', '除菌スプレー', 'クリーナー'],
        tools: ['掃除ブラシ', 'スポンジ', 'マイクロファイバー', '雑巾', 'モップ'],
        protection: ['手袋', 'マスク', 'エプロン', '保護具', '使い捨て手袋']
    };

    return queries[location]?.[area]?.[level] || defaultQueries;
}

// PA-API署名作成
function createSignature(stringToSign) {
    return crypto
        .createHmac('sha256', config.secretKey)
        .update(stringToSign)
        .digest('base64');
}

// PA-APIリクエスト
async function searchProducts(keyword, sortBy = 'Relevance') {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString();
        const dateStamp = timestamp.split('T')[0].replace(/-/g, '');
        const amzDate = timestamp.replace(/[:-]/g, '').replace(/\.\d{3}/, '');
        const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
        
        const payload = JSON.stringify({
            PartnerType: 'Associates',
            PartnerTag: config.partnerTag,
            Keywords: keyword,
            SearchIndex: 'All',
            ItemCount: 10,
            SortBy: sortBy,
            Resources: [
                'Images.Primary.Large',
                'ItemInfo.Title',
                'Offers.Listings.Price',
                'Offers.Listings.DeliveryInfo.IsPrimeEligible',
                'CustomerReviews.Count',
                'CustomerReviews.StarRating.Value'
            ],
            Marketplace: 'www.amazon.co.jp'
        });

        // リクエストヘッダー
        const headers = {
            'content-encoding': 'amz-1.0',
            'content-type': 'application/json; charset=utf-8',
            'host': config.host,
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

        const credentialScope = `${dateStamp}/${config.region}/${config.service}/aws4_request`;
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

        const signingKey = getSignatureKey(config.secretKey, dateStamp, config.region, config.service);
        const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

        headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        const options = {
            hostname: config.host,
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
                    if (res.statusCode === 200 && response.SearchResult) {
                        resolve(response.SearchResult.Items || []);
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

// 商品選定関数
async function selectBestProducts(keyword, category) {
    try {
        console.log(`  Searching: ${keyword}`);
        
        // 複数の並び順で検索
        const [relevanceResults, reviewResults] = await Promise.all([
            searchProducts(keyword, 'Relevance'),
            searchProducts(keyword, 'AvgCustomerReviews')
        ]);
        
        // 結果を統合してスコアリング
        const allResults = [...relevanceResults, ...reviewResults];
        const uniqueProducts = new Map();
        
        allResults.forEach(item => {
            if (!uniqueProducts.has(item.ASIN)) {
                const rating = item.CustomerReviews?.StarRating?.Value || 0;
                const title = item.ItemInfo?.Title?.DisplayValue || '';
                const isBestSeller = title.includes('ベストセラー');
                const isAmazonChoice = title.includes('Amazon\'s Choice');
                
                // スコア計算
                let score = rating * 20;
                if (isBestSeller) score += 30;
                if (isAmazonChoice) score += 20;
                
                uniqueProducts.set(item.ASIN, {
                    asin: item.ASIN,
                    title: title,
                    image: item.Images?.Primary?.Large?.URL || '',
                    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || '',
                    rating: rating,
                    score: score,
                    category: category
                });
            }
        });
        
        // スコア順にソートして上位5個を返す
        return Array.from(uniqueProducts.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
            
    } catch (error) {
        console.error(`Error searching ${keyword}:`, error);
        return [];
    }
}

// 全商品収集メイン関数
async function collectAllProducts() {
    console.log('Starting product collection...');
    const masterData = {};
    let totalProducts = 0;
    
    for (const [locationKey, location] of Object.entries(LOCATIONS)) {
        masterData[locationKey] = {};
        console.log(`\n=== ${location.name} ===`);
        
        for (const [areaKey, areaName] of Object.entries(location.areas)) {
            console.log(`\nProcessing: ${areaName}`);
            masterData[locationKey][areaKey] = {};
            
            for (const level of ['light', 'heavy']) {
                console.log(` Level: ${level}`);
                masterData[locationKey][areaKey][level] = {
                    cleaners: [],
                    tools: [],
                    protection: []
                };
                
                const queries = generateSearchQueries(locationKey, areaKey, level);
                
                // 各カテゴリの商品を収集
                for (const category of ['cleaners', 'tools', 'protection']) {
                    const categoryProducts = [];
                    
                    for (const query of queries[category]) {
                        const products = await selectBestProducts(query, category);
                        categoryProducts.push(...products);
                        
                        // API制限対策
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                    
                    // 重複を除いて上位5個を選択
                    const uniqueProducts = new Map();
                    categoryProducts.forEach(p => {
                        if (!uniqueProducts.has(p.asin) || uniqueProducts.get(p.asin).score < p.score) {
                            uniqueProducts.set(p.asin, p);
                        }
                    });
                    
                    masterData[locationKey][areaKey][level][category] = 
                        Array.from(uniqueProducts.values())
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);
                    
                    totalProducts += masterData[locationKey][areaKey][level][category].length;
                }
            }
        }
    }
    
    // マスターデータを保存
    const outputPath = path.join(__dirname, '..', 'products-master-complete.json');
    fs.writeFileSync(outputPath, JSON.stringify(masterData, null, 2));
    console.log(`\n✅ Master data saved to products-master-complete.json`);
    console.log(`Total products collected: ${totalProducts}`);
    
    return masterData;
}

// HTMLから商品を取得する関数
function getProductsForPage(location, area, level) {
    const masterDataPath = path.join(__dirname, '..', 'products-master-complete.json');
    
    if (!fs.existsSync(masterDataPath)) {
        console.error('Master data file not found. Run collectAllProducts() first.');
        return {
            cleaners: [],
            tools: [],
            protection: []
        };
    }
    
    const masterData = JSON.parse(fs.readFileSync(masterDataPath, 'utf8'));
    return masterData[location]?.[area]?.[level] || {
        cleaners: [],
        tools: [],
        protection: []
    };
}

// 実行
if (require.main === module) {
    collectAllProducts().catch(console.error);
}

module.exports = { 
    getProductsForPage, 
    collectAllProducts,
    generateSearchQueries,
    LOCATIONS
};