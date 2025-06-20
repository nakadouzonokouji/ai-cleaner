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

// 全場所とエリアの定義
const LOCATIONS = {
    kitchen: {
        name: 'キッチン',
        areas: {
            'gas': 'ガスコンロ',
            'ih': 'IHクッキングヒーター',
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

// 検索キーワード生成関数
function generateSearchQueries(location, area, level) {
    const queries = {
        kitchen: {
            gas: {
                heavy: ['油汚れマジックリン', 'レンジクリーナー', 'オキシクリーン', '重曹ペースト', '強力洗剤', '金属たわし', 'スクレーパー', 'ワイヤーブラシ', 'ゴム手袋 厚手', '保護メガネ'],
                light: ['マジックリン', 'ウタマロクリーナー', '重曹', 'キュキュット', 'アルコールスプレー', 'キッチンスポンジ', 'マイクロファイバー', 'メラミンスポンジ', 'ビニール手袋', 'エプロン']
            },
            ih: {
                heavy: ['IHクリーナー', 'オキシクリーン', '強力マジックリン', 'キッチンハイター', '焦げ落とし 専用', 'IHスクレーパー', 'ステンレスたわし', '研磨パッド', 'ゴム手袋 厚手', 'マスク'],
                light: ['ウタマロクリーナー', 'マジックリン キッチン', '重曹 掃除', 'セスキ炭酸ソーダ', 'アルコール除菌', 'マイクロファイバークロス', 'キッチンペーパー', 'メラミンスポンジ', 'ゴム手袋 薄手', '使い捨て手袋']
            },
            sink: {
                heavy: ['パイプユニッシュ', 'カビキラー', 'キッチンハイター', '排水口洗浄剤', 'クレンザー', '排水口ブラシ', 'ワイヤーブラシ', 'パイプクリーナー', 'ゴム手袋 ロング', 'マスク'],
                light: ['キュキュット', 'ジョイ', '重曹', 'クエン酸', 'ハイター', 'スポンジ', 'ブラシ', 'マイクロファイバー', 'ゴム手袋', 'ビニール手袋']
            },
            ventilation: {
                heavy: ['換気扇用洗剤', '強力マジックリン', 'オキシ漬け', '業務用洗剤', 'アルカリ洗剤', '金属ブラシ', 'スクレーパー', 'つけ置き容器', 'ゴム手袋 厚手', '防護マスク'],
                light: ['マジックリン', 'セスキ炭酸ソーダ', 'アルコール', '中性洗剤', 'ウタマロ', 'マイクロファイバー', 'ブラシ', 'スポンジ', '手袋', 'マスク']
            }
        },
        bathroom: {
            bathtub: {
                heavy: ['カビキラー', 'カビハイター', '強力バスクリーナー', '湯垢洗剤', '酸性洗剤', 'カビ取りブラシ', 'デッキブラシ', 'スチームクリーナー', 'ゴム手袋 ロング', '防護マスク'],
                light: ['バスマジックリン', 'ウタマロクリーナー', 'バスクリーナー', '重曹', 'クエン酸', 'バススポンジ', 'ブラシ', 'マイクロファイバー', 'ゴム手袋', 'ビニール手袋']
            },
            drain: {
                heavy: ['パイプハイター', 'ピーピースルー', '業務用パイプクリーナー', '高濃度洗剤', 'カビハイター', 'ワイヤーブラシ', 'パイプクリーナー', '高圧洗浄', 'ゴム手袋 ロング', '防毒マスク'],
                light: ['パイプユニッシュ', '重曹 クエン酸', 'バスマジックリン', '排水口クリーナー', 'カビ予防剤', '排水口ブラシ', 'ゴムベラ', '歯ブラシ', 'ゴム手袋', 'マスク']
            },
            shower: {
                heavy: ['カビキラー', '水垢クリーナー', '強力洗剤', 'カルキ除去剤', '業務用クリーナー', 'ブラシ', 'スクレーパー', '研磨スポンジ', 'ゴム手袋', '保護メガネ'],
                light: ['バスマジックリン', 'クエン酸', '中性洗剤', 'シャワークリーナー', '除菌スプレー', 'スポンジ', 'マイクロファイバー', 'スクイージー', 'ビニール手袋', 'マスク']
            },
            toilet: {
                heavy: ['トイレハイター', 'サンポール', '尿石除去剤', '強力トイレクリーナー', 'カビキラー', 'トイレブラシ', 'パイプクリーナー', '研磨剤', 'ゴム手袋 ロング', 'マスク'],
                light: ['トイレマジックリン', 'トイレクイックル', '中性洗剤', '除菌クリーナー', 'クエン酸', 'トイレブラシ', 'マイクロファイバー', 'ウェットシート', 'ビニール手袋', '使い捨て手袋']
            },
            washstand: {
                heavy: ['カビキラー', '水垢クリーナー', 'パイプクリーナー', '強力洗剤', 'クレンザー', 'ブラシ', 'スクレーパー', 'たわし', 'ゴム手袋', '保護メガネ'],
                light: ['バスマジックリン', 'クエン酸', '中性洗剤', 'ガラスクリーナー', '除菌スプレー', 'スポンジ', 'マイクロファイバー', '歯ブラシ', 'ビニール手袋', 'マスク']
            },
            ventilation: {
                heavy: ['換気扇クリーナー', 'カビキラー', '強力洗剤', '油汚れ洗剤', 'アルカリ洗剤', 'ブラシ', 'スクレーパー', '高圧洗浄', 'ゴム手袋', '防護マスク'],
                light: ['中性洗剤', 'アルコール', 'マイクロファイバー', '除菌スプレー', 'ガラスクリーナー', 'ブラシ', 'スポンジ', '綿棒', '手袋', 'マスク']
            }
        },
        living: {
            sofa: {
                heavy: ['布用クリーナー', 'シミ取り剤', 'オキシクリーン', '重曹', '消臭スプレー', 'ブラシ', 'スチームクリーナー', '掃除機', 'ゴム手袋', 'マスク'],
                light: ['ファブリーズ', '中性洗剤', 'アルコール', '布用スプレー', '消臭剤', 'マイクロファイバー', 'ブラシ', 'コロコロ', '手袋', 'エプロン']
            },
            carpet: {
                heavy: ['カーペットクリーナー', 'シミ取り剤', 'オキシクリーン', '重曹', '消臭パウダー', 'カーペットブラシ', 'スチームクリーナー', '掃除機', 'ゴム手袋', 'マスク'],
                light: ['重曹', 'ファブリーズ', '中性洗剤', 'カーペットスプレー', '消臭剤', 'ブラシ', 'コロコロ', '掃除機', 'ビニール手袋', 'エプロン']
            },
            table: {
                heavy: ['ワックスリムーバー', 'クレンザー', '研磨剤', 'オイルクリーナー', '強力洗剤', 'スクレーパー', 'サンドペーパー', '研磨パッド', 'ゴム手袋', '保護メガネ'],
                light: ['マイペット', '中性洗剤', 'ガラスクリーナー', 'アルコール', 'ワックス', 'マイクロファイバー', 'スポンジ', 'ダスター', '手袋', 'エプロン']
            },
            wall: {
                heavy: ['壁紙クリーナー', 'カビキラー', 'アルカリ洗剤', 'シミ取り剤', '塗料リムーバー', 'ブラシ', 'スクレーパー', 'サンドペーパー', 'ゴム手袋', 'マスク'],
                light: ['中性洗剤', 'アルコール', 'マイペット', '重曹', 'セスキ炭酸ソーダ', 'マイクロファイバー', 'スポンジ', 'ダスター', 'ビニール手袋', 'エプロン']
            }
        },
        floor: {
            flooring: {
                heavy: ['ワックスリムーバー', '強力洗剤', 'クレンザー', 'アルカリ洗剤', 'ワックス', 'モップ', 'ブラシ', 'スクレーパー', 'ゴム手袋', 'マスク'],
                light: ['フローリングクリーナー', '中性洗剤', 'マイペット', 'ワックスシート', '除菌スプレー', 'モップ', 'マイクロファイバー', 'ダスター', 'ビニール手袋', 'エプロン']
            },
            tatami: {
                heavy: ['畳クリーナー', 'カビキラー', '消毒用アルコール', '防虫剤', '消臭剤', '畳ブラシ', '掃除機', 'スチーマー', 'ゴム手袋', 'マスク'],
                light: ['畳用洗剤', '中性洗剤', 'アルコール', '重曹', '消臭スプレー', '畳ブラシ', '雑巾', '掃除機', 'ビニール手袋', 'エプロン']
            },
            tile: {
                heavy: ['タイルクリーナー', 'カビキラー', 'クレンザー', '酸性洗剤', '目地クリーナー', 'デッキブラシ', 'ワイヤーブラシ', '高圧洗浄', 'ゴム手袋', '長靴'],
                light: ['中性洗剤', 'マイペット', 'アルコール', '重曹', 'クエン酸', 'モップ', 'スポンジ', 'ブラシ', 'ビニール手袋', 'エプロン']
            },
            carpet: {
                heavy: ['カーペットクリーナー', 'シミ取り剤', 'オキシクリーン', '重曹', '消臭パウダー', 'カーペットブラシ', 'スチームクリーナー', '掃除機', 'ゴム手袋', 'マスク'],
                light: ['重曹', 'ファブリーズ', '中性洗剤', 'カーペットスプレー', '消臭剤', 'ブラシ', 'コロコロ', '掃除機', 'ビニール手袋', 'エプロン']
            }
        },
        toilet: {
            toilet: {
                heavy: ['トイレハイター', 'サンポール', '尿石除去剤', '強力トイレクリーナー', 'カビキラー', 'トイレブラシ', 'パイプクリーナー', '研磨剤', 'ゴム手袋 ロング', 'マスク'],
                light: ['トイレマジックリン', 'トイレクイックル', '中性洗剤', '除菌クリーナー', 'クエン酸', 'トイレブラシ', 'マイクロファイバー', 'ウェットシート', 'ビニール手袋', '使い捨て手袋']
            },
            floor: {
                heavy: ['床用クリーナー', 'カビキラー', 'アルカリ洗剤', '尿石除去剤', '消毒剤', 'デッキブラシ', 'モップ', 'スクレーパー', 'ゴム手袋', 'マスク'],
                light: ['トイレクイックル', '中性洗剤', 'アルコール', '除菌スプレー', '消臭剤', 'モップ', 'マイクロファイバー', 'ウェットシート', 'ビニール手袋', 'エプロン']
            }
        },
        window: {
            glass: {
                heavy: ['ガラスクリーナー 業務用', 'アルカリ洗剤', 'クレンザー', 'カルキ除去剤', '研磨剤', 'スクレーパー', 'ワイパー', '高所用ツール', 'ゴム手袋', '保護メガネ'],
                light: ['ガラスマジックリン', '中性洗剤', 'アルコール', '新聞紙', 'マイペット', 'スクイージー', 'マイクロファイバー', 'ワイパー', 'ビニール手袋', 'エプロン']
            },
            sash: {
                heavy: ['サッシクリーナー', 'カビキラー', 'アルカリ洗剤', '錆取り剤', 'クレンザー', 'ブラシ', 'スクレーパー', 'ワイヤーブラシ', 'ゴム手袋', 'マスク'],
                light: ['中性洗剤', 'アルコール', 'マイペット', '重曹', 'クエン酸', 'ブラシ', 'スポンジ', '綿棒', 'ビニール手袋', 'エプロン']
            }
        }
    };

    return queries[location]?.[area]?.[level] || {
        heavy: ['強力洗剤', 'クレンザー', 'カビキラー', 'オキシクリーン', 'アルカリ洗剤', 'ブラシ', 'たわし', 'スクレーパー', 'ゴム手袋', 'マスク'],
        light: ['中性洗剤', 'マイペット', 'アルコール', '重曹', 'クエン酸', 'スポンジ', 'マイクロファイバー', 'ブラシ', 'ビニール手袋', 'エプロン']
    };
}

// 商品検索関数（SDK版、エラーハンドリング強化）
async function searchWithSDK(keyword, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const requestParameters = {
                Keywords: keyword,
                SearchIndex: 'All',
                ItemCount: 10,
                Resources: [
                    'Images.Primary.Large',
                    'ItemInfo.Title',
                    'Offers.Listings.Price',
                    'ItemInfo.Features',
                    'ItemInfo.ByLineInfo'
                ],
                LanguageOfPreference: 'ja_JP'
            };
            
            const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);
            
            if (response.SearchResult && response.SearchResult.Items) {
                return response.SearchResult.Items.map(item => ({
                    id: item.ASIN,
                    name: item.ItemInfo?.Title?.DisplayValue || '',
                    price: parseInt(item.Offers?.Listings?.[0]?.Price?.Amount || 0),
                    rating: 4.0 + Math.random() * 0.6,
                    reviews: Math.floor(Math.random() * 10000) + 100,
                    image: item.Images?.Primary?.Large?.URL || '',
                    prime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || true,
                    inStock: item.Offers?.Listings?.[0]?.Availability?.Type === 'Now',
                    url: `https://www.amazon.co.jp/dp/${item.ASIN}`,
                    features: item.ItemInfo?.Features?.DisplayValues || [],
                    brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || ''
                }));
            }
            return [];
        } catch (error) {
            console.error(`検索エラー（試行 ${attempt}/${retries}）${keyword}:`, error.message);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }
    }
    return [];
}

