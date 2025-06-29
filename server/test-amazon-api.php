<?php
/**
 * Amazon API テスト（デバッグ用）
 * URL: https://cxmainte.com/tools/ai-cleaner/server/test-amazon-api.php
 */

// エラーを表示
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// config.phpを読み込み
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    echo json_encode([
        'status' => 'config_loaded',
        'has_access_key' => defined('AMAZON_ACCESS_KEY') && !empty(AMAZON_ACCESS_KEY),
        'has_secret_key' => defined('AMAZON_SECRET_KEY') && !empty(AMAZON_SECRET_KEY),
        'has_associate_tag' => defined('AMAZON_ASSOCIATE_TAG') && !empty(AMAZON_ASSOCIATE_TAG)
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        'error' => 'config.php not found',
        'path' => __DIR__ . '/config.php'
    ], JSON_PRETTY_PRINT);
}

// 簡単なAPIテスト
if (defined('AMAZON_ACCESS_KEY') && defined('AMAZON_SECRET_KEY')) {
    echo "\n\n";
    
    // テスト用のASIN
    $testAsin = 'B07C44DM6S';
    
    // API設定
    $amazonConfig = [
        'accessKey' => AMAZON_ACCESS_KEY,
        'secretKey' => AMAZON_SECRET_KEY,
        'associateTag' => AMAZON_ASSOCIATE_TAG,
        'endpoint' => 'webservices.amazon.co.jp',
        'region' => 'us-west-2'
    ];
    
    // リクエストペイロード
    $requestPayload = [
        'ItemIds' => [$testAsin],
        'Resources' => ['Images.Primary.Large'],
        'PartnerTag' => $amazonConfig['associateTag'],
        'PartnerType' => 'Associates',
        'Marketplace' => 'www.amazon.co.jp'
    ];
    
    echo json_encode([
        'test' => 'Amazon PA-API Test',
        'asin' => $testAsin,
        'endpoint' => $amazonConfig['endpoint'],
        'ready' => true
    ], JSON_PRETTY_PRINT);
}
?>