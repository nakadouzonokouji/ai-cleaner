<?php
/**
 * Amazon PA-API v5 シンプル実装
 * 最小限の実装で動作確認
 */

// エラー報告を有効化
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONSリクエスト対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 設定ファイル読み込み
require_once __DIR__ . '/config.php';

// リクエスト取得
$input = file_get_contents('php://input');
$request = json_decode($input, true);

if (!$request || !isset($request['asins'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ASINs required']);
    exit;
}

try {
    // PA-API設定
    $serviceName = 'ProductAdvertisingAPI';
    $region = 'us-west-2';
    $host = 'webservices.amazon.co.jp';
    $uriPath = '/paapi5/getitems';
    
    // リクエストペイロード
    $payload = [
        'PartnerTag' => AMAZON_ASSOCIATE_TAG,
        'PartnerType' => 'Associates',
        'Marketplace' => 'www.amazon.co.jp',
        'ItemIds' => $request['asins'],
        'Resources' => [
            'Images.Primary.Large',
            'Images.Primary.Medium',
            'Images.Primary.Small',
            'ItemInfo.Title'
        ]
    ];
    
    $payloadJson = json_encode($payload);
    $datetime = gmdate('Ymd\THis\Z');
    $date = gmdate('Ymd');
    
    // 正規ヘッダー
    $canonicalHeaders = [
        'content-type' => 'application/json; charset=utf-8',
        'host' => $host,
        'x-amz-date' => $datetime,
        'x-amz-target' => 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
    ];
    
    // 正規ヘッダー文字列
    $canonicalHeadersStr = '';
    foreach ($canonicalHeaders as $key => $value) {
        $canonicalHeadersStr .= $key . ':' . $value . "\n";
    }
    
    $signedHeaders = implode(';', array_keys($canonicalHeaders));
    
    // 正規リクエスト
    $canonicalRequest = "POST\n" .
                       $uriPath . "\n" .
                       "\n" .
                       $canonicalHeadersStr . "\n" .
                       $signedHeaders . "\n" .
                       hash('sha256', $payloadJson);
    
    // 署名文字列
    $algorithm = 'AWS4-HMAC-SHA256';
    $scope = $date . '/' . $region . '/' . $serviceName . '/aws4_request';
    
    $stringToSign = $algorithm . "\n" .
                   $datetime . "\n" .
                   $scope . "\n" .
                   hash('sha256', $canonicalRequest);
    
    // 署名キー
    $kSecret = 'AWS4' . AMAZON_SECRET_KEY;
    $kDate = hash_hmac('sha256', $date, $kSecret, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $serviceName, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    
    // 署名
    $signature = hash_hmac('sha256', $stringToSign, $kSigning);
    
    // Authorizationヘッダー
    $authHeader = $algorithm . ' ' .
                 'Credential=' . AMAZON_ACCESS_KEY . '/' . $scope . ', ' .
                 'SignedHeaders=' . $signedHeaders . ', ' .
                 'Signature=' . $signature;
    
    // cURLリクエスト
    $url = 'https://' . $host . $uriPath;
    
    $headers = [
        'Authorization: ' . $authHeader,
        'Content-Type: application/json; charset=utf-8',
        'Host: ' . $host,
        'X-Amz-Date: ' . $datetime,
        'X-Amz-Target: com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadJson);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception('cURL error: ' . $error);
    }
    
    if ($httpCode !== 200) {
        // デバッグ情報
        $debugInfo = [
            'http_code' => $httpCode,
            'response' => $response,
            'request' => [
                'url' => $url,
                'headers' => $headers,
                'payload' => $payload
            ]
        ];
        throw new Exception('API Error: ' . json_encode($debugInfo));
    }
    
    $data = json_decode($response, true);
    
    // 結果処理
    $results = [];
    if (isset($data['ItemsResult']['Items'])) {
        foreach ($data['ItemsResult']['Items'] as $item) {
            $asin = $item['ASIN'];
            
            $imageUrl = null;
            if (isset($item['Images']['Primary'])) {
                $imageUrl = $item['Images']['Primary']['Large']['URL'] ??
                           $item['Images']['Primary']['Medium']['URL'] ??
                           $item['Images']['Primary']['Small']['URL'] ??
                           null;
            }
            
            $results[$asin] = [
                'asin' => $asin,
                'title' => $item['ItemInfo']['Title']['DisplayValue'] ?? '',
                'image' => $imageUrl,
                'url' => 'https://www.amazon.co.jp/dp/' . $asin . '?tag=' . AMAZON_ASSOCIATE_TAG
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'products' => $results
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>