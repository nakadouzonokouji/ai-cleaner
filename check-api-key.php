<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 設定ファイルを読み込み
$config = require_once 'config.php';

echo "Checking Gemini API Key...\n\n";

// APIキーの確認（全文字表示）
echo "API Key: " . $config['gemini_api_key'] . "\n\n";

// 簡単なテストリクエスト
$apiKey = $config['gemini_api_key'];
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" . $apiKey;

$testData = [
    'contents' => [[
        'parts' => [[
            'text' => 'Hello, this is a test.'
        ]]
    ]]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'
));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: " . $httpCode . "\n\n";

if ($error) {
    echo "cURL Error: " . $error . "\n\n";
}

echo "Response:\n";
echo $result . "\n\n";

// レスポンスをデコード
$response = json_decode($result, true);
if (isset($response['error'])) {
    echo "\nError Details:\n";
    echo "Message: " . ($response['error']['message'] ?? 'No message') . "\n";
    echo "Status: " . ($response['error']['status'] ?? 'No status') . "\n";
    echo "Code: " . ($response['error']['code'] ?? 'No code') . "\n";
}