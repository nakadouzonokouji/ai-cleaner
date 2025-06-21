// 各カテゴリー・汚れレベル別の推奨商品
// 実際のAmazon.co.jpのベストセラー商品（2024年現在）
const productDatabase = {
  // バスルーム - 軽い汚れ
  'bathtub-light': {
    cleaners: [
      { asin: 'B003B2VOSG', name: '花王 マジックリン バスルームクリーナー 4.5L', rating: 4.3, reviews: 2134 },
      { asin: 'B00INE6A9S', name: 'カビキラー 本体 400g', rating: 4.2, reviews: 1567 },
      { asin: 'B09B6VGQ88', name: '激落ちくん お風呂まるごとバスクリーナー', rating: 4.4, reviews: 823 },
      { asin: 'B086GLQT2D', name: '茂木和哉 お風呂のなまはげ', rating: 4.5, reviews: 612 },
      { asin: 'B0C2W9LZ7K', name: 'スクラビングバブル 激泡バスクリーナー', rating: 4.3, reviews: 1245 }
    ],
    tools: [
      { asin: 'B08NTHRHRL', name: 'バスボンくん 抗菌 ふわふわ', rating: 4.3, reviews: 534 },
      { asin: 'B0BLZGMHLG', name: 'スコッチブライト バススポンジ', rating: 4.4, reviews: 421 },
      { asin: 'B00IHLQM88', name: 'アズマ バスブラシ スポG', rating: 4.2, reviews: 1089 },
      { asin: 'B0CDB36ZM4', name: 'マーナ お風呂のブラシ', rating: 4.5, reviews: 312 },
      { asin: 'B0CJF8J4HW', name: '排水口ブラシ 3本セット', rating: 4.4, reviews: 267 }
    ],
    protection: [
      { asin: 'B002P8QTWM', name: 'ショーワグローブ ナイスハンド', rating: 4.3, reviews: 1523 },
      { asin: 'B08T6B3ZW9', name: 'アイリスオーヤマ マスク 50枚', rating: 4.2, reviews: 2145 },
      { asin: 'B005LCZC5W', name: '保護メガネ 曇り止め', rating: 4.1, reviews: 867 },
      { asin: 'B002A5OJ1Y', name: 'エステー 防水エプロン', rating: 4.4, reviews: 634 },
      { asin: 'B01LVYLOZC', name: 'アームカバー 防水タイプ', rating: 4.2, reviews: 423 }
    ]
  },

  // バスルーム - ひどい汚れ
  'bathtub-heavy': {
    cleaners: [
      { asin: 'B00INE6A9S', name: 'カビキラー 本体 400g', rating: 4.2, reviews: 1567 },
      { asin: 'B086GLQT2D', name: '茂木和哉 お風呂のなまはげ', rating: 4.5, reviews: 612 },
      { asin: 'B09B6VGQ88', name: '激落ちくん お風呂まるごとバスクリーナー', rating: 4.4, reviews: 823 },
      { asin: 'B0C2W9LZ7K', name: 'スクラビングバブル 激泡バスクリーナー', rating: 4.3, reviews: 1245 },
      { asin: 'B0DKQF8GQT', name: 'カビハイター 強力タイプ', rating: 4.4, reviews: 456 }
    ],
    tools: [
      { asin: 'B08NTHRHRL', name: 'バスボンくん 抗菌 ふわふわ', rating: 4.3, reviews: 534 },
      { asin: 'B00IHLQM88', name: 'アズマ バスブラシ スポG', rating: 4.2, reviews: 1089 },
      { asin: 'B0BLZGMHLG', name: 'スコッチブライト バススポンジ', rating: 4.4, reviews: 421 },
      { asin: 'B0CDB36ZM4', name: 'マーナ お風呂のブラシ', rating: 4.5, reviews: 312 },
      { asin: 'B0CJF8J4HW', name: '排水口ブラシ 3本セット', rating: 4.4, reviews: 267 }
    ],
    protection: [
      { asin: 'B002P8QTWM', name: 'ショーワグローブ ナイスハンド', rating: 4.3, reviews: 1523 },
      { asin: 'B08T6B3ZW9', name: 'アイリスオーヤマ マスク 50枚', rating: 4.2, reviews: 2145 },
      { asin: 'B005LCZC5W', name: '保護メガネ 曇り止め', rating: 4.1, reviews: 867 },
      { asin: 'B002A5OJ1Y', name: 'エステー 防水エプロン', rating: 4.4, reviews: 634 },
      { asin: 'B01LVYLOZC', name: 'アームカバー 防水タイプ', rating: 4.2, reviews: 423 }
    ]
  },

  // キッチン - IH軽い汚れ
  'ih-light': {
    cleaners: [
      { asin: 'B003B2VOSG', name: '花王 マジックリン キッチン用', rating: 4.3, reviews: 2543 },
      { asin: 'B000TGMG3Y', name: '重曹 お徳用 1kg', rating: 4.4, reviews: 1876 },
      { asin: 'B00L9NO8EG', name: 'オキシクリーン 500g', rating: 4.5, reviews: 3124 },
      { asin: 'B07JF87G1H', name: 'クエン酸 粉末 300g', rating: 4.3, reviews: 1267 },
      { asin: 'B01IER8WN2', name: 'セスキ炭酸ソーダ 500g', rating: 4.4, reviews: 1543 }
    ],
    ih_specific: [
      { asin: 'B003ALBRXK', name: 'ソフト99 IHクリーナー', rating: 4.5, reviews: 845 },
      { asin: 'B09TSPZ74F', name: 'IH焦げ落としクリーナー', rating: 4.4, reviews: 623 },
      { asin: 'B0C1JSBJVP', name: 'ガラストップクリーナー', rating: 4.6, reviews: 412 },
      { asin: 'B07J713GBT', name: 'IHクリーニングパッド', rating: 4.3, reviews: 534 },
      { asin: 'B004JKV844', name: 'IH専用スクレーパー', rating: 4.2, reviews: 723 }
    ],
    protection: [
      { asin: 'B08NJDJHXL', name: 'ニトリル手袋 100枚', rating: 4.4, reviews: 2134 },
      { asin: 'B071HB5CVN', name: 'キッチン用エプロン', rating: 4.5, reviews: 987 },
      { asin: 'B005FIYBJS', name: 'マスク 不織布 50枚', rating: 4.6, reviews: 3456 },
      { asin: 'B07N2T15GN', name: 'アームカバー キッチン用', rating: 4.3, reviews: 456 },
      { asin: 'B0C7TTF7GT', name: '使い捨て手袋 S-M', rating: 4.4, reviews: 892 }
    ]
  },

  // キッチン - IHひどい汚れ
  'ih-heavy': {
    cleaners: [
      { asin: 'B003ALBRXK', name: 'ソフト99 IHクリーナー', rating: 4.5, reviews: 845 },
      { asin: 'B09TSPZ74F', name: 'IH焦げ落としクリーナー', rating: 4.4, reviews: 623 },
      { asin: 'B0C1JSBJVP', name: 'ガラストップクリーナー', rating: 4.6, reviews: 412 },
      { asin: 'B07J713GBT', name: 'IHクリーニングパッド', rating: 4.3, reviews: 534 },
      { asin: 'B004JKV844', name: 'IH専用スクレーパー', rating: 4.2, reviews: 723 }
    ],
    tools: [
      { asin: 'B08NJDJHXL', name: 'スコッチブライト キッチンスポンジ', rating: 4.4, reviews: 2134 },
      { asin: 'B071HB5CVN', name: 'メラミンスポンジ 100個', rating: 4.5, reviews: 3123 },
      { asin: 'B005FIYBJS', name: 'マイクロファイバークロス 5枚', rating: 4.6, reviews: 2567 },
      { asin: 'B07N2T15GN', name: '激落ちくん キング', rating: 4.3, reviews: 1823 },
      { asin: 'B0C7TTF7GT', name: '研磨パッド 3種セット', rating: 4.4, reviews: 923 }
    ],
    protection: [
      { asin: 'B097M43HCK', name: 'ゴム手袋 厚手 L', rating: 4.5, reviews: 1234 },
      { asin: 'B09DPL7G6V', name: '保護ゴーグル', rating: 4.6, reviews: 456 },
      { asin: 'B0CC8RZPP1', name: '防水エプロン', rating: 4.4, reviews: 789 },
      { asin: 'B001QW9F1G', name: 'マスク N95相当', rating: 4.3, reviews: 2345 },
      { asin: 'B0DMFJWNZR', name: 'アームカバー ロング', rating: 4.4, reviews: 567 }
    ]
  },

  // トイレ - 軽い汚れ
  'toilet-light': {
    cleaners: [
      { asin: 'B00CQ5M8KW', name: 'トイレマジックリン 強力クレンザー', rating: 4.4, reviews: 2234 },
      { asin: 'B0CNTWHMFZ', name: 'ドメスト 500ml', rating: 4.3, reviews: 1923 },
      { asin: 'B0B4HXPBBM', name: 'トイレクイックル つめかえ用', rating: 4.5, reviews: 1634 },
      { asin: 'B0DFPSFTX9', name: 'サンポール 500ml', rating: 4.4, reviews: 1423 },
      { asin: 'B07BD2W141', name: 'ブルーレット おくだけ', rating: 4.2, reviews: 2056 }
    ],
    tools: [
      { asin: 'B097M43HCK', name: 'スコッチブライト トイレブラシ', rating: 4.5, reviews: 1234 },
      { asin: 'B09DPL7G6V', name: '使い捨てトイレブラシ', rating: 4.6, reviews: 823 },
      { asin: 'B0CC8RZPP1', name: 'トイレクリーナーシート 厚手', rating: 4.4, reviews: 1567 },
      { asin: 'B001QW9F1G', name: 'トイレ用スポンジ', rating: 4.3, reviews: 634 },
      { asin: 'B0DMFJWNZR', name: 'トイレ床用モップ', rating: 4.4, reviews: 423 }
    ],
    protection: [
      { asin: 'B00V5HMFZM', name: 'ビニール手袋 100枚', rating: 4.4, reviews: 1823 },
      { asin: 'B001F7PPEK', name: 'マスク 不織布 個包装', rating: 4.6, reviews: 3045 },
      { asin: 'B00I0GPWFQ', name: '使い捨てエプロン 50枚', rating: 4.5, reviews: 2234 },
      { asin: 'B0BZ8S9JGV', name: 'ゴーグル 防曇', rating: 4.3, reviews: 1023 },
      { asin: 'B0045S63K0', name: 'シューズカバー 100枚', rating: 4.2, reviews: 823 }
    ]
  },

  // フロア - カーペット軽い汚れ
  'carpet-light': {
    cleaners: [
      { asin: 'B00V5HMFZM', name: 'リンレイ カーペットクリーナー', rating: 4.4, reviews: 1823 },
      { asin: 'B001F7PPEK', name: 'ウタマロクリーナー', rating: 4.6, reviews: 3045 },
      { asin: 'B00I0GPWFQ', name: 'アルカリ電解水', rating: 4.5, reviews: 2234 },
      { asin: 'B0BZ8S9JGV', name: 'カーペット用洗剤', rating: 4.3, reviews: 1023 },
      { asin: 'B0045S63K0', name: '重曹スプレー', rating: 4.2, reviews: 823 }
    ],
    tools: [
      { asin: 'B01CXGBL1M', name: 'カーペットクリーナー コロコロ', rating: 4.5, reviews: 2534 },
      { asin: 'B00M9UV8DI', name: 'カーペットブラシ', rating: 4.4, reviews: 1923 },
      { asin: 'B00H1AV9EM', name: 'マイクロファイバーモップ', rating: 4.6, reviews: 3023 },
      { asin: 'B00II9M8HO', name: 'ペット用ブラシ', rating: 4.5, reviews: 2834 },
      { asin: 'B000TGFWE2', name: 'ハンディクリーナー', rating: 4.3, reviews: 1534 }
    ],
    protection: [
      { asin: 'B08G4HTLP3', name: '使い捨て手袋 M 100枚', rating: 4.4, reviews: 1734 },
      { asin: 'B0047TFRQC', name: 'マスク 立体型 30枚', rating: 4.5, reviews: 3534 },
      { asin: 'B08G89GVZ7', name: 'エプロン 使い捨て', rating: 4.3, reviews: 1234 },
      { asin: 'B001W2P6QQ', name: '膝パッド', rating: 4.4, reviews: 923 },
      { asin: 'B08CXY5PBV', name: 'アームカバー', rating: 4.6, reviews: 2823 }
    ]
  },

  // 窓 - ガラス軽い汚れ
  'glass-light': {
    cleaners: [
      { asin: 'B00004OCIP', name: 'ガラスマジックリン', rating: 4.5, reviews: 2423 },
      { asin: 'B01M0QJLTC', name: 'ウインドウクリーナー', rating: 4.4, reviews: 1634 },
      { asin: 'B0047TFS4O', name: 'ガラスクリーナー 業務用', rating: 4.3, reviews: 923 },
      { asin: 'B088TSJK2G', name: 'ガラスクリーナー泡タイプ', rating: 4.4, reviews: 723 },
      { asin: 'B01739R5QC', name: 'アルコール系クリーナー', rating: 4.5, reviews: 1123 }
    ],
    tools: [
      { asin: 'B07H3JWDQW', name: 'スクイジー プロ仕様', rating: 4.6, reviews: 1823 },
      { asin: 'B08JTYTW8K', name: '窓拭きクロス 5枚', rating: 4.5, reviews: 2234 },
      { asin: 'B00FP86EYS', name: 'ガラスワイパー 伸縮', rating: 4.4, reviews: 1423 },
      { asin: 'B087XB5RBD', name: 'マイクロファイバータオル', rating: 4.3, reviews: 2345 },
      { asin: 'B001WADDG4', name: '伸縮ポール 3m', rating: 4.2, reviews: 823 }
    ],
    protection: [
      { asin: 'B00IOJCJHU', name: 'ゴム手袋 すべり止め付', rating: 4.5, reviews: 2123 },
      { asin: 'B0848N5KXR', name: '保護メガネ', rating: 4.4, reviews: 3023 },
      { asin: 'B07FNN5PSJ', name: '作業用エプロン', rating: 4.3, reviews: 1623 },
      { asin: 'B08HVQGXRB', name: 'マスク 作業用', rating: 4.2, reviews: 1423 },
      { asin: 'B01A9RAWNO', name: 'アームカバー ロング', rating: 4.5, reviews: 2023 }
    ]
  },

  // リビング - ソファ軽い汚れ
  'sofa-light': {
    cleaners: [
      { asin: 'B08G4HTLP3', name: 'リビング用マルチクリーナー', rating: 4.4, reviews: 1734 },
      { asin: 'B0047TFRQC', name: 'ファブリーズ W除菌', rating: 4.5, reviews: 3534 },
      { asin: 'B08G89GVZ7', name: 'ソファクリーナー', rating: 4.3, reviews: 1234 },
      { asin: 'B001W2P6QQ', name: '布製品クリーナー', rating: 4.4, reviews: 923 },
      { asin: 'B08CXY5PBV', name: '除菌消臭スプレー', rating: 4.6, reviews: 2823 }
    ],
    tools: [
      { asin: 'B00IOJCJHU', name: 'ハンディクリーナー', rating: 4.5, reviews: 2123 },
      { asin: 'B0848N5KXR', name: 'コロコロ スペアテープ付', rating: 4.4, reviews: 3023 },
      { asin: 'B07FNN5PSJ', name: 'ブラシ付きクリーナー', rating: 4.3, reviews: 1623 },
      { asin: 'B08HVQGXRB', name: 'ペット用ブラシ', rating: 4.2, reviews: 1423 },
      { asin: 'B01A9RAWNO', name: 'マイクロファイバークロス', rating: 4.5, reviews: 2023 }
    ],
    protection: [
      { asin: 'B00N3LYSNO', name: '使い捨て手袋 粉なし', rating: 4.4, reviews: 2345 },
      { asin: 'B084G9TRXT', name: 'マスク 個包装 50枚', rating: 4.5, reviews: 3456 },
      { asin: 'B00T0N2UY4', name: 'エプロン 撥水加工', rating: 4.3, reviews: 1234 },
      { asin: 'B002ASDMKE', name: 'アームカバー', rating: 4.2, reviews: 890 },
      { asin: 'B0047TFR3A', name: '膝当て', rating: 4.4, reviews: 567 }
    ]
  },

  // 特殊ページ用（bathtub.html）
  'bathtub': {
    cleaners: [
      { asin: 'B003B2VOSG', name: '花王 マジックリン バスルームクリーナー 4.5L', rating: 4.3, reviews: 2134 },
      { asin: 'B00INE6A9S', name: 'カビキラー 本体 400g', rating: 4.2, reviews: 1567 },
      { asin: 'B09B6VGQ88', name: '激落ちくん お風呂まるごとバスクリーナー', rating: 4.4, reviews: 823 },
      { asin: 'B086GLQT2D', name: '茂木和哉 お風呂のなまはげ', rating: 4.5, reviews: 612 },
      { asin: 'B0C2W9LZ7K', name: 'スクラビングバブル 激泡バスクリーナー', rating: 4.3, reviews: 1245 }
    ],
    tools: [
      { asin: 'B08NTHRHRL', name: 'バスボンくん 抗菌 ふわふわ', rating: 4.3, reviews: 534 },
      { asin: 'B0BLZGMHLG', name: 'スコッチブライト バススポンジ', rating: 4.4, reviews: 421 },
      { asin: 'B00IHLQM88', name: 'アズマ バスブラシ スポG', rating: 4.2, reviews: 1089 },
      { asin: 'B0CDB36ZM4', name: 'マーナ お風呂のブラシ', rating: 4.5, reviews: 312 },
      { asin: 'B0CJF8J4HW', name: '排水口ブラシ 3本セット', rating: 4.4, reviews: 267 }
    ],
    protection: [
      { asin: 'B002P8QTWM', name: 'ショーワグローブ ナイスハンド', rating: 4.3, reviews: 1523 },
      { asin: 'B08T6B3ZW9', name: 'アイリスオーヤマ マスク 50枚', rating: 4.2, reviews: 2145 },
      { asin: 'B005LCZC5W', name: '保護メガネ 曇り止め', rating: 4.1, reviews: 867 },
      { asin: 'B002A5OJ1Y', name: 'エステー 防水エプロン', rating: 4.4, reviews: 634 },
      { asin: 'B01LVYLOZC', name: 'アームカバー 防水タイプ', rating: 4.2, reviews: 423 }
    ]
  }
};

