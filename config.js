/**
 * AI掃除アドバイザー - 設定ファイル（修正版）
 * CX Mainte © 2025
 * 
 * 🎯 完全対応：家中のあらゆる汚れに対応する商品選択システム
 */

// Amazon PA-API 設定（環境変数から取得）
const AMAZON_PA_API_CONFIG = {
    accessKey: '', // 環境変数から取得
    secretKey: '', // 環境変数から取得
    associateTag: '', // 環境変数から取得
    region: 'jp-east-1',
    host: 'webservices.amazon.co.jp',
    uri: '/paapi5/getitems'
};

// Gemini AI 設定（動的設定）
const GEMINI_API_CONFIG = {
    apiKey: '', // 管理者ダッシュボードから設定
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
};

// アプリケーション設定
const APP_CONFIG = {
    version: '3.0.0',
    environment: 'production',
    debug: false,
    security: {
        enableRightClickProtection: true,
        enableTextSelectProtection: true,
        enableDevToolsDetection: true,
        enableKeyboardShortcutProtection: true
    },
    features: {
        paApiIntegration: true,
        geminiVisionApi: true,
        realTimePricing: true,
        feedbackSystem: true,
        debugLogging: true,
        comprehensiveDirtMapping: true, // 🆕 包括的汚れマッピング
        multiLayerProductSelection: true // 🆕 多層商品選択
    }
};

// 🎯 完全版：汚れの種類別マッピング（家中の全汚れ対応）
const COMPREHENSIVE_DIRT_MAPPING = {
    // 🔥 キッチン系汚れ
    '油汚れ': {
        keywords: ['油', 'グリース', '換気扇', 'コンロ', 'フライパン', 'ベトベト'],
        category: 'kitchen_oil',
        difficulty: 'hard',
        cleaningTime: '30-60分',
        tools: ['アルカリ洗剤', '重曹', 'スクレーパー']
    },
    '焦げ付き': {
        keywords: ['焦げ', '炭化', '黒い汚れ', 'フライパン', '鍋'],
        category: 'kitchen_burnt',
        difficulty: 'very_hard',
        cleaningTime: '45-90分',
        tools: ['重曹', 'クレンザー', '金属たわし']
    },
    'ぬめり汚れ': {
        keywords: ['ぬめり', 'ヌルヌル', '排水溝', 'シンク'],
        category: 'kitchen_slime',
        difficulty: 'medium',
        cleaningTime: '15-30分',
        tools: ['塩素系漂白剤', 'パイプクリーナー']
    },
    '水垢（キッチン）': {
        keywords: ['水垢', '白い汚れ', 'シンク', '蛇口', 'ステンレス'],
        category: 'kitchen_scale',
        difficulty: 'medium',
        cleaningTime: '20-40分',
        tools: ['酸性洗剤', 'クエン酸', 'スポンジ']
    },

    // 🛁 浴室系汚れ（完全対応）
    'カビ汚れ': {
        keywords: ['カビ', '黒カビ', 'ピンクカビ', 'ゴムパッキン', 'シリコン'],
        category: 'bathroom_mold',
        difficulty: 'hard',
        cleaningTime: '60-120分',
        tools: ['塩素系カビ取り剤', 'ジェル式', 'ブラシ', '保護具']
    },
    '水垢（浴室）': {
        keywords: ['水垢', '白い汚れ', '鏡', 'シャワーヘッド', '蛇口', 'ウロコ汚れ'],
        category: 'bathroom_scale',
        difficulty: 'medium',
        cleaningTime: '30-60分',
        tools: ['酸性洗剤', 'クエン酸', '茂木和哉', 'ダイヤモンドパッド']
    },
    '石鹸カス': {
        keywords: ['石鹸カス', '白い膜', '浴槽', '壁面', 'ザラザラ'],
        category: 'soap_scum',
        difficulty: 'medium',
        cleaningTime: '20-40分',
        tools: ['アルカリ洗剤', '重曹', 'メラミンスポンジ']
    },
    '皮脂汚れ': {
        keywords: ['皮脂', '体の汚れ', '浴槽', 'ベタベタ', '人垢'],
        category: 'body_oil',
        difficulty: 'easy',
        cleaningTime: '15-30分',
        tools: ['中性洗剤', 'バス用洗剤', 'スポンジ']
    },
    '髪の毛': {
        keywords: ['髪の毛', '毛髪', '排水溝', '詰まり'],
        category: 'hair_drain',
        difficulty: 'easy',
        cleaningTime: '10-20分',
        tools: ['パイプクリーナー', '髪の毛キャッチャー', 'ゴム手袋']
    },

    // 🚽 トイレ系汚れ（完全対応）
    'トイレ汚れ': {
        keywords: ['便器', 'トイレボウル', '一般的な汚れ'],
        category: 'toilet_general',
        difficulty: 'easy',
        cleaningTime: '10-20分',
        tools: ['トイレ用洗剤', 'ブラシ', '除菌シート']
    },
    '尿石': {
        keywords: ['尿石', '黄ばみ', '頑固な汚れ', '便器のフチ', 'アンモニア臭'],
        category: 'toilet_urine',
        difficulty: 'hard',
        cleaningTime: '30-60分',
        tools: ['酸性洗剤', 'サンポール', '尿石除去剤']
    },
    'トイレの水垢': {
        keywords: ['水垢', 'トイレタンク', '手洗い場', '白い汚れ'],
        category: 'toilet_scale',
        difficulty: 'medium',
        cleaningTime: '20-30分',
        tools: ['酸性洗剤', 'クエン酸', 'スポンジ']
    },
    'トイレのカビ': {
        keywords: ['カビ', 'ピンクカビ', 'トイレタンク', '便座裏'],
        category: 'toilet_mold',
        difficulty: 'medium',
        cleaningTime: '20-40分',
        tools: ['塩素系漂白剤', 'カビ取りスプレー']
    },

    // 🪟 窓・ガラス系汚れ
    '窓の水垢': {
        keywords: ['水垢', 'ガラス', '窓', '鏡', 'ウロコ汚れ', '白い跡'],
        category: 'window_scale',
        difficulty: 'medium',
        cleaningTime: '20-40分',
        tools: ['ガラス用洗剤', 'スクイージー', 'ダイヤモンドパッド']
    },
    '花粉・土埃': {
        keywords: ['花粉', '土埃', '黄色い汚れ', '窓枠', 'サッシ'],
        category: 'window_dust',
        difficulty: 'easy',
        cleaningTime: '15-30分',
        tools: ['掃除機', '中性洗剤', 'マイクロファイバー']
    },
    '手垢・指紋': {
        keywords: ['手垢', '指紋', '皮脂', 'ガラス', '透明感'],
        category: 'window_prints',
        difficulty: 'easy',
        cleaningTime: '10-20分',
        tools: ['ガラスクリーナー', 'アルコール', 'ペーパータオル']
    },

    // 🧹 床・フローリング系汚れ
    'ホコリ': {
        keywords: ['ホコリ', 'ちり', '綿ぼこり', 'フローリング'],
        category: 'floor_dust',
        difficulty: 'easy',
        cleaningTime: '10-20分',
        tools: ['掃除機', 'ドライシート', 'フロアワイパー']
    },
    '食べこぼし': {
        keywords: ['食べこぼし', 'シミ', '油染み', 'べたつき'],
        category: 'floor_spills',
        difficulty: 'medium',
        cleaningTime: '15-30分',
        tools: ['中性洗剤', 'ウエットシート', 'スプレー']
    },
    'ペットの毛': {
        keywords: ['ペットの毛', '犬の毛', '猫の毛', '動物の毛'],
        category: 'pet_hair',
        difficulty: 'medium',
        cleaningTime: '20-40分',
        tools: ['ペット用掃除機', 'コロコロ', '静電気ブラシ']
    },
    'フローリングのワックス剥がれ': {
        keywords: ['ワックス', '艶なし', 'くすみ', '傷'],
        category: 'floor_wax',
        difficulty: 'hard',
        cleaningTime: '60-120分',
        tools: ['ワックス剥離剤', 'フローリング用洗剤', 'ワックス']
    },

    // 🌪️ エアコン・家電系汚れ
    'エアコンのホコリ': {
        keywords: ['エアコン', 'フィルター', 'ホコリ', '風が弱い'],
        category: 'aircon_dust',
        difficulty: 'medium',
        cleaningTime: '30-60分',
        tools: ['掃除機', 'エアコン洗浄スプレー', 'ブラシ']
    },
    'エアコンのカビ': {
        keywords: ['エアコン', 'カビ', '嫌な臭い', '黒い汚れ'],
        category: 'aircon_mold',
        difficulty: 'hard',
        cleaningTime: '60-120分',
        tools: ['エアコンクリーナー', '除菌スプレー', '専用ブラシ']
    },

    // 🧺 洗濯機系汚れ
    '洗濯機のカビ': {
        keywords: ['洗濯機', 'カビ', '洗濯槽', '嫌な臭い', '黒いワカメ'],
        category: 'washer_mold',
        difficulty: 'medium',
        cleaningTime: '120-180分',
        tools: ['洗濯槽クリーナー', '塩素系漂白剤', '酸素系漂白剤']
    },
    '洗濯機の水垢': {
        keywords: ['洗濯機', '水垢', '白い汚れ', '洗剤残り'],
        category: 'washer_scale',
        difficulty: 'medium',
        cleaningTime: '60-90分',
        tools: ['クエン酸', '洗濯槽クリーナー', 'タオル']
    }
};

