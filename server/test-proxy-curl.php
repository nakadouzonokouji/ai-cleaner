<?php
/**
 * cURLでプロキシをテスト
 * URL: https://cxmainte.com/tools/ai-cleaner/server/test-proxy-curl.php
 */

header('Content-Type: text/plain; charset=UTF-8');

echo "Amazon Proxy cURL Test\n";
echo "======================\n\n";

// テストデータ
$testData = [
    'asins' => ['B07C44DM6S']
];

// cURLでリクエスト
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://cxmainte.com/tools/ai-cleaner/server/amazon-proxy.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Origin: https://cxmainte.com'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_VERBOSE, true);

// Verboseログをキャプチャ
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

// Verboseログを取得
rewind($verbose);
$verboseLog = stream_get_contents($verbose);

curl_close($ch);

echo "HTTP Status: " . $httpCode . "\n";
echo "cURL Error: " . ($error ?: 'なし') . "\n\n";

echo "Response:\n";
echo "----------\n";
echo $response . "\n\n";

echo "Verbose Log:\n";
echo "------------\n";
echo $verboseLog;

// レスポンスをパース
if ($response) {
    $data = json_decode($response, true);
    if ($data) {
        echo "\n\nParsed Response:\n";
        echo "----------------\n";
        print_r($data);
    }
}
?>