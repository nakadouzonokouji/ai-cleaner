<?php
/**
 * Amazon商品画像取得プロキシ
 * ASINから実際の画像URLを取得
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$asin = $_GET['asin'] ?? '';

if (empty($asin) || !preg_match('/^[A-Z0-9]{10}$/', $asin)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ASIN']);
    exit();
}

// Amazon商品ページのURL
$url = "https://www.amazon.co.jp/dp/{$asin}";

// User-Agentを設定（Amazon対策）
$options = [
    'http' => [
        'method' => 'GET',
        'header' => [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language: ja-JP,ja;q=0.9,en;q=0.8',
        ]
    ]
];

$context = stream_context_create($options);
$html = @file_get_contents($url, false, $context);

if ($html === false) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found']);
    exit();
}

// 画像URLを正規表現で抽出
$imageUrls = [];

// パターン1: data-old-hires属性から
if (preg_match('/data-old-hires="([^"]+)"/', $html, $matches)) {
    $imageUrls[] = $matches[1];
}

// パターン2: メイン画像のlandingImageタグから
if (preg_match('/id="landingImage"[^>]+src="([^"]+)"/', $html, $matches)) {
    $imageUrls[] = $matches[1];
}

// パターン3: JavaScript内のイメージURLから
if (preg_match_all('/"hiRes":"([^"]+)"/', $html, $matches)) {
    $imageUrls = array_merge($imageUrls, $matches[1]);
}

// パターン4: colorImages内から
if (preg_match('/"colorImages":\s*\{[^}]*"initial":\s*\[([^\]]+)\]/', $html, $matches)) {
    if (preg_match_all('/"large":"([^"]+)"/', $matches[1], $largeMatches)) {
        $imageUrls = array_merge($imageUrls, $largeMatches[1]);
    }
}

// 重複を削除して最初の有効な画像URLを返す
$imageUrls = array_unique(array_filter($imageUrls));

if (!empty($imageUrls)) {
    // 画像IDを抽出
    $imageId = null;
    foreach ($imageUrls as $url) {
        if (preg_match('/\/images\/I\/([^._]+)/', $url, $matches)) {
            $imageId = $matches[1];
            break;
        }
    }
    
    echo json_encode([
        'asin' => $asin,
        'imageId' => $imageId,
        'imageUrl' => reset($imageUrls),
        'allUrls' => array_values($imageUrls)
    ]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'No images found']);
}
?>