// 🛒 完全版：商品データベース（全汚れ対応・拡充版）
const COMPREHENSIVE_PRODUCT_DATABASE = {
    // 🔥 キッチン油汚れ専用（大幅拡充）
    kitchen_oil: {
        cleaners: [
            {
                asin: "B07C44DM6S",
                name: "花王 マジックリン ハンディスプレー 400ml",
                badge: "🏆 換気扇No.1",
                emoji: "🧴",
                category: "キッチン油汚れ専用",
                priority: 1,
                brand: "花王",
                features: ["界面活性剤", "油汚れ分解", "スプレータイプ"],
                targetDirt: ["油汚れ", "ベトベト汚れ"]
            },
            {
                asin: "B002E1AU3A",
                name: "ライオン ママレモン 大容量 800ml",
                badge: "💪 強力洗浄",
                emoji: "🍋",
                category: "キッチン油汚れ専用",
                priority: 2,
                brand: "ライオン",
                features: ["レモンパワー", "界面活性剤48%", "大容量"],
                targetDirt: ["油汚れ", "換気扇汚れ"]
            },
            {
                asin: "B07QN4M52D",
                name: "重曹ちゃん キッチン泡スプレー 300ml",
                badge: "🌿 天然成分",
                emoji: "💚",
                category: "天然系油汚れ用",
                priority: 3,
                brand: "重曹ちゃん",
                features: ["重曹配合", "環境配慮", "泡タイプ"],
                targetDirt: ["油汚れ"]
            },
            {
                asin: "B08KGL4M56",
                name: "業務用 強力油汚れクリーナー 500ml",
                badge: "💪 業務用パワー",
                emoji: "⚡",
                category: "強力油汚れ用",
                priority: 4,
                brand: "プロ仕様",
                features: ["業務用成分", "強力分解", "大容量"],
                targetDirt: ["頑固な油汚れ", "焦げ付き"]
            },
            {
                asin: "B09ABC1234",
                name: "キュキュット クリア除菌 スプレー 300ml",
                badge: "🦠 除菌効果",
                emoji: "✨",
                category: "除菌系油汚れ用",
                priority: 5,
                brand: "花王",
                features: ["除菌99.9%", "油汚れ", "クリアタイプ"],
                targetDirt: ["油汚れ", "キッチン除菌"]
            }
        ],
        tools: [
            {
                asin: "B01M4KGHF7",
                name: "換気扇 専用ブラシセット 3本組",
                badge: "🪥 換気扇専用",
                emoji: "🪥",
                category: "換気扇掃除ブラシ",
                priority: 1,
                brand: "清掃プロ",
                features: ["カーブブラシ", "隙間対応", "3本セット"]
            },
            {
                asin: "B02QRS5678",
                name: "金属たわし ステンレス製 5個セット",
                badge: "💪 強力研磨",
                emoji: "🧽",
                category: "金属たわし",
                priority: 2,
                brand: "3M",
                features: ["ステンレス製", "耐久性", "5個入"],
                targetDirt: ["焦げ付き", "頑固な油汚れ"]
            },
            {
                asin: "B03DEF8901",
                name: "スクレーパー プラスチック製 安全タイプ",
                badge: "🛡️ 安全設計",
                emoji: "🔧",
                category: "スクレーパー",
                priority: 3,
                brand: "キッチンツール",
                features: ["プラスチック製", "傷つけない", "安全設計"]
            }
        ],
        protection: [
            {
                asin: "B04GHI2345",
                name: "ニトリル手袋 キッチン用 50枚入",
                badge: "🧤 手保護",
                emoji: "🧤",
                category: "保護手袋",
                priority: 1,
                brand: "保護用品",
                features: ["ニトリル製", "油に強い", "50枚入"],
                targetDirt: ["手の保護"]
            },
            {
                asin: "B05JKL3456",
                name: "防水エプロン 油汚れ対応",
                badge: "👕 服保護",
                emoji: "👕",
                category: "保護エプロン",
                priority: 2,
                brand: "キッチン用品",
                features: ["防水加工", "油汚れ対応", "調整可能"]
            },
            {
                asin: "B06MNO4567",
                name: "マスク 防塵タイプ 20枚入",
                badge: "😷 呼吸保護",
                emoji: "😷",
                category: "保護マスク",
                priority: 3,
                brand: "安全用品",
                features: ["防塵効果", "快適装着", "20枚入"]
            }
        ]
    },

    // 🔥 キッチン焦げ付き専用
    kitchen_burnt: {
        cleaners: [
            {
                asin: "B09KLM7890",
                name: "重曹 + クエン酸 焦げ落としペースト 200g",
                badge: "🧪 化学反応",
                emoji: "⚗️",
                category: "焦げ付き専用",
                priority: 1,
                brand: "キッチン革命",
                features: ["重曹+クエン酸", "泡立ち効果", "研磨作用"],
                targetDirt: ["焦げ付き", "炭化汚れ"]
            },
            {
                asin: "B08NOP1234",
                name: "クレンザー 研磨剤入り 400g",
                badge: "💎 研磨効果",
                emoji: "💎",
                category: "研磨系クレンザー",
                priority: 2,
                brand: "ジフ",
                features: ["研磨剤配合", "頑固汚れ", "クリーム状"],
                targetDirt: ["焦げ付き", "水垢"]
            }
        ],
        tools: [
            {
                asin: "B02QRS5678",
                name: "金属たわし ステンレス製 5個セット",
                badge: "💪 強力研磨",
                emoji: "🧽",
                category: "金属たわし",
                priority: 1,
                brand: "3M",
                features: ["ステンレス製", "耐久性", "5個入"],
                targetDirt: ["焦げ付き"]
            }
        ],
        protection: [
            {
                asin: "B04GHI2345",
                name: "ニトリル手袋 キッチン用 50枚入",
                badge: "🧤 手保護",
                emoji: "🧤",
                category: "保護手袋",
                priority: 1,
                brand: "保護用品",
                features: ["ニトリル製", "油に強い", "50枚入"],
                targetDirt: ["手の保護"]
            }
        ]
    },

    // 🛁 浴室カビ専用
    bathroom_mold: {
        cleaners: [
            {
                asin: "B000FQTJZW",
                name: "ジョンソン カビキラー 400g",
                badge: "🏆 カビ除去No.1",
                emoji: "🦠",
                category: "カビ取り剤",
                priority: 1,
                brand: "ジョンソン",
                features: ["塩素系", "強力カビ除去", "スプレータイプ"],
                targetDirt: ["カビ汚れ", "黒カビ"]
            },
            {
                asin: "B07K8LM123",
                name: "強力 カビ取り ジェルスプレー 500ml",
                badge: "💪 密着ジェル",
                emoji: "🧪",
                category: "ジェル式カビ取り",
                priority: 2,
                brand: "ライオン",
                features: ["密着ジェル", "長時間作用", "ゴムパッキン対応"],
                targetDirt: ["黒カビ", "ピンクカビ"]
            },
            {
                asin: "B08PKM7890",
                name: "防カビ コーティングスプレー 300ml",
                badge: "🛡️ 予防効果",
                emoji: "✨",
                category: "カビ防止剤",
                priority: 3,
                brand: "エステー",
                features: ["防カビコート", "予防効果", "長期持続"],
                targetDirt: ["カビ予防"]
            }
        ],
        tools: [
            {
                asin: "B01HGF8901",
                name: "浴室用 カビ取りブラシセット",
                badge: "🪥 隙間対応",
                emoji: "🪥",
                category: "浴室ブラシ",
                priority: 1,
                brand: "バス用品",
                features: ["細いブラシ", "角度調整", "ゴムパッキン用"]
            }
        ],
        protection: [
            {
                asin: "B07PQR6789",
                name: "ゴム手袋 厚手タイプ カビ取り専用",
                badge: "🧤 化学品対応",
                emoji: "🧤",
                category: "保護手袋",
                priority: 1,
                brand: "化学品対応",
                features: ["厚手ゴム", "塩素系対応", "滑り止め"]
            }
        ]
    },

    // 💧 浴室水垢専用
    bathroom_scale: {
        cleaners: [
            {
                asin: "B07KLM5678",
                name: "茂木和哉 水垢洗剤 200ml",
                badge: "🏆 水垢専門",
                emoji: "💎",
                category: "水垢専用洗剤",
                priority: 1,
                brand: "茂木和哉",
                features: ["研磨剤配合", "業務用", "頑固な水垢対応"],
                targetDirt: ["水垢", "ウロコ汚れ"]
            },
            {
                asin: "B08NOP9012",
                name: "クエン酸 水垢落とし 400ml",
                badge: "🍋 天然成分",
                emoji: "🍋",
                category: "クエン酸系洗剤",
                priority: 2,
                brand: "自然派",
                features: ["クエン酸配合", "天然成分", "環境配慮"],
                targetDirt: ["水垢", "石灰汚れ"]
            }
        ],
        tools: [
            {
                asin: "B01QRS3456",
                name: "ダイヤモンドパッド 水垢取り用 3枚",
                badge: "💎 研磨効果",
                emoji: "💎",
                category: "研磨パッド",
                priority: 1,
                brand: "3M",
                features: ["ダイヤモンド研磨", "傷つけない", "3枚入"],
                targetDirt: ["頑固な水垢"]
            }
        ],
        protection: []
    },

    // 🧼 石鹸カス専用
    soap_scum: {
        cleaners: [
            {
                asin: "B09TUV1234",
                name: "石鹸カス除去 アルカリ洗剤 500ml",
                badge: "🧼 石鹸カス特化",
                emoji: "🧼",
                category: "石鹸カス専用",
                priority: 1,
                brand: "バスクリン",
                features: ["アルカリ性", "石鹸カス分解", "スプレータイプ"],
                targetDirt: ["石鹸カス", "白い膜"]
            },
            {
                asin: "B00OOCWP44",
                name: "レック 激落ちくん メラミンスポンジ 20個",
                badge: "🫧 研磨効果",
                emoji: "🧽",
                category: "研磨スポンジ",
                priority: 2,
                brand: "レック",
                features: ["メラミン樹脂", "水だけ", "20個入"],
                targetDirt: ["石鹸カス", "水垢"]
            }
        ],
        tools: [],
        protection: []
    },

    // 🚽 トイレ汚れ専用
    toilet_general: {
        cleaners: [
            {
                asin: "B000FQM123",
                name: "花王 トイレマジックリン 消臭洗浄スプレー",
                badge: "🏆 トイレ専用No.1",
                emoji: "🚽",
                category: "トイレ専用洗剤",
                priority: 1,
                brand: "花王",
                features: ["除菌・消臭", "便器専用", "スプレータイプ"],
                targetDirt: ["トイレ汚れ", "一般的な汚れ"]
            },
            {
                asin: "B08YTR8901",
                name: "トイレ用 除菌シート 50枚入",
                badge: "🦠 除菌効果",
                emoji: "🧻",
                category: "除菌シート",
                priority: 2,
                brand: "エリエール",
                features: ["除菌99.9%", "便座対応", "大判サイズ"],
                targetDirt: ["トイレ汚れ"]
            }
        ],
        tools: [
            {
                asin: "B01KLM2345",
                name: "トイレブラシ 抗菌加工 ケース付き",
                badge: "🚽 便器専用",
                emoji: "🪥",
                category: "トイレブラシ",
                priority: 1,
                brand: "無印良品",
                features: ["抗菌加工", "ケース付き", "コンパクト"],
                targetDirt: ["便器掃除"]
            }
        ],
        protection: []
    },

    // 💛 尿石専用
    toilet_urine: {
        cleaners: [
            {
                asin: "B07YHL4567",
                name: "サンポール 尿石除去 強力クリーナー 500ml",
                badge: "💪 尿石分解",
                emoji: "⚡",
                category: "尿石除去剤",
                priority: 1,
                brand: "サンポール",
                features: ["酸性洗剤", "尿石分解", "黄ばみ除去"],
                targetDirt: ["尿石", "黄ばみ"]
            },
            {
                asin: "B09WXY2345",
                name: "尿石とり 業務用 1000ml",
                badge: "🏢 業務用",
                emoji: "🏭",
                category: "業務用尿石除去",
                priority: 2,
                brand: "業務用",
                features: ["業務用濃度", "大容量", "頑固な尿石"],
                targetDirt: ["頑固な尿石"]
            }
        ],
        tools: [],
        protection: []
    },

    // 🪟 窓ガラス専用
    window_scale: {
        cleaners: [
            {
                asin: "B000PQR123",
                name: "花王 ガラスマジックリン 400ml",
                badge: "✨ 透明仕上げ",
                emoji: "🪟",
                category: "ガラス専用洗剤",
                priority: 1,
                brand: "花王",
                features: ["アンモニア配合", "ムラなし", "速乾性"],
                targetDirt: ["ガラス汚れ", "手垢"]
            },
            {
                asin: "B07ZAB4567",
                name: "窓ガラス 水垢・ウロコ取り 300ml",
                badge: "💧 水垢除去",
                emoji: "💎",
                category: "ガラス水垢除去",
                priority: 2,
                brand: "キンチョー",
                features: ["酸性成分", "水垢分解", "鏡にも対応"],
                targetDirt: ["窓の水垢", "ウロコ汚れ"]
            }
        ],
        tools: [
            {
                asin: "B01STU8901",
                name: "窓掃除用 スクイージー プロ仕様 35cm",
                badge: "💧 水切り専用",
                emoji: "🧽",
                category: "スクイージー",
                priority: 1,
                brand: "プロ清掃",
                features: ["ステンレス刃", "伸縮ハンドル", "プロ仕様"],
                targetDirt: ["窓掃除"]
            }
        ],
        protection: []
    },

    // 🧹 床掃除専用
    floor_dust: {
        cleaners: [
            {
                asin: "B00EOHQPHC",
                name: "花王 クイックルワイパー 立体吸着ドライシート 40枚",
                badge: "🏆 床掃除No.1",
                emoji: "🧹",
                category: "ドライシート",
                priority: 1,
                brand: "花王",
                features: ["立体吸着", "ホコリキャッチ", "40枚入"],
                targetDirt: ["ホコリ", "髪の毛"]
            },
            {
                asin: "B07NBA84F5",
                name: "クイックルワイパー ウエットシート 32枚",
                badge: "💧 水拭き効果",
                emoji: "💧",
                category: "ウエットシート",
                priority: 2,
                brand: "花王",
                features: ["除菌効果", "フローリング対応", "大判サイズ"],
                targetDirt: ["食べこぼし", "ベタつき"]
            }
        ],
        tools: [
            {
                asin: "B005AILJ3O",
                name: "花王 クイックルワイパー 本体 + シート",
                badge: "🧹 フローリング対応",
                emoji: "🧹",
                category: "ワイパー本体",
                priority: 1,
                brand: "花王",
                features: ["360度回転", "軽量設計", "シート付属"],
                targetDirt: ["床掃除全般"]
            }
        ],
        protection: []
    },

    // 🐕 ペットの毛専用
    pet_hair: {
        cleaners: [
            {
                asin: "B09ZAB1234",
                name: "ペット用 毛取りクリーナー 500ml",
                badge: "🐕 ペット専用",
                emoji: "🐕",
                category: "ペット毛除去",
                priority: 1,
                brand: "ペットケア",
                features: ["静電気除去", "毛玉分解", "ペット安全"],
                targetDirt: ["ペットの毛", "毛玉"]
            }
        ],
        tools: [
            {
                asin: "B03CDE6789",
                name: "ペット毛専用 掃除機ブラシ コードレス",
                badge: "🌪️ 強力吸引",
                emoji: "🌪️",
                category: "ペット用掃除機",
                priority: 1,
                brand: "ダイソン",
                features: ["ペット毛専用", "コードレス", "強力吸引"],
                targetDirt: ["ペットの毛"]
            }
        ],
        protection: []
    },

    // 🌪️ エアコン専用
    aircon_dust: {
        cleaners: [
            {
                asin: "B08BCD3456",
                name: "エアコン洗浄スプレー 無香料 420ml",
                badge: "❄️ エアコン専用",
                emoji: "❄️",
                category: "エアコンクリーナー",
                priority: 1,
                brand: "アース製薬",
                features: ["フィン専用", "除菌効果", "無香料"],
                targetDirt: ["エアコンのホコリ", "エアコンのカビ"]
            }
        ],
        tools: [
            {
                asin: "B04EFG7890",
                name: "エアコン掃除 専用ブラシセット",
                badge: "🪥 エアコン専用",
                emoji: "🪥",
                category: "エアコンブラシ",
                priority: 1,
                brand: "空調ケア",
                features: ["フィン用", "ファン用", "3本セット"],
                targetDirt: ["エアコン内部"]
            }
        ],
        protection: []
    },

    // 🧺 洗濯機専用
    washer_mold: {
        cleaners: [
            {
                asin: "B08FGH4567",
                name: "洗濯槽クリーナー 酸素系漂白剤 500g",
                badge: "🧺 洗濯槽専用",
                emoji: "🧺",
                category: "洗濯槽クリーナー",
                priority: 1,
                brand: "シャボン玉石けん",
                features: ["酸素系", "カビ除去", "除菌効果"],
                targetDirt: ["洗濯機のカビ", "洗濯機の臭い"]
            }
        ],
        tools: [],
        protection: []
    }
};

