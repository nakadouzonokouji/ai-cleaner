<?php
// Amazon商品情報を取得する簡易実装
// PA APIが動作しない場合の代替手段

function getAmazonProducts($keyword, $config) {
    // 実在する人気掃除用品のASIN（2024年最新）
    $popularProducts = [
        // ウタマロクリーナー
        [
            'asin' => 'B07BNKXBCD',
            'title' => 'ウタマロ クリーナー 400ml',
            'image' => 'https://m.media-amazon.com/images/I/41kZJFmFOWL._AC_SL1000_.jpg',
            'keywords' => ['油', 'キッチン', '換気扇', '万能']
        ],
        // カビキラー
        [
            'asin' => 'B00V4MFQ7K',
            'title' => 'カビキラー カビ取り剤 特大サイズ 1000g',
            'image' => 'https://m.media-amazon.com/images/I/61YD9KBDVHL._AC_SL1000_.jpg',
            'keywords' => ['カビ', '風呂', '浴室', 'バス']
        ],
        // オキシクリーン
        [
            'asin' => 'B00VQE5IQA',
            'title' => 'オキシクリーン 1500g',
            'image' => 'https://m.media-amazon.com/images/I/71CwIKM8YaL._AC_SL1500_.jpg',
            'keywords' => ['漂白', '除菌', '万能', '洗濯']
        ],
        // マジックリン
        [
            'asin' => 'B07P98CBLC',
            'title' => '花王 マジックリン ハンディスプレー 400ml',
            'image' => 'https://m.media-amazon.com/images/I/61jRl2BDKUL._AC_SL1500_.jpg',
            'keywords' => ['油', 'キッチン', '換気扇']
        ],
        // トイレマジックリン
        [
            'asin' => 'B01LWPQZJ4',
            'title' => 'トイレマジックリン 消臭・洗浄スプレー',
            'image' => 'https://m.media-amazon.com/images/I/71VNgwBzb8L._AC_SL1500_.jpg',
            'keywords' => ['トイレ', '便器', '消臭']
        ],
        // サンポール
        [
            'asin' => 'B00V4LPUHC',
            'title' => 'サンポール トイレ洗剤 1000ml',
            'image' => 'https://m.media-amazon.com/images/I/51cXgEK8WzL._AC_SL1000_.jpg',
            'keywords' => ['トイレ', '尿石', '黄ばみ']
        ],
        // ガラスマジックリン
        [
            'asin' => 'B00IJ7AFD4',
            'title' => 'ガラスマジックリン 窓・鏡用洗剤',
            'image' => 'https://m.media-amazon.com/images/I/61NWGKQzAFL._AC_SL1500_.jpg',
            'keywords' => ['窓', 'ガラス', '鏡']
        ],
        // パイプユニッシュ
        [
            'asin' => 'B00V9L09TE',
            'title' => 'パイプユニッシュ PRO 400g',
            'image' => 'https://m.media-amazon.com/images/I/51BkKWgJWBL._AC_SL1000_.jpg',
            'keywords' => ['排水', 'パイプ', '詰まり']
        ]
    ];
    
    // キーワードに基づいて商品を選択
    $selectedProducts = [];
    $keywordLower = mb_strtolower($keyword);
    
    // キーワードマッチング
    foreach ($popularProducts as $product) {
        foreach ($product['keywords'] as $productKeyword) {
            if (strpos($keywordLower, $productKeyword) !== false) {
                $selectedProducts[] = [
                    'asin' => $product['asin'],
                    'title' => $product['title'],
                    'image' => $product['image'],
                    'url' => 'https://www.amazon.co.jp/dp/' . $product['asin'] . '/?tag=' . $config['amazon_associate_tag'],
                    'image_proxy' => './image-proxy.php?url=' . urlencode($product['image'])
                ];
                break;
            }
        }
    }
    
    // マッチしない場合は人気商品を返す
    if (empty($selectedProducts)) {
        for ($i = 0; $i < 4 && $i < count($popularProducts); $i++) {
            $selectedProducts[] = [
                'asin' => $popularProducts[$i]['asin'],
                'title' => $popularProducts[$i]['title'],
                'image' => $popularProducts[$i]['image'],
                'url' => 'https://www.amazon.co.jp/dp/' . $popularProducts[$i]['asin'] . '/?tag=' . $config['amazon_associate_tag'],
                'image_proxy' => './image-proxy.php?url=' . urlencode($popularProducts[$i]['image'])
            ];
        }
    }
    
    return array_slice($selectedProducts, 0, 4);
}