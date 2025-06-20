const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { collectAllProductsComplete, searchWithSDK } = require('./collect-all-products-sdk');

// 場所定義
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
            'carpet': 'カーペット',
            'tile': 'タイル'
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

// 検索クエリ生成
function generateSearchQueries(location, area, level) {
    const searchTerms = {
        kitchen: {
            gas: {
                light: ['マジックリン', 'ウタマロクリーナー', '重曹', 'キュキュット', 'アルコールスプレー', 'キッチンスポンジ', 'マイクロファイバー', 'メラミンスポンジ', 'ビニール手袋', 'エプロン'],
                heavy: ['油汚れマジックリン', 'レンジクリーナー', 'オキシクリーン', '重曹ペースト', '強力洗剤', '金属たわし', 'スクレーパー', 'ワイヤーブラシ', 'ゴム手袋 厚手', '保護メガネ']
            },
            ih: {
                light: ['ウタマロクリーナー', 'マジックリン キッチン', '重曹 掃除', 'セスキ炭酸ソーダ', 'アルコール除菌', 'マイクロファイバークロス', 'キッチンペーパー', 'メラミンスポンジ', 'ゴム手袋 薄手', '使い捨て手袋'],
                heavy: ['IHクリーナー', 'オキシクリーン', '強力マジックリン', 'キッチンハイター', '焦げ落とし 専用', 'IHスクレーパー', 'ステンレスたわし', '研磨パッド', 'ゴム手袋 厚手', 'マスク']
            },
            sink: {
                light: ['キュキュット', 'ジョイ', '重曹', 'クエン酸', 'ハイター', 'スポンジ', 'ブラシ', 'マイクロファイバー', 'ゴム手袋', 'ビニール手袋'],
                heavy: ['パイプユニッシュ', 'カビキラー', 'キッチンハイター', '排水口洗浄剤', 'クレンザー', '排水口ブラシ', 'ワイヤーブラシ', 'パイプクリーナー', 'ゴム手袋 ロング', 'マスク']
            },
            ventilation: {
                light: ['マジックリン', 'セスキ炭酸ソーダ', 'アルコール', '中性洗剤', 'ウタマロ', 'マイクロファイバー', 'ブラシ', '掃除機', 'ゴム手袋', 'マスク'],
                heavy: ['換気扇マジックリン', 'オキシクリーン', '重曹ペースト', '強力洗剤', 'アルカリ洗剤', 'スクレーパー', 'ワイヤーブラシ', '高圧洗浄', 'ゴーグル', '防護服']
            }
        },
        bathroom: {
            bathtub: {
                light: ['バスマジックリン', 'ウタマロクリーナー', '重曹', 'クエン酸', '中性洗剤', 'スポンジ', 'ブラシ', 'マイクロファイバー', 'ゴム手袋', 'バススリッパ'],
                heavy: ['カビキラー', 'バスハイター', 'オキシクリーン', '強力カビ取り', '風呂釜洗浄剤', 'カビ取りブラシ', 'デッキブラシ', 'スチームクリーナー', 'ゴム手袋 ロング', '防護マスク']
            },
            drain: {
                light: ['パイプユニッシュ', '重曹 クエン酸', 'バスマジックリン', '排水口クリーナー', 'カビ予防剤', '排水口ブラシ', 'ゴムベラ', '歯ブラシ', 'ゴム手袋', 'マスク'],
                heavy: ['パイプハイター', 'ピーピースルー', '業務用パイプクリーナー', '高濃度洗剤', 'カビハイター', 'ワイヤーブラシ', 'パイプクリーナー', '高圧洗浄', 'ゴム手袋 ロング', '防毒マスク']
            },
            shower: {
                light: ['バスマジックリン', 'クエン酸', '中性洗剤', 'シャワークリーナー', '除菌スプレー', 'スポンジ', 'マイクロファイバー', 'スクイージー', 'ビニール手袋', 'マスク'],
                heavy: ['カビキラー', '水垢クリーナー', '強力洗剤', 'カルキ除去剤', '業務用クリーナー', 'ブラシ', 'スクレーパー', '研磨スポンジ', 'ゴム手袋', '保護メガネ']
            },
            toilet: {
                light: ['トイレマジックリン', 'トイレクイックル', '中性洗剤', '除菌クリーナー', 'クエン酸', 'トイレブラシ', 'マイクロファイバー', 'ウェットシート', 'ビニール手袋', '使い捨て手袋'],
                heavy: ['トイレハイター', 'サンポール', '尿石除去剤', '強力トイレクリーナー', 'カビキラー', 'トイレブラシ', 'パイプクリーナー', '研磨剤', 'ゴム手袋 ロング', 'マスク']
            },
            washstand: {
                light: ['バスマジックリン', 'クエン酸', '中性洗剤', 'ガラスクリーナー', '除菌スプレー', 'スポンジ', 'マイクロファイバー', '歯ブラシ', 'ビニール手袋', 'マスク'],
                heavy: ['カビキラー', '水垢クリーナー', 'パイプクリーナー', '強力洗剤', '研磨剤', 'ワイヤーブラシ', 'スクレーパー', 'パイプブラシ', 'ゴム手袋', '保護メガネ']
            },
            ventilation: {
                light: ['中性洗剤', 'マジックリン', 'アルコール', 'ホコリ取り', '除菌スプレー', 'マイクロファイバー', 'ブラシ', '掃除機', 'マスク', '手袋'],
                heavy: ['換気扇クリーナー', 'カビキラー', '強力洗剤', 'オキシクリーン', '業務用洗剤', 'ワイヤーブラシ', 'スクレーパー', '高圧洗浄', 'ゴーグル', '防護服']
            }
        },
        living: {
            sofa: {
                light: ['ファブリーズ', '重曹', '中性洗剤', 'クリーナー', '消臭スプレー', 'ブラシ', 'コロコロ', 'マイクロファイバー', '掃除機', '手袋'],
                heavy: ['ソファクリーナー', 'オキシクリーン', 'シミ取り剤', '強力洗剤', 'スチームクリーナー', 'ブラシ', 'スポンジ', 'クリーニング液', 'ゴム手袋', 'マスク']
            },
            carpet: {
                light: ['カーペットクリーナー', '重曹', '中性洗剤', '消臭剤', 'ファブリーズ', 'コロコロ', 'ブラシ', '掃除機', 'マイクロファイバー', '手袋'],
                heavy: ['カーペット洗剤', 'オキシクリーン', 'シミ抜き', '強力クリーナー', 'スチームクリーナー', 'ブラシ', 'スポンジ', '高圧洗浄', 'ゴム手袋', 'マスク']
            },
            table: {
                light: ['中性洗剤', 'ガラスクリーナー', 'アルコール', 'ウタマロ', 'ワックス', 'マイクロファイバー', 'スポンジ', 'ダスター', '手袋', 'エプロン'],
                heavy: ['強力洗剤', '研磨剤', 'オキシクリーン', 'クレンザー', 'ワックスリムーバー', 'スクレーパー', '研磨スポンジ', 'ワイヤーブラシ', 'ゴム手袋', 'マスク']
            },
            wall: {
                light: ['中性洗剤', 'ウタマロ', 'アルコール', '重曹水', 'セスキ水', 'マイクロファイバー', 'スポンジ', 'モップ', '手袋', 'マスク'],
                heavy: ['壁紙クリーナー', 'カビキラー', '強力洗剤', 'オキシクリーン', '漂白剤', 'ブラシ', 'スクレーパー', 'スチームクリーナー', 'ゴム手袋', '保護メガネ']
            }
        },
        floor: {
            flooring: {
                light: ['フローリングワイパー', '中性洗剤', 'ワックス', 'クイックルワイパー', 'アルコール', 'モップ', 'マイクロファイバー', '雑巾', '手袋', 'スリッパ'],
                heavy: ['フローリングクリーナー', 'ワックスリムーバー', '強力洗剤', 'オキシクリーン', '研磨剤', 'ブラシ', 'スクレーパー', 'ポリッシャー', 'ゴム手袋', 'マスク']
            },
            tatami: {
                light: ['畳クリーナー', 'アルコール', '重曹', 'クエン酸', '消臭剤', 'ほうき', 'ちりとり', '掃除機', '雑巾', 'マスク'],
                heavy: ['畳用洗剤', 'カビ取り剤', '防虫剤', '強力クリーナー', '除菌剤', 'ブラシ', 'スチームクリーナー', '乾燥機', 'ゴム手袋', '防護マスク']
            },
            carpet: {
                light: ['カーペットクリーナー', '重曹', 'ファブリーズ', '消臭スプレー', '中性洗剤', 'コロコロ', 'ブラシ', '掃除機', '手袋', 'マスク'],
                heavy: ['カーペット洗剤', 'シミ抜き剤', 'オキシクリーン', '強力洗剤', 'スチームクリーナー', 'ブラシ', '高圧洗浄', 'カーペットクリーナー', 'ゴム手袋', '防護服']
            },
            tile: {
                light: ['タイルクリーナー', '中性洗剤', 'クエン酸', 'アルコール', '目地クリーナー', 'モップ', 'スポンジ', 'ブラシ', '手袋', 'マスク'],
                heavy: ['タイル用洗剤', 'カビキラー', '強力洗剤', '研磨剤', '目地ブラシ', 'ワイヤーブラシ', 'スクレーパー', '高圧洗浄', 'ゴム手袋', '保護メガネ']
            }
        },
        toilet: {
            toilet: {
                light: ['トイレマジックリン', 'トイレクイックル', '中性洗剤', '除菌シート', 'クエン酸', 'トイレブラシ', 'スポンジ', 'ウェットティッシュ', '手袋', 'マスク'],
                heavy: ['サンポール', 'トイレハイター', '尿石除去剤', '強力洗剤', 'カビキラー', 'ブラシ', 'スクレーパー', 'パイプクリーナー', 'ゴム手袋', '防護マスク']
            },
            floor: {
                light: ['トイレクイックル', '中性洗剤', 'アルコール', '除菌スプレー', 'クエン酸', 'モップ', 'ウェットシート', '雑巾', '手袋', 'スリッパ'],
                heavy: ['トイレ用洗剤', 'カビキラー', '強力洗剤', '漂白剤', '除菌剤', 'ブラシ', 'デッキブラシ', 'スチームクリーナー', 'ゴム手袋', 'マスク']
            }
        },
        window: {
            glass: {
                light: ['ガラスクリーナー', '中性洗剤', 'アルコール', 'マイペット', '水', 'スクイージー', 'マイクロファイバー', '新聞紙', '手袋', 'バケツ'],
                heavy: ['ガラス用洗剤', '強力クリーナー', '研磨剤', 'スケール除去剤', 'カビ取り剤', 'スクレーパー', 'ワイヤーブラシ', '高圧洗浄', 'ゴム手袋', '保護メガネ']
            },
            sash: {
                light: ['中性洗剤', 'アルコール', 'ブラシ', '歯ブラシ', 'クリーナー', '雑巾', 'マイクロファイバー', '綿棒', '手袋', 'マスク'],
                heavy: ['サッシクリーナー', 'カビキラー', '強力洗剤', '研磨剤', '金属磨き', 'ワイヤーブラシ', 'スクレーパー', '高圧洗浄', 'ゴム手袋', '防護服']
            }
        }
    };

    const key = searchTerms[location]?.[area]?.[level];
    if (!key) {
        console.warn(`⚠️ 検索キーワードが見つかりません: ${location}/${area}/${level}`);
        return [];
    }
    
    return key;
}