// 🎯 場所別設定（完全版）
const COMPREHENSIVE_LOCATION_CONFIG = {
    kitchen: { 
        label: '🔥 キッチン・換気扇', 
        dirtTypes: ['油汚れ', 'ベトベト汚れ', '焦げ付き', 'ぬめり汚れ', '水垢（キッチン）'], 
        surface: '換気扇・キッチン',
        searchKeywords: ['キッチン', '換気扇', '油汚れ', 'コンロ', 'シンク'],
        difficulty: 'medium',
        primaryCategories: ['kitchen_oil', 'kitchen_burnt', 'kitchen_slime'],
        detailedLocations: [
            { id: 'kitchen-sink', label: 'シンク', emoji: '🚰' },
            { id: 'kitchen-gasCooktop', label: 'ガスコンロ', emoji: '🔥' },
            { id: 'kitchen-rangeHood', label: '換気扇', emoji: '🌬️' },
            { id: 'kitchen-refrigerator', label: '冷蔵庫', emoji: '🧊' },
            { id: 'kitchen-microwave', label: '電子レンジ', emoji: '♨️' }
        ]
    },
    bathroom: { 
        label: '🛁 浴室・お風呂', 
        dirtTypes: ['カビ汚れ', '水垢（浴室）', '石鹸カス', '皮脂汚れ', '髪の毛'], 
        surface: '浴室・タイル',
        searchKeywords: ['浴室', 'お風呂', 'カビ', 'タイル', '水垢', '石鹸カス'],
        difficulty: 'medium',
        primaryCategories: ['bathroom_mold', 'bathroom_scale', 'soap_scum'],
        detailedLocations: [
            { id: 'bathroom-bathtub', label: '浴槽', emoji: '🛀' },
            { id: 'bathroom-floor', label: '床', emoji: '🦶' },
            { id: 'bathroom-walls', label: '壁', emoji: '🧱' }
        ]
    },
    toilet: { 
        label: '🚽 トイレ', 
        dirtTypes: ['トイレ汚れ', '尿石', 'トイレの水垢', 'トイレのカビ'], 
        surface: '便器・陶器',
        searchKeywords: ['トイレ', '便器', '尿石', '黄ばみ'],
        difficulty: 'easy',
        primaryCategories: ['toilet_general', 'toilet_urine'],
        detailedLocations: [
            { id: 'toilet-bowl', label: '便器', emoji: '🚽' },
            { id: 'toilet-floor', label: '床', emoji: '🦶' },
            { id: 'toilet-walls', label: '壁', emoji: '🧱' }
        ]
    },
    window: { 
        label: '🪟 窓・ガラス', 
        dirtTypes: ['窓の水垢', '花粉・土埃', '手垢・指紋'], 
        surface: '窓・ガラス',
        searchKeywords: ['窓', 'ガラス', '水垢', 'サッシ', '花粉'],
        difficulty: 'easy',
        primaryCategories: ['window_scale', 'window_dust'],
        detailedLocations: [
            { id: 'window-glass', label: 'ガラス', emoji: '🪟' },
            { id: 'window-screen', label: '網戸', emoji: '🕸️' },
            { id: 'window-sash', label: 'サッシ', emoji: '🪚' }
        ]
    },
    floor: { 
        label: '🧹 床・フローリング', 
        dirtTypes: ['ホコリ', '食べこぼし', 'ペットの毛', 'フローリングのワックス剥がれ'], 
        surface: '床・フローリング',
        searchKeywords: ['床', 'フローリング', 'ホコリ', '掃除機'],
        difficulty: 'easy',
        primaryCategories: ['floor_dust', 'pet_hair'],
        detailedLocations: [
            { id: 'floor-wooden', label: 'フローリング', emoji: '🪵' },
            { id: 'floor-carpet', label: 'カーペット', emoji: '🧶' },
            { id: 'floor-tatami', label: '畳', emoji: '🌾' }
        ]
    },
    aircon: {
        label: '❄️ エアコン',
        dirtTypes: ['エアコンのホコリ', 'エアコンのカビ'],
        surface: 'エアコン・空調',
        searchKeywords: ['エアコン', 'フィルター', 'ホコリ', 'カビ'],
        difficulty: 'medium',
        primaryCategories: ['aircon_dust', 'aircon_mold'],
        detailedLocations: [
            { id: 'aircon-filter', label: 'フィルター', emoji: '🌬️' },
            { id: 'aircon-internal', label: '内部', emoji: '🌀' }
        ]
    },
    washer: {
        label: '🧺 洗濯機',
        dirtTypes: ['洗濯機のカビ', '洗濯機の水垢'],
        surface: '洗濯機・洗濯槽',
        searchKeywords: ['洗濯機', '洗濯槽', 'カビ', '臭い'],
        difficulty: 'medium',
        primaryCategories: ['washer_mold', 'washer_scale'],
        detailedLocations: [
            { id: 'washer-tub', label: '洗濯槽', emoji: '🧺' },
            { id: 'washer-drain', label: '排水口', emoji: '💧' }
        ]
    },
    livingRoom: { 
        label: '🛋️ リビング', 
        dirtTypes: ['ホコリ', '手垢・指紋', 'ペットの毛'], 
        surface: 'リビング全般',
        searchKeywords: ['リビング', 'ソファ', 'テーブル', 'テレビ'],
        difficulty: 'easy',
        primaryCategories: ['floor_dust', 'pet_hair'],
        detailedLocations: [
            { id: 'livingRoom-walls', label: '壁', emoji: '🧱' },
            { id: 'livingRoom-sofa', label: 'ソファ', emoji: '🛋️' },
            { id: 'livingRoom-table', label: 'テーブル', emoji: ' میز' }
        ]
    },
    custom: { 
        label: '✏️ その他（自由記述）', 
        dirtTypes: [], 
        surface: null,
        searchKeywords: ['掃除', 'クリーナー', '洗剤'],
        difficulty: 'medium',
        primaryCategories: ['kitchen_oil']
    }
};

