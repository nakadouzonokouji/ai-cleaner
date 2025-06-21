const fs = require('fs');
const path = require('path');

// Product templates for different categories
const productTemplates = {
    // Bathroom cleaners
    bathroom: {
        cleaners: [
            {
                name: "花王 バスマジックリン 泡立ちスプレー 除菌・抗菌 アルコール成分プラス SUPER CLEAN スーパークリーン",
                image: "https://m.media-amazon.com/images/I/61uayFh1E4L._SL500_.jpg",
                asin: "B0DKQF8GQT",
                price: "¥398"
            },
            {
                name: "【大容量】カビキラー カビ取り剤 特大サイズ 本体 1,000g お風呂掃除 防カビ効果約30日",
                image: "https://m.media-amazon.com/images/I/51Zqnr5sNpL._SL500_.jpg",
                asin: "B00INE6A9S",
                price: "¥548"
            },
            {
                name: "激落ちくん GNお風呂まるごと バスクリーナー 380ml (浴室洗剤)",
                image: "https://m.media-amazon.com/images/I/610CtcQJSQL._SL500_.jpg",
                asin: "B09B6VGQ88",
                price: "¥220"
            },
            {
                name: "茂木和哉 お風呂のなまはげ お風呂用洗剤 スプレー 320ml",
                image: "https://m.media-amazon.com/images/I/51cj9kKoOOL._SL500_.jpg",
                asin: "B086GLQT2D",
                price: "¥801"
            },
            {
                name: "スクラビングバブル 激泡バスクリーナーEX 除菌 570ml",
                image: "https://m.media-amazon.com/images/I/71wCo8+Y7RL._SL500_.jpg",
                asin: "B0C2W9LZ7K",
                price: "¥374"
            }
        ],
        tools: [
            {
                name: "激落ちくん バスクリーナー マイクロ & ネット ホワイト S-829",
                image: "https://m.media-amazon.com/images/I/71nA1X43WuL._SL500_.jpg",
                asin: "B08NTHRHRL",
                price: "¥180"
            },
            {
                name: "3M スコッチブライト バスシャイン 抗菌 スポンジ 本体 × ハンドル セット お風呂掃除",
                image: "https://m.media-amazon.com/images/I/61Y7sqOJwOL._SL500_.jpg",
                asin: "B0BLZGMHLG",
                price: "¥439"
            },
            {
                name: "レック 激落ち 黒カビくん お風呂の 目地 研磨ブラシ",
                image: "https://m.media-amazon.com/images/I/61dwMxfHhHL._SL500_.jpg",
                asin: "B00IHLQM88",
                price: "¥337"
            },
            {
                name: "アズマ工業(Azuma Industrial) バスブラシ ピンク TK お風呂床ブラシスポG",
                image: "https://m.media-amazon.com/images/I/61V0T7KJV8L._SL500_.jpg",
                asin: "B0CDB36ZM4",
                price: "¥572"
            },
            {
                name: "【まとめ買い】 スコッチブライト お風呂掃除 ブラシ ハンディS 本体×2個",
                image: "https://m.media-amazon.com/images/I/51+mLo5r8QL._SL500_.jpg",
                asin: "B0CJF8J4HW",
                price: "¥480"
            }
        ],
        protections: [
            {
                name: "ショーワグローブ ナイスハンド ミュー 厚手 M ピンク",
                image: "https://m.media-amazon.com/images/I/71cgT8FiCqL._SL500_.jpg",
                asin: "B002P8QTWM",
                price: "¥302"
            },
            {
                name: "【防カビ】 ルック おふろの防カビくん煙剤 フローラルの香り × 3個パック",
                image: "https://m.media-amazon.com/images/I/61b5ksYDQAL._SL500_.jpg",
                asin: "B08T6B3ZW9",
                price: "¥1,074"
            },
            {
                name: "3M 防毒マスク 塗装作業用マスクセット 1200/3311J-55-S1",
                image: "https://m.media-amazon.com/images/I/61xArqfUTkL._SL500_.jpg",
                asin: "B005LCZC5W",
                price: "¥2,136"
            },
            {
                name: "TRUSCO(トラスコ) 一般作業用マスク 活性炭入 10枚入",
                image: "https://m.media-amazon.com/images/I/71L8pPtJ6xL._SL500_.jpg",
                asin: "B002A5OJ1Y",
                price: "¥476"
            },
            {
                name: "ダンロップ ホームプロダクツ ゴム手袋 天然ゴム プリティーネ M ピンク",
                image: "https://m.media-amazon.com/images/I/51fD2iOJ9VL._SL500_.jpg",
                asin: "B01LVYLOZC",
                price: "¥224"
            }
        ]
    },
    // Floor cleaners
    floor: {
        cleaners: [
            {
                name: "【大容量】かんたんマイペット フロア用洗剤 4.5L リビング用洗剤 業務用",
                image: "https://m.media-amazon.com/images/I/51+YzSyoJNL._SL500_.jpg",
                asin: "B00V5HMFZM",
                price: "¥1,218"
            },
            {
                name: "リンレイ オール床クリーナー 500ml",
                image: "https://m.media-amazon.com/images/I/61BdRBLZOtL._SL500_.jpg",
                asin: "B001F7PPEK",
                price: "¥398"
            },
            {
                name: "ウタマロ クリーナー 400ml",
                image: "https://m.media-amazon.com/images/I/51rn-CkSTXL._SL500_.jpg",
                asin: "B00I0GPWFQ",
                price: "¥385"
            },
            {
                name: "【まとめ買い】 フローリングマジックリン つや出しスプレー 本体+つけかえ用",
                image: "https://m.media-amazon.com/images/I/71Y0Ap1TDTL._SL500_.jpg",
                asin: "B0BZ8S9JGV",
                price: "¥726"
            },
            {
                name: "リンレイ つやピカワックス 500ml",
                image: "https://m.media-amazon.com/images/I/71rMPbL69VL._SL500_.jpg",
                asin: "B0045S63K0",
                price: "¥758"
            }
        ],
        tools: [
            {
                name: "【Amazon.co.jp限定】フローリング ワイパー+マイクロファイバーモップ",
                image: "https://m.media-amazon.com/images/I/71rRKJ7rCWL._SL500_.jpg",
                asin: "B01CXGBL1M",
                price: "¥1,690"
            },
            {
                name: "3M フロアワイパー マイクロファイバー モップ FM-F1J",
                image: "https://m.media-amazon.com/images/I/71hE87ypyKL._SL500_.jpg",
                asin: "B00M9UV8DI",
                price: "¥2,491"
            },
            {
                name: "レック 激落ち フローリング ワイパー 本体 300mm",
                image: "https://m.media-amazon.com/images/I/61J1s-mGJ0L._SL500_.jpg",
                asin: "B00H1AV9EM",
                price: "¥814"
            },
            {
                name: "アズマ工業 モップ 回転モップセット TSM545",
                image: "https://m.media-amazon.com/images/I/61KAjJoHwdL._SL500_.jpg",
                asin: "B00II9M8HO",
                price: "¥3,480"
            },
            {
                name: "山崎産業 フローリングワイパー ぞうきんワイパー",
                image: "https://m.media-amazon.com/images/I/51KR1J9HVPL._SL500_.jpg",
                asin: "B000TGFWE2",
                price: "¥1,027"
            }
        ],
        protections: [
            {
                name: "山善 い草風 PPラグ 江戸間3畳 (176×261cm) ベージュ",
                image: "https://m.media-amazon.com/images/I/81mLQT8D48L._SL500_.jpg",
                asin: "B08G4HTLP3",
                price: "¥3,480"
            },
            {
                name: "レック 床キズ防止フェルト (粘着タイプ) 24個入",
                image: "https://m.media-amazon.com/images/I/51qLf3iM1ZL._SL500_.jpg",
                asin: "B0047TFRQC",
                price: "¥328"
            },
            {
                name: "3M 床保護フィルム 1100mm×20m",
                image: "https://m.media-amazon.com/images/I/41r9K3q8yUL._SL500_.jpg",
                asin: "B08G89GVZ7",
                price: "¥19,800"
            },
            {
                name: "ニチバン 養生用布粘着テープ No.103 50mm×25m 黄土",
                image: "https://m.media-amazon.com/images/I/71OGmE3EGCL._SL500_.jpg",
                asin: "B001W2P6QQ",
                price: "¥418"
            },
            {
                name: "YUMEMIRU 椅子脚カバー 16個入り シリコン製",
                image: "https://m.media-amazon.com/images/I/611Y9VqW9QL._SL500_.jpg",
                asin: "B08CXY5PBV",
                price: "¥999"
            }
        ]
    },
    // Toilet cleaners
    toilet: {
        cleaners: [
            {
                name: "【まとめ買い】トイレマジックリン 消臭・洗浄スプレー ツヤツヤコートプラス エレガントローズの香り 本体 380ml×3個",
                image: "https://m.media-amazon.com/images/I/71fNAEJRxZL._SL500_.jpg",
                asin: "B08TQB46YT",
                price: "¥1,066"
            },
            {
                name: "サンポール トイレ洗剤 尿石除去 1000mL×3本",
                image: "https://m.media-amazon.com/images/I/612o1Vq+APL._SL500_.jpg",
                asin: "B08BFK3X5G",
                price: "¥1,040"
            },
            {
                name: "【Amazon.co.jp限定】【まとめ買い】 スクラビングバブル トイレ洗剤 超強力トイレクリーナー 400g×3本",
                image: "https://m.media-amazon.com/images/I/81n8W-CeOWL._SL500_.jpg",
                asin: "B07Q3RMSH3",
                price: "¥598"
            },
            {
                name: "ドメスト 除菌クリーナー 500mL",
                image: "https://m.media-amazon.com/images/I/61lE9u9T5QL._SL500_.jpg",
                asin: "B07539ZYSL",
                price: "¥268"
            },
            {
                name: "ルック まめピカ 抗菌プラス トイレのふき取りクリーナー 210ml×3個",
                image: "https://m.media-amazon.com/images/I/71-2l-sR88L._SL500_.jpg",
                asin: "B08X4ZHRJS",
                price: "¥797"
            }
        ],
        tools: [
            {
                name: "スコッチブライト トイレクリーナー 本体ハンドル＋リフィル4個 洗剤付 取り替え式",
                image: "https://m.media-amazon.com/images/I/71pvh8nKZtL._SL500_.jpg",
                asin: "B0849PFL9M",
                price: "¥965"
            },
            {
                name: "【ケース販売】 スコッチブライト トイレクリーナー リフィル 10個",
                image: "https://m.media-amazon.com/images/I/715xLyiUKhL._SL500_.jpg",
                asin: "B08492W1MW",
                price: "¥858"
            },
            {
                name: "マーナ (MARNA) トイレブラシ ホワイト W071W",
                image: "https://m.media-amazon.com/images/I/61kdRAU-xnL._SL500_.jpg",
                asin: "B004XIK568",
                price: "¥658"
            },
            {
                name: "山崎産業 トイレ 掃除 ケース付き トイレブラシ 白",
                image: "https://m.media-amazon.com/images/I/61E2eQ6kLsL._SL500_.jpg",
                asin: "B000UESD1E",
                price: "¥453"
            },
            {
                name: "トイレクイックル ニオイ予防プラス トイレ用掃除シート エレガントローズの香り 本体 8枚×16個",
                image: "https://m.media-amazon.com/images/I/81MQNv-xOiL._SL500_.jpg",
                asin: "B0CNNZXQWK",
                price: "¥4,125"
            }
        ],
        protections: [
            {
                name: "ダンロップ ホームプロダクツ ゴム手袋 天然ゴム 薄手 L ブルー",
                image: "https://m.media-amazon.com/images/I/51b1oPeC5LL._SL500_.jpg",
                asin: "B0047TFSGG",
                price: "¥187"
            },
            {
                name: "【大容量】トイレマジックリン 消臭・洗浄スプレー ツヤツヤコートプラス エレガントローズの香り 詰め替え 820ml(約2.2倍)",
                image: "https://m.media-amazon.com/images/I/61g7i8gWFPL._SL500_.jpg",
                asin: "B08TQCGRVC",
                price: "¥518"
            },
            {
                name: "【まとめ買い】トイレの消臭元スプレー 消臭芳香剤 トイレ用 アップルブロッサム 280ml×3個",
                image: "https://m.media-amazon.com/images/I/71W2QNwdT5L._SL500_.jpg",
                asin: "B074MG9X8C",
                price: "¥994"
            },
            {
                name: "【まとめ買い】 置き型ファブリーズ 芳香剤 お部屋用 トイレ用 さわやかスカイシャワー 130g × 3個",
                image: "https://m.media-amazon.com/images/I/81JXG9rpojL._SL500_.jpg",
                asin: "B07S7QYDNX",
                price: "¥943"
            },
            {
                name: "東和産業 トイレ シート 床 保護 透明 マット クリア 60cm×80cm",
                image: "https://m.media-amazon.com/images/I/61KQxWMAzbL._SL500_.jpg",
                asin: "B09N3F39D9",
                price: "¥1,980"
            }
        ]
    },
    // Living room cleaners
    living: {
        cleaners: [
            {
                name: "【まとめ買い】リビングマジックリン つけかえ用 400ml×3個",
                image: "https://m.media-amazon.com/images/I/71z7mKCGNPL._SL500_.jpg",
                asin: "B09NR5L1PM",
                price: "¥660"
            },
            {
                name: "激落ちくん GNお徳用 S-691 メラミンスポンジ 小 30個入",
                image: "https://m.media-amazon.com/images/I/71uSP6m2ywL._SL500_.jpg",
                asin: "B001GI5BI0",
                price: "¥348"
            },
            {
                name: "【Amazon.co.jp限定】ウタマロ クリーナー 400ml 2個セット",
                image: "https://m.media-amazon.com/images/I/51qhBNhHmLL._SL500_.jpg",
                asin: "B08L5MZ22N",
                price: "¥798"
            },
            {
                name: "【まとめ買い】ガラスマジックリン ガラス用洗剤 スプレー 本体 400ml + つけかえ用 350ml×2個",
                image: "https://m.media-amazon.com/images/I/71v7nKXbp6L._SL500_.jpg",
                asin: "B077PDGKQM",
                price: "¥858"
            },
            {
                name: "激落ちくん 重曹 粉末タイプ 1kg",
                image: "https://m.media-amazon.com/images/I/61yaDTJhJnL._SL500_.jpg",
                asin: "B001TM6S8M",
                price: "¥298"
            }
        ],
        tools: [
            {
                name: "無印良品 掃除用品システム・マイクロファイバーハンディモップ",
                image: "https://m.media-amazon.com/images/I/41l5OKzOBJL._SL500_.jpg",
                asin: "B08T5X8QNZ",
                price: "¥790"
            },
            {
                name: "クイックルワイパー ハンディ 伸び縮みタイプ 本体",
                image: "https://m.media-amazon.com/images/I/719g3g5cZ7L._SL500_.jpg",
                asin: "B001RAKU1A",
                price: "¥736"
            },
            {
                name: "エレコム クリーニングブラシ ほこり取り 除電ブラシ KBR-AM014AS",
                image: "https://m.media-amazon.com/images/I/71rvxCzYu0L._SL500_.jpg",
                asin: "B01DN6RZ8O",
                price: "¥920"
            },
            {
                name: "【Amazon.co.jp限定】アイリスオーヤマ ハンディクリーナー 掃除機 コードレス IC-H50-B",
                image: "https://m.media-amazon.com/images/I/51xsHFVH0eL._SL500_.jpg",
                asin: "B07PD9WQR9",
                price: "¥4,980"
            },
            {
                name: "山崎産業 掃除道具 ちりとり チリトリ ポリプロピレン",
                image: "https://m.media-amazon.com/images/I/71bA0LIqXML._SL500_.jpg",
                asin: "B00GU5JT0G",
                price: "¥165"
            }
        ],
        protections: [
            {
                name: "イケヒコ・コーポレーション い草風 上敷き PPカーペット 江戸間4.5畳 グリーン #1109904",
                image: "https://m.media-amazon.com/images/I/811tJdnN9YL._SL500_.jpg",
                asin: "B07D4DLLG8",
                price: "¥3,980"
            },
            {
                name: "【6枚入り】吸着マット 撥水 おくだけ吸着 ペット用 45×60cm ずれない",
                image: "https://m.media-amazon.com/images/I/71Ly-YdFNQL._SL500_.jpg",
                asin: "B08DHJKPNM",
                price: "¥3,480"
            },
            {
                name: "サンコー おくだけ吸着 撥水タイルマット 30×30cm 同色20枚入",
                image: "https://m.media-amazon.com/images/I/61qWfhz7-mL._SL500_.jpg",
                asin: "B08BZ36HDW",
                price: "¥3,636"
            },
            {
                name: "明和グラビア 防水シート トイレ 床 保護 90cm×300cm BKTP-9030",
                image: "https://m.media-amazon.com/images/I/71b3XU4pILL._SL500_.jpg",
                asin: "B08CXP8LQD",
                price: "¥2,636"
            },
            {
                name: "【Amazon.co.jp限定】チリトリ付きほうき 掃除セット",
                image: "https://m.media-amazon.com/images/I/71n2xGLjn3L._SL500_.jpg",
                asin: "B07RP5WDYH",
                price: "¥1,480"
            }
        ]
    },
    // Window cleaners
    window: {
        cleaners: [
            {
                name: "ガラスマジックリン ガラス用洗剤 スプレー 本体 400ml",
                image: "https://m.media-amazon.com/images/I/61Zws4YivhL._SL500_.jpg",
                asin: "B00INXBXM8",
                price: "¥268"
            },
            {
                name: "激落ちくん ガラス & 鏡 の 激落ちシート 15枚入",
                image: "https://m.media-amazon.com/images/I/71mZr1RPJYL._SL500_.jpg",
                asin: "B003BLQNPS",
                price: "¥183"
            },
            {
                name: "ウタマロ クリーナー 400ml",
                image: "https://m.media-amazon.com/images/I/51rn-CkSTXL._SL500_.jpg",
                asin: "B00I0GPWFQ",
                price: "¥385"
            },
            {
                name: "WHOOSHI! スクリーンクリーナー 500ml + マイクロファイバークロス",
                image: "https://m.media-amazon.com/images/I/61P-zD0qozL._SL500_.jpg",
                asin: "B07P8NG8YT",
                price: "¥1,880"
            },
            {
                name: "純閃堂 アルカリ電解水クリーナー 500ml",
                image: "https://m.media-amazon.com/images/I/51X6kzFQxQL._SL500_.jpg",
                asin: "B08KGSJZQB",
                price: "¥968"
            }
        ],
        tools: [
            {
                name: "Ettore(エトレ) スクイジー 真鍮 35cm プロ用",
                image: "https://m.media-amazon.com/images/I/61YMnCYJOXL._SL500_.jpg",
                asin: "B00004OCIP",
                price: "¥2,890"
            },
            {
                name: "山崎産業 清掃用品 窓 ガラス ワイパー グラスワイパー",
                image: "https://m.media-amazon.com/images/I/51pScYBqhQL._SL500_.jpg",
                asin: "B01M0QJLTC",
                price: "¥1,190"
            },
            {
                name: "テラモト ガラスワイパー 40cm",
                image: "https://m.media-amazon.com/images/I/41qcnXoJWFL._SL500_.jpg",
                asin: "B0047TFS4O",
                price: "¥1,590"
            },
            {
                name: "【10枚入り】マイクロファイバークロス 吸水 速乾 掃除",
                image: "https://m.media-amazon.com/images/I/71tg3J3OdrL._SL500_.jpg",
                asin: "B088TSJK2G",
                price: "¥999"
            },
            {
                name: "アズマ 窓・網戸 楽絞りワイパー AZ350",
                image: "https://m.media-amazon.com/images/I/71VQh37n5mL._SL500_.jpg",
                asin: "B01739R5QC",
                price: "¥2,180"
            }
        ],
        protections: [
            {
                name: "激落ちくん 鏡のウロコ取り ダイヤモンド",
                image: "https://m.media-amazon.com/images/I/71MQo0nFdLL._SL500_.jpg",
                asin: "B07H3JWDQW",
                price: "¥748"
            },
            {
                name: "東プレ マグネット窓用断熱シート L 水貼り",
                image: "https://m.media-amazon.com/images/I/715g3tZ0PBL._SL500_.jpg",
                asin: "B08JTYTW8K",
                price: "¥1,980"
            },
            {
                name: "ニトムズ 窓ガラス 透明断熱フィルム E0590",
                image: "https://m.media-amazon.com/images/I/61dHBGW2kjL._SL500_.jpg",
                asin: "B00FP86EYS",
                price: "¥1,298"
            },
            {
                name: "【Amazon.co.jp限定】 3M ガラスフィルム 窓 遮熱 90×180cm",
                image: "https://m.media-amazon.com/images/I/61X6KvAZsxL._SL500_.jpg",
                asin: "B087XB5RBD",
                price: "¥3,280"
            },
            {
                name: "セメダイン すきまテープ TP-522 グレー 2巻パック",
                image: "https://m.media-amazon.com/images/I/71U0fT9n6ZL._SL500_.jpg",
                asin: "B001WADDG4",
                price: "¥358"
            }
        ]
    },
    // Kitchen cleaners (generic, not IH)
    kitchen: {
        cleaners: [
            {
                name: "【大容量】キッチンマジックリン 台所用洗剤 スプレー 本体 400ml",
                image: "https://m.media-amazon.com/images/I/61tBAOJeORL._SL500_.jpg",
                asin: "B00IOJCJHU",
                price: "¥278"
            },
            {
                name: "ジョイ W除菌 食器用洗剤 逆さボトル 本体 290ml",
                image: "https://m.media-amazon.com/images/I/51JvdRB9BgL._SL500_.jpg",
                asin: "B0848N5KXR",
                price: "¥174"
            },
            {
                name: "激落ちくん 重曹 + アルカリ電解水 クリーナー 400ml×3本",
                image: "https://m.media-amazon.com/images/I/71gUIXW6qRL._SL500_.jpg",
                asin: "B07FNN5PSJ",
                price: "¥594"
            },
            {
                name: "茂木和哉 キッチン用 キッチンクリーナー 380ml",
                image: "https://m.media-amazon.com/images/I/613QJP7eXuL._SL500_.jpg",
                asin: "B08HVQGXRB",
                price: "¥770"
            },
            {
                name: "ウタマロ キッチン 本体 300ml",
                image: "https://m.media-amazon.com/images/I/61wFbArqSxL._SL500_.jpg",
                asin: "B01A9RAWNO",
                price: "¥358"
            }
        ],
        tools: [
            {
                name: "【Amazon.co.jp限定】3M スポンジ キッチン スコッチブライト 12個",
                image: "https://m.media-amazon.com/images/I/71v5EYpO1bL._SL500_.jpg",
                asin: "B00N3LYSNO",
                price: "¥748"
            },
            {
                name: "激落ちくん メラミンスポンジ S-121 (2個入×20袋セット)",
                image: "https://m.media-amazon.com/images/I/71kgZRhJsWL._SL500_.jpg",
                asin: "B084G9TRXT",
                price: "¥999"
            },
            {
                name: "オーエ キッチン ブラシ 3個組",
                image: "https://m.media-amazon.com/images/I/71J0Vei1VpL._SL500_.jpg",
                asin: "B00T0N2UY4",
                price: "¥396"
            },
            {
                name: "パックスナチュロン キッチンスポンジ ナチュラル",
                image: "https://m.media-amazon.com/images/I/81n+1kxKczL._SL500_.jpg",
                asin: "B002ASDMKE",
                price: "¥308"
            },
            {
                name: "亀の子 キッチンスポンジ Do Natural 3個入",
                image: "https://m.media-amazon.com/images/I/81PrWdayReL._SL500_.jpg",
                asin: "B0047TFR3A",
                price: "¥385"
            }
        ],
        protections: [
            {
                name: "ショーワグローブ ナイスハンド ミュー 薄手 M ピンク",
                image: "https://m.media-amazon.com/images/I/71LcQBH0SLL._SL500_.jpg",
                asin: "B0047TFSU6",
                price: "¥194"
            },
            {
                name: "レンジフードフィルター 12枚 (297×340mm)",
                image: "https://m.media-amazon.com/images/I/81aDWwRbDTL._SL500_.jpg",
                asin: "B08L3ZHQNN",
                price: "¥1,199"
            },
            {
                name: "東洋アルミ IHマット NEZU 1枚入 IH ガラストップ用保護マット",
                image: "https://m.media-amazon.com/images/I/51TDHS6Xr5L._SL500_.jpg",
                asin: "B08Y89CL5D",
                price: "¥1,580"
            },
            {
                name: "東洋アルミ キッチン壁用汚れ防止シート 3面パック",
                image: "https://m.media-amazon.com/images/I/71E+qQAUQcL._SL500_.jpg",
                asin: "B07NQH8N1Q",
                price: "¥798"
            },
            {
                name: "レック セスキの激落ちくんシート キッチン用 (15×20cm) 20枚入×3個",
                image: "https://m.media-amazon.com/images/I/71eSH5NnDQL._SL500_.jpg",
                asin: "B07RVY8BNS",
                price: "¥407"
            }
        ]
    }
};