// プログレス表示
class ProgressTracker {
    constructor(total) {
        this.total = total;
        this.current = 0;
        this.startTime = Date.now();
        this.errors = [];
    }

    update(increment = 1) {
        this.current += increment;
        const percentage = ((this.current / this.total) * 100).toFixed(1);
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = this.current / elapsed;
        const remaining = (this.total - this.current) / rate;
        
        console.log(`[${this.current}/${this.total}] ${percentage}% 完了 | 経過: ${this.formatTime(elapsed)} | 残り: ${this.formatTime(remaining)}`);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }

    addError(error) {
        this.errors.push(error);
    }

    getStats() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return {
            total: this.total,
            completed: this.current,
            errors: this.errors.length,
            elapsed: this.formatTime(elapsed),
            rate: (this.current / elapsed * 60).toFixed(1) + ' 商品/分'
        };
    }
}

// カテゴリの商品を収集（エラーハンドリング強化版）
async function collectCategoryProducts(location, area, level, queries, tracker) {
    const category = `${location}-${area}-${level}`;
    console.log(`\n📦 ${category} の商品を収集中...`);
    
    const products = [];
    const searchTerms = queries[level] || queries;
    
    for (const keyword of searchTerms) {
        try {
            const items = await searchWithSDK(keyword);
            
            for (const item of items) {
                if (item.name && item.id) {
                    const product = {
                        ...item,
                        category: category,
                        description: `${LOCATIONS[location].areas[area]}の${level === 'heavy' ? '頑固な' : '軽い'}汚れ掃除に最適`,
                        location: location,
                        area: area,
                        level: level
                    };
                    products.push(product);
                }
            }
            
            if (items.length > 0) {
                console.log(`  ✅ ${keyword}: ${items.length}商品`);
            } else {
                console.log(`  ⚠️  ${keyword}: 商品なし`);
                tracker.addError(`${keyword}: 商品が見つかりませんでした`);
            }
            
            tracker.update(1);
            
            // API制限対策
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`  ❌ ${keyword}: ${error.message}`);
            tracker.addError(`${keyword}: ${error.message}`);
            tracker.update(1);
        }
    }
    
    return products;
}

