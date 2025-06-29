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
    $amazonConfig = [
        'accessKey' => AMAZON_ACCESS_KEY,
        'secretKey' => AMAZON_SECRET_KEY,
        'associateTag' => AMAZON_ASSOCIATE_TAG,
        'endpoint' => 'webservices.amazon.co.jp',
        'region' => 'us-west-2'
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
            'ItemInfo.Title',
            'ItemInfo.ByLineInfo',
            'Offers.Listings.Price',
            'CustomerReviews.StarRating',
            'CustomerReviews.Count'
        ],
        'PartnerTag' => $config['associateTag'],
        'PartnerType' => 'Associates',
        'Marketplace' => 'www.amazon.co.jp'
    ];
    
    $path = '/paapi5/getitems';
    $payload = json_encode($requestPayload);
    $timestamp = gmdate('Ymd\THis\Z');
    
    // AWS署名v4生成
    $signature = generateAWSSignature('POST', $path, '', $payload, $config, $timestamp);
    
    // HTTPリクエスト実行
    $url = 'https://' . $config['endpoint'] . $path;
    $headers = [
        'Content-Type: application/json; charset=UTF-8',
        'Host: ' . $config['endpoint'],
        'X-Amz-Date: ' . $timestamp,
        'Authorization: ' . buildAuthorizationHeader($config, $timestamp, $signature)
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
        throw new Exception('Amazon API error: HTTP ' . $httpCode);
    }
    
    $data = json_decode($response, true);
    
    if (!$data) {
        throw new Exception('Invalid API response');
    }
    
    return processAmazonResponse($data, $config['associateTag']);
}

function generateAWSSignature($method, $path, $queryString, $payload, $config, $timestamp) {
    $date = substr($timestamp, 0, 8);
    
    $canonicalRequest = implode("\n", [
        $method,
        $path,
        $queryString,
        'host:' . $config['endpoint'],
        'x-amz-date:' . $timestamp,
        '',
        'host;x-amz-date',
        hash('sha256', $payload)
    ]);
    
    $scope = $date . '/' . $config['region'] . '/ProductAdvertisingAPI/aws4_request';
    $stringToSign = implode("\n", [
        'AWS4-HMAC-SHA256',
        $timestamp,
        $scope,
        hash('sha256', $canonicalRequest)
    ]);
    
    $kDate = hash_hmac('sha256', $date, 'AWS4' . $config['secretKey'], true);
    $kRegion = hash_hmac('sha256', $config['region'], $kDate, true);
    $kService = hash_hmac('sha256', 'ProductAdvertisingAPI', $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    
    return bin2hex(hash_hmac('sha256', $stringToSign, $kSigning, true));
}

function buildAuthorizationHeader($config, $timestamp, $signature) {
    $date = substr($timestamp, 0, 8);
    $scope = $date . '/' . $config['region'] . '/ProductAdvertisingAPI/aws4_request';
    
    return 'AWS4-HMAC-SHA256 ' .
           'Credential=' . $config['accessKey'] . '/' . $scope . ', ' .
           'SignedHeaders=host;x-amz-date, ' .
           'Signature=' . $signature;
}

function processAmazonResponse($data, $associateTag) {
    $results = [];
    
    if (isset($data['ItemsResult']['Items'])) {
        foreach ($data['ItemsResult']['Items'] as $item) {
            $asin = $item['ASIN'];
            
            $results[$asin] = [
                'asin' => $asin,
                'title' => $item['ItemInfo']['Title']['DisplayValue'] ?? '商品名取得不可',
                'brand' => $item['ItemInfo']['ByLineInfo']['Brand']['DisplayValue'] ?? '',
                'price' => $item['Offers']['Listings'][0]['Price']['DisplayAmount'] ?? null,
                'rating' => $item['CustomerReviews']['StarRating']['Value'] ?? null,
                'reviewCount' => $item['CustomerReviews']['Count'] ?? null,
                'images' => [
                    'large' => $item['Images']['Primary']['Large']['URL'] ?? null,
                    'medium' => $item['Images']['Primary']['Medium']['URL'] ?? null
                ],
                'url' => 'https://www.amazon.co.jp/dp/' . $asin . '?tag=' . $associateTag,
                'isRealData' => true
            ];
        }
    }
    
    return $results;
}
?>