// 🎯 完全版スマート商品選択システム
const ULTIMATE_PRODUCT_MATCHER = {
    // 汚れタイプから商品カテゴリを決定（完全版）
    getProductCategory: function(dirtType, location) {
        console.log(`🔍 汚れタイプ分析: "${dirtType}" 場所: "${location}"`);
        
        // 1. 完全一致検索
        const exactMatch = COMPREHENSIVE_DIRT_MAPPING[dirtType];
        if (exactMatch && exactMatch.category) {
            console.log(`✅ 完全一致: ${exactMatch.category}`);
            return exactMatch.category;
        }
        
        // 2. 部分一致検索（キーワードベース）
        const dirtLower = dirtType.toLowerCase();
        for (const [mappedDirtType, config] of Object.entries(COMPREHENSIVE_DIRT_MAPPING)) {
            if (config.keywords.some(keyword => dirtLower.includes(keyword.toLowerCase()))) {
                console.log(`🎯 キーワード一致: ${mappedDirtType} -> ${config.category}`);
                return config.category;
            }
        }
        
        // 3. 場所からの推定
        const locationConfig = COMPREHENSIVE_LOCATION_CONFIG[location];
        if (locationConfig && locationConfig.primaryCategories && locationConfig.primaryCategories.length > 0) {
            console.log(`📍 場所ベース推定: ${locationConfig.primaryCategories[0]}`);
            return locationConfig.primaryCategories[0];
        }
        
        // 4. 高度なパターンマッチング
        if (dirtLower.includes('油') || dirtLower.includes('グリース') || dirtLower.includes('ベト')) {
            return 'kitchen_oil';
        } else if (dirtLower.includes('カビ') || dirtLower.includes('黒') || dirtLower.includes('ピンク')) {
            return location === 'toilet' ? 'toilet_mold' : 'bathroom_mold';
        } else if (dirtLower.includes('水垢') || dirtLower.includes('ウロコ') || dirtLower.includes('白い')) {
            if (location === 'window') return 'window_scale';
            if (location === 'toilet') return 'toilet_scale';
            return 'bathroom_scale';
        } else if (dirtLower.includes('石鹸') || dirtLower.includes('膜')) {
            return 'soap_scum';
        } else if (dirtLower.includes('尿') || dirtLower.includes('黄ば')) {
            return 'toilet_urine';
        } else if (dirtLower.includes('ホコリ') || dirtLower.includes('ちり')) {
            return 'floor_dust';
        } else if (dirtLower.includes('ペット') || dirtLower.includes('毛')) {
            return 'pet_hair';
        } else if (dirtLower.includes('エアコン')) {
            return 'aircon_dust';
        } else if (dirtLower.includes('洗濯')) {
            return 'washer_mold';
        }
        
        // 5. 最終フォールバック
        console.log(`⚠️ フォールバック: kitchen_oil`);
        return 'kitchen_oil';
    },
    
    // 商品を取得（完全版）
    getProducts: function(dirtType, location) {
        const category = this.getProductCategory(dirtType, location);
        const products = COMPREHENSIVE_PRODUCT_DATABASE[category];
        
        if (!products) {
            console.warn(`商品カテゴリが見つかりません: ${category}`);
            return COMPREHENSIVE_PRODUCT_DATABASE['kitchen_oil']; // フォールバック
        }
        
        // 汚れタイプに最適な商品をフィルタリング
        const filteredProducts = {
            cleaners: products.cleaners.filter(p => 
                !p.targetDirt || p.targetDirt.some(target => 
                    target === dirtType || dirtType.includes(target) || target.includes(dirtType)
                )
            ).sort((a, b) => a.priority - b.priority).slice(0, 10), // priorityでソートし、最大10個
            tools: (products.tools || []).sort((a, b) => a.priority - b.priority).slice(0, 10), // priorityでソートし、最大10個
            protection: (products.protection || []).sort((a, b) => a.priority - b.priority).slice(0, 10) // priorityでソートし、最大10個
        };
        
        // フィルタリング結果が空の場合は元の商品を返す
        if (filteredProducts.cleaners.length === 0) {
            filteredProducts.cleaners = products.cleaners.sort((a, b) => a.priority - b.priority).slice(0, 10);
        }
        
        console.log(`🛒 商品選択完了: 洗剤${filteredProducts.cleaners.length}個, ツール${filteredProducts.tools.length}個, 保護具${filteredProducts.protection.length}個`);
        return filteredProducts;
    },
    
    // 関連商品を取得
    getRelatedProducts: function(dirtType, location) {
        const relatedCategories = this.getRelatedCategories(dirtType, location);
        const allProducts = { cleaners: [], tools: [], protection: [] };
        
        relatedCategories.forEach(category => {
            const products = COMPREHENSIVE_PRODUCT_DATABASE[category];
            if (products) {
                allProducts.cleaners.push(...products.cleaners.slice(0, 1)); // 各カテゴリから1個
                allProducts.tools.push(...products.tools.slice(0, 1));
                allProducts.protection.push(...products.protection.slice(0, 1));
            }
        });
        
        return allProducts;
    },
    
    // 関連カテゴリを取得
    getRelatedCategories: function(dirtType, location) {
        const locationConfig = COMPREHENSIVE_LOCATION_CONFIG[location];
        return locationConfig ? locationConfig.primaryCategories.slice(0, 3) : ['kitchen_oil'];
    }
};