// 進捗追跡
class ProgressTracker {
    constructor(total) {
        this.total = total;
        this.current = 0;
        this.startTime = Date.now();
        this.errors = [];
    }

    increment() {
        this.current++;
        const elapsed = Date.now() - this.startTime;
        const rate = this.current / (elapsed / 1000);
        const remaining = (this.total - this.current) / rate;
        
        const elapsedStr = this.formatTime(elapsed / 1000);
        const remainingStr = this.formatTime(remaining);
        const percentage = ((this.current / this.total) * 100).toFixed(1);
        
        process.stdout.write(`\r[${this.current}/${this.total}] ${percentage}% 完了 | 経過: ${elapsedStr} | 残り: ${remainingStr}`);
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
        const rate = this.current / elapsed;
        return {
            total: this.total,
            completed: this.current,
            errors: this.errors.length,
            elapsed: this.formatTime(elapsed),
            rate: `${rate.toFixed(2)} items/sec`
        };
    }
}

// カテゴリ別商品収集
async function collectCategoryProducts(location, area, level, queries, tracker) {
    const products = [];
    const id = `${location}-${area}-${level}`;
    
    console.log(`\n📦 ${id} の商品を収集中...`);
    
    for (const query of queries) {
        try {
            const searchResults = await searchWithSDK(query, 10);
            console.log(`  ✅ ${query}: ${searchResults.length}商品`);
            
            searchResults.forEach(item => {
                products.push({
                    id: `${id}-${item.id}`,
                    asin: item.id,
                    title: item.name || 'タイトル不明',
                    price: item.price || 0,
                    priceDisplay: `￥${item.price?.toLocaleString() || '価格不明'}`,
                    image: item.image || '',
                    link: item.url || '',
                    location: location,
                    area: area,
                    level: level,
                    searchQuery: query,
                    collectedAt: new Date().toISOString()
                });
            });
            
            tracker.increment();
            
            // レート制限対策（少し長めの待機時間）
            await new Promise(resolve => setTimeout(resolve, 1200));
            
        } catch (error) {
            console.error(`  ❌ ${query}: エラー - ${error.message}`);
            tracker.addError({
                query,
                location,
                area,
                level,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            tracker.increment();
        }
    }
    
    return products;
}

// 特定の場所の全商品を収集
async function collectLocationProducts(locationKey) {
    const location = LOCATIONS[locationKey];
    if (!location) {
        console.error(`❌ 無効な場所: ${locationKey}`);
        return;
    }

    console.log(`\n🏠 === ${location.name} (${locationKey}) の商品収集開始 ===\n`);
    
    // この場所の総検索数を計算
    let totalSearches = 0;
    Object.keys(location.areas).forEach(area => {
        totalSearches += 20; // light(10) + heavy(10)
    });
    
    const tracker = new ProgressTracker(totalSearches);
    const allProducts = [];
    
    // 各エリアを順番に処理
    for (const [areaKey, areaName] of Object.entries(location.areas)) {
        console.log(`\n📍 ${areaName} (${areaKey})`);
        
        // 軽い汚れ用と頑固な汚れ用
        for (const level of ['light', 'heavy']) {
            const queries = generateSearchQueries(locationKey, areaKey, level);
            if (queries.length > 0) {
                const products = await collectCategoryProducts(locationKey, areaKey, level, queries, tracker);
                allProducts.push(...products);
            }
        }
    }
    
    // 場所別のファイルに保存
    const outputDir = path.join(__dirname, '..', 'products-by-location');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const outputFile = path.join(outputDir, `${locationKey}-products.json`);
    const locationData = {
        location: locationKey,
        locationName: location.name,
        totalProducts: allProducts.length,
        collectedAt: new Date().toISOString(),
        products: allProducts
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(locationData, null, 2));
    
    // 統計表示
    const stats = tracker.getStats();
    console.log(`\n\n📊 === ${location.name} 収集完了 ===`);
    console.log(`✅ 総商品数: ${allProducts.length}`);
    console.log(`⏱️  処理時間: ${stats.elapsed}`);
    console.log(`🚀 処理速度: ${stats.rate}`);
    console.log(`❌ エラー数: ${stats.errors}`);
    console.log(`💾 保存先: ${outputFile}`);
    
    return allProducts;
}

// コマンドライン実行
if (require.main === module) {
    const args = process.argv.slice(2);
    const locationKey = args[0];
    
    if (!locationKey || !LOCATIONS[locationKey]) {
        console.log('使用方法:');
        console.log('  node collect-products-by-location.js <location>');
        console.log('\n利用可能な場所:');
        Object.entries(LOCATIONS).forEach(([key, value]) => {
            console.log(`  ${key} - ${value.name}`);
        });
        process.exit(1);
    }
    
    collectLocationProducts(locationKey).catch(console.error);
}

module.exports = { collectLocationProducts };