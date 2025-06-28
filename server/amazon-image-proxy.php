<?php
/**
 * Amazon商品画像プロキシ（2025年1月版）
 * 商品ページから画像URLを抽出してCORS制限を回避
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://cxmainte.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=86400'); // 24時間キャッシュ

// プリフライトリクエスト対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// エラーハンドリング
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'timestamp' => date('c')
    ]);
    exit;
}

// 成功レスポンス
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data,
        'timestamp' => date('c')
    ]);
    exit;
}

// メイン処理
try {
    // ASINを取得
    $asin = $_GET['asin'] ?? $_POST['asin'] ?? '';
    
    if (empty($asin) || !preg_match('/^[A-Z0-9]{10}$/', $asin)) {
        sendError('Invalid ASIN format');
    }
    
    // キャッシュチェック（簡易版）
    $cacheFile = sys_get_temp_dir() . '/amazon_img_' . $asin . '.json';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if ($cached) {
            sendSuccess($cached);
        }
    }
    
    // Amazon商品ページを取得
    $imageData = fetchAmazonProductImage($asin);
    
    if ($imageData) {
        // キャッシュに保存
        file_put_contents($cacheFile, json_encode($imageData));
        sendSuccess($imageData);
    } else {
        sendError('Failed to fetch image data', 404);
    }
    
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

/**
 * Amazon商品ページから画像URLを抽出
 */
function fetchAmazonProductImage($asin) {
    $url = "https://www.amazon.co.jp/dp/{$asin}";
    
    // cURLの設定
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language: ja,en-US;q=0.7,en;q=0.3',
            'Accept-Encoding: gzip, deflate, br',
            'DNT: 1',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Cache-Control: no-cache'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_ENCODING => 'gzip, deflate'
    ]);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || empty($html)) {
        return null;
    }
    
    // 複数の抽出パターンを試行
    $imageData = null;
    
    // パターン1: colorImages JSONデータ
    if (preg_match('/"colorImages":\s*{\s*"initial":\s*(\[[\s\S]*?\])\s*}/i', $html, $matches)) {
        $jsonData = $matches[1];
        $images = json_decode($jsonData, true);
        if (is_array($images) && !empty($images)) {
            $imageData = extractImageUrlsFromJson($images);
        }
    }
    
    // パターン2: imageGalleryData
    if (!$imageData && preg_match('/"imageGalleryData":\s*(\[[\s\S]*?\])\s*,/i', $html, $matches)) {
        $jsonData = $matches[1];
        $images = json_decode($jsonData, true);
        if (is_array($images) && !empty($images)) {
            $imageData = extractImageUrlsFromJson($images);
        }
    }
    
    // パターン3: landingImage
    if (!$imageData && preg_match('/"landingImage":\s*"([^"]+)"/i', $html, $matches)) {
        $imageUrl = $matches[1];
        $imageId = extractImageId($imageUrl);
        if ($imageId) {
            $imageData = [
                'imageId' => $imageId,
                'urls' => buildImageUrls($imageId),
                'originalUrl' => $imageUrl
            ];
        }
    }
    
    // パターン4: 画像タグから直接抽出
    if (!$imageData) {
        $patterns = [
            '/<img[^>]+id="landingImage"[^>]+src="([^"]+)"/i',
            '/<img[^>]+class="[^"]*a-dynamic-image[^"]*"[^>]+src="([^"]+)"/i',
            '/<img[^>]+data-old-hires="([^"]+)"/i'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                $imageUrl = html_entity_decode($matches[1]);
                $imageId = extractImageId($imageUrl);
                if ($imageId) {
                    $imageData = [
                        'imageId' => $imageId,
                        'urls' => buildImageUrls($imageId),
                        'originalUrl' => $imageUrl
                    ];
                    break;
                }
            }
        }
    }
    
    // パターン5: Open Graph画像
    if (!$imageData && preg_match('/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i', $html, $matches)) {
        $imageUrl = html_entity_decode($matches[1]);
        $imageId = extractImageId($imageUrl);
        if ($imageId) {
            $imageData = [
                'imageId' => $imageId,
                'urls' => buildImageUrls($imageId),
                'originalUrl' => $imageUrl
            ];
        }
    }
    
    return $imageData;
}

/**
 * JSONデータから画像URLを抽出
 */
function extractImageUrlsFromJson($images) {
    $imageUrls = [];
    $imageId = null;
    
    foreach ($images as $image) {
        if (isset($image['hiRes'])) {
            $imageUrls[] = $image['hiRes'];
            if (!$imageId) {
                $imageId = extractImageId($image['hiRes']);
            }
        }
        if (isset($image['large'])) {
            $imageUrls[] = $image['large'];
            if (!$imageId) {
                $imageId = extractImageId($image['large']);
            }
        }
    }
    
    if ($imageId) {
        return [
            'imageId' => $imageId,
            'urls' => array_merge(buildImageUrls($imageId), array_unique($imageUrls)),
            'originalUrls' => array_unique($imageUrls)
        ];
    }
    
    return null;
}

/**
 * URLから画像IDを抽出
 */
function extractImageId($url) {
    if (preg_match('/\/([A-Z0-9]+)\._/', $url, $matches)) {
        return $matches[1];
    }
    return null;
}

/**
 * 画像IDから複数のURLパターンを生成
 */
function buildImageUrls($imageId) {
    $domains = [
        'm.media-amazon.com',
        'images-na.ssl-images-amazon.com',
        'images-fe.ssl-images-amazon.com',
        'images-eu.ssl-images-amazon.com'
    ];
    
    $sizes = [
        'SL1500', // 最大
        'SL1000', // 特大
        'SL500',  // 大
        'SL300',  // 中
        'SL160'   // 小
    ];
    
    $urls = [];
    
    // 各ドメインとサイズの組み合わせでURL生成
    foreach ($domains as $domain) {
        foreach ($sizes as $size) {
            $urls[] = "https://{$domain}/images/I/{$imageId}._AC_{$size}_.jpg";
        }
    }
    
    return $urls;
}

// 追加機能：画像の直接プロキシ（必要に応じて）
if (isset($_GET['proxy_image'])) {
    $imageUrl = $_GET['proxy_image'];
    
    // セキュリティチェック
    if (!preg_match('/^https:\/\/[^\/]+\.amazon[^\/]*\.com\//', $imageUrl)) {
        sendError('Invalid image URL');
    }
    
    // 画像を取得して転送
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $imageUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $imageData = curl_exec($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 && $imageData) {
        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=86400');
        echo $imageData;
    } else {
        header('HTTP/1.1 404 Not Found');
    }
    exit;
}
?>