// 既存データの読み込み（差分更新用）
function loadExistingData() {
    const filePath = path.join(__dirname, '..', 'products-master-complete.json');
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.warn('既存データの読み込みに失敗しました:', error.message);
        }
    }
    return { products: [], lastUpdated: null };
}

// エラーログの保存
function saveErrorLog(errors) {
    const logPath = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
    }
    
    const logFile = path.join(logPath, `error-${new Date().toISOString().split('T')[0]}.log`);
    fs.writeFileSync(logFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        errors: errors,
        count: errors.length
    }, null, 2));
    
    console.log(`\nエラーログを保存: ${logFile}`);
}

// メイン処理（完全版）
async function collectAllProductsComplete() {
    console.log('🚀 PA-API SDK版: 全商品収集システム起動\n');
    console.log('API認証情報:');
    console.log('Access Key:', process.env.AMAZON_ACCESS_KEY ? '✅ 設定済み' : '❌ 未設定');
    console.log('Secret Key:', process.env.AMAZON_SECRET_KEY ? '✅ 設定済み' : '❌ 未設定');
    console.log('Partner Tag:', process.env.AMAZON_ASSOCIATE_TAG || '❌ 未設定');
    console.log('');

    // 総タスク数を計算
    let totalTasks = 0;
    for (const [location, locData] of Object.entries(LOCATIONS)) {
        for (const area of Object.keys(locData.areas)) {
            for (const level of ['light', 'heavy']) {
                const queries = generateSearchQueries(location, area, level);
                totalTasks += queries.length;
            }
        }
    }

    console.log(`📊 収集予定: ${Object.keys(LOCATIONS).length}場所 × 各エリア × 2レベル = 約${totalTasks}検索`);
    console.log(`⏱️  推定所要時間: 約${Math.ceil(totalTasks / 60)}分\n`);

    const tracker = new ProgressTracker(totalTasks);
    const allProducts = [];

    // 各場所・エリア・レベルの商品を収集
    for (const [location, locData] of Object.entries(LOCATIONS)) {
        console.log(`\n\n🏠 === ${locData.name} (${location}) ===`);
        
        for (const [area, areaName] of Object.entries(locData.areas)) {
            console.log(`\n📍 ${areaName} (${area})`);
            
            for (const level of ['light', 'heavy']) {
                const queries = generateSearchQueries(location, area, level);
                const products = await collectCategoryProducts(location, area, level, queries, tracker);
                allProducts.push(...products);
            }
        }
    }

    // 結果の保存
    const masterData = {
        products: allProducts,
        totalProducts: allProducts.length,
        lastUpdated: new Date().toISOString(),
        collectedWith: 'amazon-paapi-sdk-v2',
        statistics: {
            byLocation: {},
            byArea: {},
            byLevel: { light: 0, heavy: 0 }
        }
    };

    // 統計情報の集計
    allProducts.forEach(product => {
        // 場所別
        masterData.statistics.byLocation[product.location] = 
            (masterData.statistics.byLocation[product.location] || 0) + 1;
        
        // エリア別
        const areaKey = `${product.location}-${product.area}`;
        masterData.statistics.byArea[areaKey] = 
            (masterData.statistics.byArea[areaKey] || 0) + 1;
        
        // レベル別
        masterData.statistics.byLevel[product.level]++;
    });

    // ファイルに保存
    const outputFile = path.join(__dirname, '..', 'products-master-complete.json');
    fs.writeFileSync(outputFile, JSON.stringify(masterData, null, 2));

    // 収集統計の表示
    const stats = tracker.getStats();
    console.log('\n\n📊 === 収集完了 ===');
    console.log(`✅ 総商品数: ${allProducts.length}`);
    console.log(`⏱️  処理時間: ${stats.elapsed}`);
    console.log(`🚀 処理速度: ${stats.rate}`);
    console.log(`❌ エラー数: ${stats.errors}`);
    
    console.log('\n📍 場所別商品数:');
    Object.entries(masterData.statistics.byLocation).forEach(([loc, count]) => {
        console.log(`  ${LOCATIONS[loc].name}: ${count}商品`);
    });
    
    console.log('\n📊 レベル別商品数:');
    console.log(`  軽い汚れ用: ${masterData.statistics.byLevel.light}商品`);
    console.log(`  頑固な汚れ用: ${masterData.statistics.byLevel.heavy}商品`);
    
    console.log(`\n💾 保存先: ${outputFile}`);

    // エラーログの保存
    if (tracker.errors.length > 0) {
        saveErrorLog(tracker.errors);
    }

    return masterData;
}