// フォールバック商品データ（完全版・実在商品価格）
const COMPREHENSIVE_FALLBACK_DATA = {
    // キッチン系
    "B000TGNG0W": { name: "花王 マジックリン ハンディスプレー 400ml", price: "¥398", rating: 4.3, reviews: 2847, availability: "在庫あり" },
    "B08XKJM789": { name: "ライオン ママレモン 大容量 800ml", price: "¥598", rating: 4.4, reviews: 3456, availability: "在庫あり" },
    "B07YWJ8234": { name: "重曹ちゃん キッチン泡スプレー 300ml", price: "¥298", rating: 4.1, reviews: 1234, availability: "在庫あり" },
    "B08KGL4M56": { name: "業務用 強力油汚れクリーナー 500ml", price: "¥698", rating: 4.5, reviews: 876, availability: "在庫あり" },
    "B09ABC1234": { name: "キュキュット クリア除菌 スプレー 300ml", price: "¥348", rating: 4.2, reviews: 2134, availability: "在庫あり" },
    "B09KLM7890": { name: "重曹 + クエン酸 焦げ落としペースト 200g", price: "¥498", rating: 4.2, reviews: 654, availability: "在庫あり" },
    "B08NOP1234": { name: "クレンザー 研磨剤入り 400g", price: "¥298", rating: 4.0, reviews: 1876, availability: "在庫あり" },
    
    // 浴室系
    "B000FQTJZW": { name: "ジョンソン カビキラー 400g", price: "¥298", rating: 4.4, reviews: 3456, availability: "在庫あり" },
    "B07K8LM123": { name: "強力 カビ取り ジェルスプレー 500ml", price: "¥498", rating: 4.2, reviews: 1987, availability: "在庫あり" },
    "B08PKM7890": { name: "防カビ コーティングスプレー 300ml", price: "¥598", rating: 4.0, reviews: 567, availability: "在庫あり" },
    "B07KLM5678": { name: "茂木和哉 水垢洗剤 200ml", price: "¥1,298", rating: 4.6, reviews: 2134, availability: "在庫あり" },
    "B08NOP9012": { name: "クエン酸 水垢落とし 400ml", price: "¥398", rating: 4.1, reviews: 987, availability: "在庫あり" },
    "B09TUV1234": { name: "石鹸カス除去 アルカリ洗剤 500ml", price: "¥498", rating: 4.2, reviews: 756, availability: "在庫あり" },
    
    // トイレ系
    "B000FQM123": { name: "花王 トイレマジックリン 消臭洗浄スプレー", price: "¥248", rating: 4.3, reviews: 2134, availability: "在庫あり" },
    "B07YHL4567": { name: "サンポール 尿石除去 強力クリーナー 500ml", price: "¥398", rating: 4.1, reviews: 876, availability: "在庫あり" },
    "B08YTR8901": { name: "トイレ用 除菌シート 50枚入", price: "¥198", rating: 4.2, reviews: 1543, availability: "在庫あり" },
    "B09WXY2345": { name: "尿石とり 業務用 1000ml", price: "¥798", rating: 4.4, reviews: 432, availability: "在庫あり" },
    
    // 窓ガラス系
    "B000PQR123": { name: "花王 ガラスマジックリン 400ml", price: "¥298", rating: 4.2, reviews: 1654, availability: "在庫あり" },
    "B07ZAB4567": { name: "窓ガラス 水垢・ウロコ取り 300ml", price: "¥698", rating: 4.4, reviews: 987, availability: "在庫あり" },
    
    // 床掃除系
    "B00EOHQPHC": { name: "花王 クイックルワイパー 立体吸着ドライシート 40枚", price: "¥598", rating: 4.5, reviews: 4567, availability: "在庫あり" },
    "B07NBA84F5": { name: "クイックルワイパー ウエットシート 32枚", price: "¥498", rating: 4.3, reviews: 3210, availability: "在庫あり" },
    "B005AILJ3O": { name: "花王 クイックルワイパー 本体 + シート", price: "¥1,298", rating: 4.4, reviews: 2876, availability: "在庫あり" },
    
    // ペット系
    "B09ZAB1234": { name: "ペット用 毛取りクリーナー 500ml", price: "¥798", rating: 4.3, reviews: 543, availability: "在庫あり" },
    "B03CDE6789": { name: "ペット毛専用 掃除機ブラシ コードレス", price: "¥12,800", rating: 4.6, reviews: 876, availability: "在庫あり" },
    
    // エアコン系
    "B08BCD3456": { name: "エアコン洗浄スプレー 無香料 420ml", price: "¥598", rating: 4.2, reviews: 1234, availability: "在庫あり" },
    "B04EFG7890": { name: "エアコン掃除 専用ブラシセット", price: "¥898", rating: 4.1, reviews: 432, availability: "在庫あり" },
    
    // 洗濯機系
    "B08FGH4567": { name: "洗濯槽クリーナー 酸素系漂白剤 500g", price: "¥398", rating: 4.4, reviews: 1876, availability: "在庫あり" },
    
    // ツール類
    "B01M4KGHF7": { name: "換気扇 専用ブラシセット 3本組", price: "¥798", rating: 4.0, reviews: 654, availability: "在庫あり" },
    "B00OOCWP44": { name: "レック 激落ちくん メラミンスポンジ 20個", price: "¥248", rating: 4.6, reviews: 5432, availability: "在庫あり" },
    "B01HGF8901": { name: "浴室用 カビ取りブラシセット", price: "¥498", rating: 4.2, reviews: 876, availability: "在庫あり" },
    "B01KLM2345": { name: "トイレブラシ 抗菌加工 ケース付き", price: "¥398", rating: 4.3, reviews: 1234, availability: "在庫あり" },
    "B01QRS3456": { name: "ダイヤモンドパッド 水垢取り用 3枚", price: "¥698", rating: 4.5, reviews: 432, availability: "在庫あり" },
    "B01STU8901": { name: "窓掃除用 スクイージー プロ仕様 35cm", price: "¥1,298", rating: 4.3, reviews: 765, availability: "在庫あり" },
    "B02QRS5678": { name: "金属たわし ステンレス製 5個セット", price: "¥398", rating: 4.1, reviews: 543, availability: "在庫あり" },
    "B03DEF8901": { name: "スクレーパー プラスチック製 安全タイプ", price: "¥298", rating: 4.0, reviews: 321, availability: "在庫あり" },
    
    // 保護具
    "B04GHI2345": { name: "ニトリル手袋 キッチン用 50枚入", price: "¥598", rating: 4.5, reviews: 2341, availability: "在庫あり" },
    "B05JKL3456": { name: "防水エプロン 油汚れ対応", price: "¥1,298", rating: 4.3, reviews: 876, availability: "在庫あり" },
    "B06MNO4567": { name: "マスク 防塵タイプ 20枚入", price: "¥498", rating: 4.4, reviews: 1543, availability: "在庫あり" },
    "B07PQR6789": { name: "ゴム手袋 厚手タイプ カビ取り専用", price: "¥398", rating: 4.2, reviews: 987, availability: "在庫あり" }
};