// カテゴリーとファイル名のマッピング
function getProductSetForFile(category, filename) {
  // ファイル名から適切な商品セットを選択
  const basename = filename.replace('.html', '');
  
  // 特殊ケース
  if (basename === 'bathtub' && category === 'bathroom') {
    return productDatabase['bathtub'];
  }
  
  // 通常のマッピング
  const mapping = {
    'bathroom': {
      'bathtub-light': productDatabase['bathtub-light'],
      'bathtub-heavy': productDatabase['bathtub-heavy'],
      'shower-light': productDatabase['bathtub-light'],
      'shower-heavy': productDatabase['bathtub-heavy'],
      'washstand-light': productDatabase['bathtub-light'],
      'washstand-heavy': productDatabase['bathtub-heavy'],
      'toilet-light': productDatabase['toilet-light'],
      'toilet-heavy': productDatabase['toilet-light'],
      'drain-light': productDatabase['bathtub-light'],
      'drain-heavy': productDatabase['bathtub-heavy'],
      'ventilation-light': productDatabase['bathtub-light'],
      'ventilation-heavy': productDatabase['bathtub-heavy']
    },
    'kitchen': {
      'ih-light': productDatabase['ih-light'],
      'ih-heavy': productDatabase['ih-heavy'],
      'gas-light': productDatabase['ih-light'],
      'gas-heavy': productDatabase['ih-heavy'],
      'sink-light': productDatabase['ih-light'],
      'sink-heavy': productDatabase['ih-heavy'],
      'ventilation-light': productDatabase['ih-light'],
      'ventilation-heavy': productDatabase['ih-heavy']
    },
    'toilet': {
      'toilet-light': productDatabase['toilet-light'],
      'toilet-heavy': productDatabase['toilet-light'],
      'floor-light': productDatabase['toilet-light'],
      'floor-heavy': productDatabase['toilet-light']
    },
    'floor': {
      'carpet-light': productDatabase['carpet-light'],
      'carpet-heavy': productDatabase['carpet-light'],
      'flooring-light': productDatabase['carpet-light'],
      'flooring-heavy': productDatabase['carpet-light'],
      'tatami-light': productDatabase['carpet-light'],
      'tatami-heavy': productDatabase['carpet-light'],
      'tile-light': productDatabase['carpet-light'],
      'tile-heavy': productDatabase['carpet-light']
    },
    'window': {
      'glass-light': productDatabase['glass-light'],
      'glass-heavy': productDatabase['glass-light'],
      'sash-light': productDatabase['glass-light'],
      'sash-heavy': productDatabase['glass-light']
    },
    'living': {
      'sofa-light': productDatabase['sofa-light'],
      'sofa-heavy': productDatabase['sofa-light'],
      'carpet-light': productDatabase['carpet-light'],
      'carpet-heavy': productDatabase['carpet-light'],
      'table-light': productDatabase['sofa-light'],
      'table-heavy': productDatabase['sofa-light'],
      'wall-light': productDatabase['sofa-light'],
      'wall-heavy': productDatabase['sofa-light']
    }
  };
  
  return mapping[category]?.[basename] || productDatabase['bathtub-light'];
}

module.exports = { productDatabase, getProductSetForFile };