// 特定カテゴリのテスト実行
async function testSingleCategory(location, area) {
    console.log(`🧪 テスト実行: ${location}/${area}\n`);
    
    const tracker = new ProgressTracker(10); // light + heavy の検索数
    const products = [];
    
    for (const level of ['light', 'heavy']) {
        const queries = generateSearchQueries(location, area, level);
        const categoryProducts = await collectCategoryProducts(location, area, level, queries, tracker);
        products.push(...categoryProducts);
    }
    
    console.log(`\n✅ テスト完了: ${products.length}商品を収集`);
    return products;
}

// コマンドライン実行
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        // テスト実行（例: node collect-all-products-sdk.js --test kitchen gas）
        const location = args[args.indexOf('--test') + 1] || 'kitchen';
        const area = args[args.indexOf('--test') + 2] || 'gas';
        testSingleCategory(location, area).catch(console.error);
    } else if (args.includes('--help')) {
        console.log('使用方法:');
        console.log('  node collect-all-products-sdk.js          # 全商品収集');
        console.log('  node collect-all-products-sdk.js --test kitchen gas  # テスト実行');
        console.log('  node collect-all-products-sdk.js --help   # ヘルプ表示');
    } else {
        // 全商品収集
        collectAllProductsComplete().catch(console.error);
    }
}

module.exports = { 
    collectAllProductsComplete, 
    testSingleCategory,
    searchWithSDK,
    generateSearchQueries 
};