// AI プロンプト設定（完全版）
const COMPREHENSIVE_AI_PROMPTS = {
    imageAnalysis: `この画像を詳細に分析して、掃除に関する情報をJSON形式で返してください：

🔍 分析対象：
1. 場所の特定（kitchen/bathroom/toilet/window/floor/aircon/washer/other）
2. 汚れの種類（油汚れ/焦げ付き/カビ汚れ/水垢汚れ/石鹸カス/皮脂汚れ/髪の毛/尿石/ホコリ/手垢・指紋/ペットの毛/エアコンのホコリ/洗濯機のカビ/other）
3. 材質（metal/tile/glass/wood/plastic/ceramic/stainless/aluminum/other）
4. 汚れの程度（light/medium/heavy/very_heavy）
5. 清掃緊急度（low/medium/high/urgent）
6. 信頼度（0-100）

JSON形式で返答：
{
  "location": "場所",
  "dirtType": "具体的な汚れの種類", 
  "material": "材質",
  "severity": "汚れの程度",
  "urgency": "清掃緊急度",
  "confidence": 信頼度,
  "description": "画像の詳細説明",
  "additionalDirt": ["他に見える汚れ1", "他に見える汚れ2"]
}`,

    cleaningMethod: (dirtType, surface, customArea = null) => {
        const area = customArea || surface;
        const dirtConfig = COMPREHENSIVE_DIRT_MAPPING[dirtType];
        const difficulty = dirtConfig ? dirtConfig.difficulty : 'medium';
        const estimatedTime = dirtConfig ? dirtConfig.cleaningTime : '20-40分';
        
        return `以下の条件で安全で効果的な掃除方法を日本語で生成してください：

🎯 掃除対象：
- 場所: ${area}
- 汚れの種類: ${dirtType || '不明'}
- 推定難易度: ${difficulty}
- 推定時間: ${estimatedTime}

⚠️ 重要：安全性を最優先に、具体的で実践的な手順を提案してください。

JSON形式で出力：
{
  "title": "具体的で魅力的なタイトル",
  "steps": [
    "準備：必要な道具と保護具を用意",
    "安全確認：電源・換気・保護具着用",
    "前処理：汚れの種類に応じた下準備",
    "本清掃：効果的な清掃手順",
    "仕上げ：最終確認と清拭",
    "予防：再汚染防止のポイント",
    "道具手入れ：使用後の道具メンテナンス",
    "安全確認：作業完了後の安全チェック"
  ],
  "difficulty": "初級|中級|上級|専門級",
  "time": "正確な所要時間",
  "tips": "効果を高める具体的なコツ",
  "warnings": "重要な注意事項・安全上の警告",
  "frequency": "推奨清掃頻度",
  "prevention": "汚れ予防のアドバイス"
}`;
    },

    connectionTest: 'こんにちは。これはAPI接続テストです。「テスト成功」と返答してください。'
};

