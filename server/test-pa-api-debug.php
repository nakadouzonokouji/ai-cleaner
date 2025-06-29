<?php
/**
 * PA-API デバッグテスト
 * 署名プロセスを段階的に確認
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=UTF-8');

require_once __DIR__ . '/config.php';

echo "Amazon PA-API v5 Debug Test\n";
echo "===========================\n\n";

// 設定確認
echo "1. Configuration Check:\n";
echo "   Access Key: " . (defined('AMAZON_ACCESS_KEY') && AMAZON_ACCESS_KEY ? 'OK' : 'NG') . "\n";
echo "   Secret Key: " . (defined('AMAZON_SECRET_KEY') && AMAZON_SECRET_KEY ? 'OK' : 'NG') . "\n";
echo "   Associate Tag: " . (defined('AMAZON_ASSOCIATE_TAG') ? AMAZON_ASSOCIATE_TAG : 'NG') . "\n\n";

// テストパラメータ
$testAsin = 'B07C44DM6S';
$serviceName = 'ProductAdvertisingAPI';
$region = 'us-west-2';
$host = 'webservices.amazon.co.jp';
$uriPath = '/paapi5/getitems';

echo "2. Test Parameters:\n";
echo "   ASIN: $testAsin\n";
echo "   Host: $host\n";
echo "   Path: $uriPath\n";
echo "   Region: $region\n\n";

// ペイロード
$payload = [
    'PartnerTag' => AMAZON_ASSOCIATE_TAG,
    'PartnerType' => 'Associates',
    'Marketplace' => 'www.amazon.co.jp',
    'ItemIds' => [$testAsin],
    'Resources' => ['Images.Primary.Large', 'ItemInfo.Title']
];

$payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

echo "3. Request Payload:\n";
echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// タイムスタンプ
$datetime = gmdate('Ymd\THis\Z');
$date = gmdate('Ymd');

echo "4. Timestamps:\n";
echo "   DateTime: $datetime\n";
echo "   Date: $date\n\n";

// 正規ヘッダー
$canonicalHeaders = [
    'content-type' => 'application/json; charset=utf-8',
    'host' => $host,
    'x-amz-date' => $datetime,
    'x-amz-target' => 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
];

echo "5. Canonical Headers:\n";
foreach ($canonicalHeaders as $key => $value) {
    echo "   $key: $value\n";
}

$canonicalHeadersStr = '';
foreach ($canonicalHeaders as $key => $value) {
    $canonicalHeadersStr .= $key . ':' . $value . "\n";
}

$signedHeaders = implode(';', array_keys($canonicalHeaders));
echo "\n   Signed Headers: $signedHeaders\n\n";

// 正規リクエスト
$canonicalRequest = "POST\n" .
                   $uriPath . "\n" .
                   "\n" .
                   $canonicalHeadersStr . "\n" .
                   $signedHeaders . "\n" .
                   hash('sha256', $payloadJson);

echo "6. Canonical Request:\n";
echo "---START---\n$canonicalRequest\n---END---\n\n";

// 署名文字列
$algorithm = 'AWS4-HMAC-SHA256';
$scope = $date . '/' . $region . '/' . $serviceName . '/aws4_request';

$stringToSign = $algorithm . "\n" .
               $datetime . "\n" .
               $scope . "\n" .
               hash('sha256', $canonicalRequest);

echo "7. String to Sign:\n";
echo "---START---\n$stringToSign\n---END---\n\n";

// 署名
$kSecret = 'AWS4' . AMAZON_SECRET_KEY;
$kDate = hash_hmac('sha256', $date, $kSecret, true);
$kRegion = hash_hmac('sha256', $region, $kDate, true);
$kService = hash_hmac('sha256', $serviceName, $kRegion, true);
$kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
$signature = hash_hmac('sha256', $stringToSign, $kSigning);

echo "8. Signature: $signature\n\n";

// Authorization header
$authHeader = $algorithm . ' ' .
             'Credential=' . AMAZON_ACCESS_KEY . '/' . $scope . ', ' .
             'SignedHeaders=' . $signedHeaders . ', ' .
             'Signature=' . $signature;

echo "9. Authorization Header:\n$authHeader\n\n";

// 実際のリクエスト実行
echo "10. Executing Request...\n";

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
curl_setopt($ch, CURLOPT_VERBOSE, true);

$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

rewind($verbose);
$verboseLog = stream_get_contents($verbose);
fclose($verbose);

curl_close($ch);

echo "\n11. Response:\n";
echo "    HTTP Code: $httpCode\n";
echo "    cURL Error: " . ($error ?: 'None') . "\n\n";

echo "12. Response Body:\n";
echo $response . "\n\n";

echo "13. Verbose Log:\n";
echo $verboseLog;

// レスポンス解析
if ($response) {
    $data = json_decode($response, true);
    if ($data) {
        echo "\n14. Parsed Response:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
}
?>