// Function to get the appropriate product template based on location
function getProductTemplate(location, type) {
    // Map locations to categories
    const locationMap = {
        'bathtub': 'bathroom',
        'drain': 'bathroom',
        'shower': 'bathroom',
        'toilet': 'bathroom',
        'ventilation': 'bathroom',
        'washstand': 'bathroom',
        'carpet': 'floor',
        'flooring': 'floor',
        'tatami': 'floor',
        'tile': 'floor',
        'sofa': 'living',
        'table': 'living',
        'wall': 'living',
        'glass': 'window',
        'sash': 'window',
        'gas': 'kitchen',
        'sink': 'kitchen',
        'ih': 'kitchen'
    };

    // Special handling for toilet directory
    if (location === 'floor' && type.includes('toilet')) {
        return productTemplates.toilet;
    } else if (location === 'toilet' && type.includes('toilet')) {
        return productTemplates.toilet;
    }

    // Find the category based on location
    for (const [key, category] of Object.entries(locationMap)) {
        if (type.includes(key)) {
            return productTemplates[category];
        }
    }

    // Default fallback
    return productTemplates.bathroom;
}

// Function to generate product HTML
function generateProductHTML(product) {
    return `    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x200?text=商品画像'">
        <h4>${product.name}</h4>
        <div class="product-rating">
            <span class="stars">★4.3</span>
            <span class="review-count">(1,234)</span>
        </div>
        <p class="price">${product.price}</p>
        <a href="https://www.amazon.co.jp/dp/${product.asin}?tag=asdfghj12-22" 
           target="_blank" rel="nofollow noopener" class="buy-button">
            Amazonで購入
        </a>
    </div>`;
}