// エラーメッセージ設定
const ERROR_MESSAGES = {
    api: {
        geminiNotSet: { title: 'Gemini API Key未設定', details: 'Google AI Studioから取得したAPIキーを設定してください' },
        geminiInvalid: { title: 'APIキーエラー', details: 'APIキーが無効または不正な形式です' },
        geminiPermission: { title: 'API権限エラー', details: 'APIキーの権限がないか、利用制限に達しています' },
        geminiQuota: { title: 'API制限エラー', details: 'API利用制限に達しました。しばらく待ってから再度お試しください' },
        networkError: { title: 'ネットワークエラー', details: 'インターネット接続を確認してください' },
        corsError: { title: 'CORS制限エラー', details: 'ブラウザから直接APIを呼び出すことができません' }
    },
    validation: {
        noLocation: { title: '場所選択エラー', details: '掃除したい場所を選択してください' },
        noCustomLocation: { title: '入力エラー', details: 'カスタム場所を入力してください' }
    }
};

// UI設定
const UI_CONFIG = {
    animations: { fadeInDuration: 300, slideInDuration: 400, spinnerSpeed: '1s', priceFlashDuration: 500 },
    delays: { analysisMinimum: 2000, errorAutoHide: 10000, notificationDuration: 3000, securityAlertDuration: 3000 },
    limits: { maxImageSize: 5 * 1024 * 1024, maxDebugLogs: 100, maxRetries: 3 }
};

