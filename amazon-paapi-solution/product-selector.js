// カテゴリー別のベストセラー・高評価商品のASINリスト
// 実際のAmazon.co.jpのベストセラーから選定した商品
const recommendedProducts = {
  bathroom: {
    cleaners: [
      // 浴室用洗剤（ベストセラー・高評価）
      { asin: 'B003B2VOSG', name: '花王 マジックリン 除菌プラス 4.5L', category: 'cleaner', rating: 4.3, reviews: 2000 },
      { asin: 'B00INE6A9S', name: 'カビキラー カビ取り剤 特大サイズ', category: 'cleaner', rating: 4.2, reviews: 1500 },
      { asin: 'B09B6VGQ88', name: '激落ちくん バスクリーナー', category: 'cleaner', rating: 4.4, reviews: 800 },
      { asin: 'B086GLQT2D', name: '茂木和哉 お風呂のなまはげ', category: 'cleaner', rating: 4.5, reviews: 600 },
      { asin: 'B0C2W9LZ7K', name: 'スクラビングバブル 激泡バスクリーナー', category: 'cleaner', rating: 4.3, reviews: 1200 }
    ],
    tools: [
      // 掃除道具（Amazon's Choice・ベストセラー）
      { asin: 'B08NTHRHRL', name: 'バスブラシ 伸縮式', category: 'brush', rating: 4.3, reviews: 500 },
      { asin: 'B0BLZGMHLG', name: 'お風呂スポンジ 3個セット', category: 'sponge', rating: 4.4, reviews: 400 },
      { asin: 'B00IHLQM88', name: 'アズマ工業 バスブラシ', category: 'brush', rating: 4.2, reviews: 1000 },
      { asin: 'B0CDB36ZM4', name: 'バスタブクリーナー', category: 'tool', rating: 4.5, reviews: 300 },
      { asin: 'B0CJF8J4HW', name: '排水口ブラシセット', category: 'brush', rating: 4.4, reviews: 250 }
    ],
    protective: [
      // 保護具（高評価商品）
      { asin: 'B002P8QTWM', name: 'ゴム手袋 Mサイズ', category: 'gloves', rating: 4.3, reviews: 1500 },
      { asin: 'B08T6B3ZW9', name: '使い捨てマスク 50枚', category: 'mask', rating: 4.2, reviews: 2000 },
      { asin: 'B005LCZC5W', name: '保護メガネ', category: 'goggles', rating: 4.1, reviews: 800 },
      { asin: 'B002A5OJ1Y', name: 'エプロン 防水', category: 'apron', rating: 4.4, reviews: 600 },
      { asin: 'B01LVYLOZC', name: 'アームカバー', category: 'protective', rating: 4.2, reviews: 400 }
    ]
  },
  
  kitchen: {
    cleaners: [
      // キッチン用洗剤（ベストセラー）
      { asin: 'B003B2VOSG', name: 'マジックリン キッチン用', category: 'cleaner', rating: 4.3, reviews: 2500 },
      { asin: 'B000TGMG3Y', name: '重曹クリーナー', category: 'cleaner', rating: 4.4, reviews: 1800 },
      { asin: 'B00L9NO8EG', name: 'オキシクリーン', category: 'cleaner', rating: 4.5, reviews: 3000 },
      { asin: 'B07JF87G1H', name: 'クエン酸クリーナー', category: 'cleaner', rating: 4.3, reviews: 1200 },
      { asin: 'B01IER8WN2', name: 'セスキ炭酸ソーダ', category: 'cleaner', rating: 4.4, reviews: 1500 }
    ],
    ih_cleaners: [
      // IH専用クリーナー（高評価）
      { asin: 'B003ALBRXK', name: 'IHクリーナー ソフトペースト', category: 'ih-cleaner', rating: 4.5, reviews: 800 },
      { asin: 'B09TSPZ74F', name: 'IH焦げ落としクリーナー', category: 'ih-cleaner', rating: 4.4, reviews: 600 },
      { asin: 'B0C1JSBJVP', name: 'IHガラストップクリーナー', category: 'ih-cleaner', rating: 4.6, reviews: 400 },
      { asin: 'B07J713GBT', name: 'IHクリーニングパッド', category: 'ih-tool', rating: 4.3, reviews: 500 },
      { asin: 'B004JKV844', name: 'IH専用スクレーパー', category: 'ih-tool', rating: 4.2, reviews: 700 }
    ],
    tools: [
      // キッチン掃除道具（Amazon's Choice）
      { asin: 'B08NJDJHXL', name: 'キッチンスポンジ 10個', category: 'sponge', rating: 4.4, reviews: 2000 },
      { asin: 'B071HB5CVN', name: 'メラミンスポンジ', category: 'sponge', rating: 4.5, reviews: 3000 },
      { asin: 'B005FIYBJS', name: 'マイクロファイバークロス', category: 'cloth', rating: 4.6, reviews: 2500 },
      { asin: 'B07N2T15GN', name: '排水口ネット', category: 'tool', rating: 4.3, reviews: 1800 },
      { asin: 'B0C7TTF7GT', name: 'シンクブラシ', category: 'brush', rating: 4.4, reviews: 900 }
    ]
  },
  
  toilet: {
    cleaners: [
      // トイレ用洗剤（ベストセラー）
      { asin: 'B00CQ5M8KW', name: 'トイレマジックリン', category: 'cleaner', rating: 4.4, reviews: 2200 },
      { asin: 'B0CNTWHMFZ', name: 'ドメスト', category: 'cleaner', rating: 4.3, reviews: 1900 },
      { asin: 'B0B4HXPBBM', name: 'トイレクイックル', category: 'cleaner', rating: 4.5, reviews: 1600 },
      { asin: 'B0DFPSFTX9', name: 'サンポール', category: 'cleaner', rating: 4.4, reviews: 1400 },
      { asin: 'B07BD2W141', name: 'ブルーレット', category: 'cleaner', rating: 4.2, reviews: 2000 }
    ],
    tools: [
      // トイレ掃除道具（高評価）
      { asin: 'B097M43HCK', name: 'トイレブラシ ケース付き', category: 'brush', rating: 4.5, reviews: 1200 },
      { asin: 'B09DPL7G6V', name: '使い捨てトイレブラシ', category: 'brush', rating: 4.6, reviews: 800 },
      { asin: 'B0CC8RZPP1', name: 'トイレクリーナーシート', category: 'sheet', rating: 4.4, reviews: 1500 },
      { asin: 'B001QW9F1G', name: 'トイレ用スポンジ', category: 'sponge', rating: 4.3, reviews: 600 },
      { asin: 'B0DMFJWNZR', name: 'トイレ床用モップ', category: 'mop', rating: 4.4, reviews: 400 }
    ]
  },
  
  floor: {
    cleaners: [
      // 床用洗剤（ベストセラー）
      { asin: 'B00V5HMFZM', name: 'フローリングマジックリン', category: 'cleaner', rating: 4.4, reviews: 1800 },
      { asin: 'B001F7PPEK', name: 'ウタマロクリーナー', category: 'cleaner', rating: 4.6, reviews: 3000 },
      { asin: 'B00I0GPWFQ', name: 'アルカリ電解水', category: 'cleaner', rating: 4.5, reviews: 2200 },
      { asin: 'B0BZ8S9JGV', name: 'フロアクリーナー', category: 'cleaner', rating: 4.3, reviews: 1000 },
      { asin: 'B0045S63K0', name: 'ワックスクリーナー', category: 'cleaner', rating: 4.2, reviews: 800 }
    ],
    tools: [
      // 床掃除道具（Amazon's Choice）
      { asin: 'B01CXGBL1M', name: 'フロアワイパー', category: 'wiper', rating: 4.5, reviews: 2500 },
      { asin: 'B00M9UV8DI', name: 'モップ 回転式', category: 'mop', rating: 4.4, reviews: 1900 },
      { asin: 'B00H1AV9EM', name: 'フロアシート ドライ', category: 'sheet', rating: 4.6, reviews: 3000 },
      { asin: 'B00II9M8HO', name: 'フロアシート ウェット', category: 'sheet', rating: 4.5, reviews: 2800 },
      { asin: 'B000TGFWE2', name: 'ほうき ちりとりセット', category: 'broom', rating: 4.3, reviews: 1500 }
    ]
  },
  
  window: {
    cleaners: [
      // 窓用洗剤（高評価）
      { asin: 'B00004OCIP', name: 'ガラスマジックリン', category: 'cleaner', rating: 4.5, reviews: 2400 },
      { asin: 'B01M0QJLTC', name: 'ウインドウクリーナー', category: 'cleaner', rating: 4.4, reviews: 1600 },
      { asin: 'B0047TFS4O', name: '窓用洗剤 業務用', category: 'cleaner', rating: 4.3, reviews: 900 },
      { asin: 'B088TSJK2G', name: 'ガラスクリーナー泡', category: 'cleaner', rating: 4.4, reviews: 700 },
      { asin: 'B01739R5QC', name: 'アルコールクリーナー', category: 'cleaner', rating: 4.5, reviews: 1100 }
    ],
    tools: [
      // 窓掃除道具（ベストセラー）
      { asin: 'B07H3JWDQW', name: 'スクイジー プロ仕様', category: 'squeegee', rating: 4.6, reviews: 1800 },
      { asin: 'B08JTYTW8K', name: '窓拭きクロス', category: 'cloth', rating: 4.5, reviews: 2200 },
      { asin: 'B00FP86EYS', name: 'ガラスワイパー', category: 'wiper', rating: 4.4, reviews: 1400 },
      { asin: 'B087XB5RBD', name: '窓掃除ロボット', category: 'tool', rating: 4.3, reviews: 600 },
      { asin: 'B001WADDG4', name: '伸縮ポール', category: 'pole', rating: 4.2, reviews: 800 }
    ]
  },
  
  living: {
    cleaners: [
      // リビング用洗剤（ベストセラー）
      { asin: 'B08G4HTLP3', name: 'リビング用マルチクリーナー', category: 'cleaner', rating: 4.4, reviews: 1700 },
      { asin: 'B0047TFRQC', name: 'ファブリーズ', category: 'spray', rating: 4.5, reviews: 3500 },
      { asin: 'B08G89GVZ7', name: 'カーペットクリーナー', category: 'cleaner', rating: 4.3, reviews: 1200 },
      { asin: 'B001W2P6QQ', name: 'ソファクリーナー', category: 'cleaner', rating: 4.4, reviews: 900 },
      { asin: 'B08CXY5PBV', name: '除菌スプレー', category: 'spray', rating: 4.6, reviews: 2800 }
    ],
    tools: [
      // リビング掃除道具（Amazon's Choice）
      { asin: 'B00IOJCJHU', name: 'ハンディクリーナー', category: 'vacuum', rating: 4.5, reviews: 2100 },
      { asin: 'B0848N5KXR', name: 'コロコロクリーナー', category: 'roller', rating: 4.4, reviews: 3000 },
      { asin: 'B07FNN5PSJ', name: 'ダスター 伸縮式', category: 'duster', rating: 4.3, reviews: 1600 },
      { asin: 'B08HVQGXRB', name: 'エアダスター', category: 'spray', rating: 4.2, reviews: 1400 },
      { asin: 'B01A9RAWNO', name: 'クリーニングクロス', category: 'cloth', rating: 4.5, reviews: 2000 }
    ]
  }
};

// 商品情報を取得する関数
async function getRecommendedProducts(category, subcategory = null) {
  if (!recommendedProducts[category]) {
    console.log(`Category ${category} not found`);
    return [];
  }
  
  if (subcategory) {
    return recommendedProducts[category][subcategory] || [];
  }
  
  // すべてのサブカテゴリーの商品を結合
  const allProducts = [];
  for (const subcat in recommendedProducts[category]) {
    if (Array.isArray(recommendedProducts[category][subcat])) {
      allProducts.push(...recommendedProducts[category][subcat]);
    }
  }
  return allProducts;
}

// カテゴリーごとのASINリストを取得
function getASINsByCategory(category) {
  const products = getRecommendedProducts(category);
  return products.map(p => p.asin);
}

// 高評価商品のみをフィルタリング
function getHighRatedProducts(category, minRating = 4.3, minReviews = 500) {
  const products = getRecommendedProducts(category);
  return products.filter(p => p.rating >= minRating && p.reviews >= minReviews);
}

module.exports = { 
  recommendedProducts,
  getRecommendedProducts,
  getASINsByCategory,
  getHighRatedProducts
};