// Function to generate the complete product section
function generateProductSection(template) {
    let html = `                                                                <div class="section">
            <h2>おすすめ商品</h2>
            <h3>洗剤・クリーナー</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;

    // Add cleaners
    template.cleaners.forEach(product => {
        html += generateProductHTML(product) + '\n';
    });

    html += `                </div>
            </div>
            <h3>掃除道具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;

    // Add tools
    template.tools.forEach(product => {
        html += generateProductHTML(product) + '\n';
    });

    html += `                </div>
            </div>
            <h3>保護具</h3>
            <div class="product-grid">
                <div class="product-grid-inner">
`;

    // Add protections
    template.protections.forEach(product => {
        html += generateProductHTML(product) + '\n';
    });

    html += `                </div>
            </div>
        </div>`;

    return html;
}

// Function to process a single HTML file
function processHTMLFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip ih-heavy.html in kitchen directory
    if (filePath.includes('kitchen/ih-heavy.html')) {
        console.log('Skipping kitchen/ih-heavy.html (reference file)');
        return;
    }
    
    // Extract location and type from file path
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const directory = pathParts[pathParts.length - 2];
    const type = fileName.replace('.html', '');
    
    // Get appropriate product template
    const template = getProductTemplate(directory, type);
    
    // Generate new product section
    const newProductSection = generateProductSection(template);
    
    // Find and replace the product section
    const productSectionStart = content.indexOf('<div class="section">\n            <h2>おすすめ商品</h2>');
    if (productSectionStart === -1) {
        console.log(`No product section found in ${filePath}`);
        return;
    }
    
    // Find the end of the product section
    let sectionCount = 0;
    let currentPos = productSectionStart;
    let productSectionEnd = -1;
    
    while (currentPos < content.length) {
        if (content.substr(currentPos, 19) === '<div class="section') {
            sectionCount++;
        } else if (content.substr(currentPos, 6) === '</div>') {
            sectionCount--;
            if (sectionCount === 0) {
                productSectionEnd = currentPos + 6;
                break;
            }
        }
        currentPos++;
    }
    
    if (productSectionEnd === -1) {
        console.log(`Could not find end of product section in ${filePath}`);
        return;
    }
    
    // Remove any "必要な掃除アイテム" section if it exists
    const itemSectionStart = content.indexOf('<div class="section">\n            <h2>必要な掃除アイテム</h2>');
    if (itemSectionStart !== -1) {
        // Find the end of this section
        let itemSectionEnd = content.indexOf('</div>', itemSectionStart) + 6;
        if (itemSectionEnd > itemSectionStart) {
            content = content.substring(0, itemSectionStart) + content.substring(itemSectionEnd);
            // Recalculate product section positions
            if (itemSectionStart < productSectionStart) {
                const diff = itemSectionEnd - itemSectionStart;
                productSectionStart -= diff;
                productSectionEnd -= diff;
            }
        }
    }
    
    // Replace the product section
    content = content.substring(0, productSectionStart) + 
              newProductSection + 
              content.substring(productSectionEnd);
    
    // Write the updated content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
}

// Main function
function main() {
    const directories = ['bathroom', 'floor', 'kitchen', 'living', 'toilet', 'window'];
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        
        // Process all HTML files in the directory
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.endsWith('.html') && !file.includes('index.html')) {
                const filePath = path.join(dirPath, file);
                processHTMLFile(filePath);
            }
        });
    });
    
    console.log('All files processed successfully!');
}

// Run the script
main();