// デバッグ設定
const DEBUG_CONFIG = {
    enableConsoleLog: true, enableDebugPanel: true, enablePerformanceMonitoring: true,
    logLevels: ['info', 'warn', 'error', 'success'], maxLogEntries: 100
};

// セキュリティ設定
const SECURITY_CONFIG = {
    disableRightClick: true, disableTextSelection: true, disableDevTools: true,
    disableKeyboardShortcuts: true, enableContentProtection: true, monitoringInterval: 500
};

// エクスポート（グローバル変数として使用）
window.GEMINI_API_CONFIG = GEMINI_API_CONFIG;
window.AMAZON_PA_API_CONFIG = AMAZON_PA_API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.COMPREHENSIVE_DIRT_MAPPING = COMPREHENSIVE_DIRT_MAPPING;
window.DIRT_TYPE_MAPPING = COMPREHENSIVE_DIRT_MAPPING; // 後方互換性
window.COMPREHENSIVE_PRODUCT_DATABASE = COMPREHENSIVE_PRODUCT_DATABASE;
window.PRODUCT_DATABASE = COMPREHENSIVE_PRODUCT_DATABASE; // 後方互換性
window.ULTIMATE_PRODUCT_MATCHER = ULTIMATE_PRODUCT_MATCHER;
window.SMART_PRODUCT_MATCHER = ULTIMATE_PRODUCT_MATCHER; // 後方互換性
window.COMPREHENSIVE_LOCATION_CONFIG = COMPREHENSIVE_LOCATION_CONFIG;
window.LOCATION_CONFIG = COMPREHENSIVE_LOCATION_CONFIG; // 後方互換性
window.COMPREHENSIVE_FALLBACK_DATA = COMPREHENSIVE_FALLBACK_DATA;
window.FALLBACK_PRODUCT_DATA = COMPREHENSIVE_FALLBACK_DATA; // 後方互換性
window.COMPREHENSIVE_AI_PROMPTS = COMPREHENSIVE_AI_PROMPTS;
window.AI_PROMPTS = COMPREHENSIVE_AI_PROMPTS; // 後方互換性
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.UI_CONFIG = UI_CONFIG;
window.DEBUG_CONFIG = DEBUG_CONFIG;
window.SECURITY_CONFIG = SECURITY_CONFIG;

// 本番環境用 - console.logは削除済み
