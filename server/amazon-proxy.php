<?php
// XServer用 Amazon PA-API v5 セキュアプロキシ

// エラー報告を有効化（デバッグ用）
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// 動的CORS設定
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (strpos($origin, 'cxmainte.com') !== false || strpos($origin, 'localhost') !== false) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://cxmainte.com');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// OPTIONSリクエスト（プリフライト）対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST method required']);
    exit;
}

// セキュア設定を読み込み
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration file not found', 'path' => $configPath]);
    exit;
}

require_once $configPath;

// 設定の検証
if (!defined('AMAZON_ACCESS_KEY') || !defined('AMAZON_SECRET_KEY') || !defined('AMAZON_ASSOCIATE_TAG')) {
    http_response_code(500);
    echo json_encode(['error' => 'Amazon API credentials not configured']);
    exit;
}

try {
    // リクエストボディを取得
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    if (!$request || !isset($request['asins'])) {
        throw new Exception('Invalid request format');
    }
    
    $asins = $request['asins'];
    
    // セキュアなAmazon PA-API設定（サーバーサイドから取得）
    // 日本のPA-APIはap-northeast-1リージョンを使用
    $amazonConfig = [
        'accessKey' => AMAZON_ACCESS_KEY,
        'secretKey' => AMAZON_SECRET_KEY,
        'associateTag' => AMAZON_ASSOCIATE_TAG,
        'endpoint' => 'webservices.amazon.co.jp',
        'region' => 'us-west-2',  // PA-APIは全世界でus-west-2を使用
        'service' => 'ProductAdvertisingAPI'
    ];
    
    // APIキー検証
    if (empty($amazonConfig['accessKey']) || empty($amazonConfig['secretKey']) || empty($amazonConfig['associateTag'])) {
        throw new Exception('Amazon API credentials are incomplete');
    }
    
    // Amazon PA-API リクエスト実行
    $products = callAmazonAPI($asins, $amazonConfig);
    
    echo json_encode([
        'success' => true,
        'products' => $products,
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => basename($e->getFile()),
        'timestamp' => date('c')
    ]);
}

function callAmazonAPI($asins, $config) {
    // Amazon PA-API v5 リクエストペイロード
    $requestPayload = [
        'ItemIds' => $asins,
        'Resources' => [
            'Images.Primary.Large',
            'Images.Primary.Medium',
            'Images.Primary.Small',
            'ItemInfo.Title',
            'ItemInfo.ByLineInfo.Brand',
            'Offers.Listings.Price.DisplayAmount',
            'Offers.Listings.Price.Amount'
        ],
        'PartnerTag' => $config['associateTag'],
        'PartnerType' => 'Associates',
        'Marketplace' => 'www.amazon.co.jp',
        'Operation' => 'GetItems'
    ];
    
    $host = $config['endpoint'];
    $path = '/paapi5/getitems';
    $payload = json_encode($requestPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $timestamp = gmdate('Ymd\THis\Z');
    $datestamp = gmdate('Ymd');
    
    // Content-Typeヘッダーの正規化
    $contentType = 'application/json; charset=utf-8';
    $amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
    
    // 正規ヘッダー（改行で終わる必要がある）
    $canonicalHeaders = 'content-type:' . $contentType . "\n" .
                       'host:' . $host . "\n" .
                       'x-amz-date:' . $timestamp . "\n" .
                       'x-amz-target:' . $amzTarget . "\n";
    
    $signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
    
    // 正規リクエストの作成
    $canonicalRequest = "POST\n" .
                       $path . "\n" .
                       "\n" .
                       $canonicalHeaders . "\n" .
                       $signedHeaders . "\n" .
                       hash('sha256', $payload);
    
    // 署名の生成
    $algorithm = 'AWS4-HMAC-SHA256';
    $credentialScope = $datestamp . '/' . $config['region'] . '/' . $config['service'] . '/aws4_request';
    
    $stringToSign = $algorithm . "\n" .
                   $timestamp . "\n" .
                   $credentialScope . "\n" .
                   hash('sha256', $canonicalRequest);
    
    // 署名キーの生成
    $kDate = hash_hmac('sha256', $datestamp, 'AWS4' . $config['secretKey'], true);
    $kRegion = hash_hmac('sha256', $config['region'], $kDate, true);
    $kService = hash_hmac('sha256', $config['service'], $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);
    
    // Authorization ヘッダーの生成
    $authorizationHeader = $algorithm . ' ' .
                          'Credential=' . $config['accessKey'] . '/' . $credentialScope . ', ' .
                          'SignedHeaders=' . $signedHeaders . ', ' .
                          'Signature=' . $signature;
    
    // HTTPリクエスト実行
    $url = 'https://' . $host . $path;
    $headers = [
        'Content-Type: ' . $contentType,
        'Host: ' . $host,
        'X-Amz-Date: ' . $timestamp,
        'X-Amz-Target: ' . $amzTarget,
        'Authorization: ' . $authorizationHeader,
        'Content-Length: ' . strlen($payload)
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        curl_close($ch);
        throw new Exception('CURL error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        // デバッグ情報を含めてエラーを投げる
        $errorInfo = [
            'http_code' => $httpCode,
            'response' => substr($response, 0, 500), // 最初の500文字
            'url' => $url,
            'headers_sent' => $headers
        ];
        throw new Exception('Amazon API error: HTTP ' . $httpCode . ' - ' . json_encode($errorInfo));
    }
    
    $data = json_decode($response, true);
    
    if (!$data) {
        throw new Exception('Invalid API response');
    }
    
    return processAmazonResponse($data, $config['associateTag']);
}

// 署名生成関数は callAmazonAPI 内に統合されたため削除

function processAmazonResponse($data, $associateTag) {
    $results = [];
    
    if (isset($data['ItemsResult']['Items'])) {
        foreach ($data['ItemsResult']['Items'] as $item) {
            $asin = $item['ASIN'] ?? '';
            
            // 画像URLの取得
            $largeImage = null;
            $mediumImage = null;
            $smallImage = null;
            
            if (isset($item['Images']['Primary'])) {
                $largeImage = $item['Images']['Primary']['Large']['URL'] ?? null;
                $mediumImage = $item['Images']['Primary']['Medium']['URL'] ?? null;
                $smallImage = $item['Images']['Primary']['Small']['URL'] ?? null;
            }
            
            // 価格情報の取得
            $price = null;
            if (isset($item['Offers']['Listings'][0]['Price']['DisplayAmount'])) {
                $price = $item['Offers']['Listings'][0]['Price']['DisplayAmount'];
            }
            
            $results[$asin] = [
                'asin' => $asin,
                'title' => $item['ItemInfo']['Title']['DisplayValue'] ?? '商品名取得不可',
                'brand' => $item['ItemInfo']['ByLineInfo']['Brand']['DisplayValue'] ?? '',
                'price' => $price,
                'images' => [
                    'large' => $largeImage,
                    'medium' => $mediumImage,
                    'small' => $smallImage
                ],
                'url' => 'https://www.amazon.co.jp/dp/' . $asin . '?tag=' . $associateTag,
                'isRealData' => true
            ];
        }
    }
    
    return $results;
}
?>