<?php
/**
 * Amazon Proxy Debug Test
 * URL: https://cxmainte.com/tools/ai-cleaner/server/test-amazon-proxy.php
 */

// エラーを表示
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Debug info
$debug = [
    'step' => 'start',
    'config_exists' => file_exists(__DIR__ . '/config.php'),
    'php_version' => phpversion(),
    'curl_enabled' => function_exists('curl_init')
];

// Try to load config
if (file_exists(__DIR__ . '/config.php')) {
    try {
        require_once __DIR__ . '/config.php';
        $debug['config_loaded'] = true;
        $debug['has_access_key'] = defined('AMAZON_ACCESS_KEY') && !empty(AMAZON_ACCESS_KEY);
        $debug['has_secret_key'] = defined('AMAZON_SECRET_KEY') && !empty(AMAZON_SECRET_KEY);
        $debug['has_associate_tag'] = defined('AMAZON_ASSOCIATE_TAG') && !empty(AMAZON_ASSOCIATE_TAG);
    } catch (Exception $e) {
        $debug['config_error'] = $e->getMessage();
    }
} else {
    $debug['config_error'] = 'config.php not found';
}

// Test simple API request
if ($debug['has_access_key'] ?? false) {
    try {
        // Test payload
        $testPayload = [
            'asins' => ['B07C44DM6S'],
            'config' => [
                'accessKey' => AMAZON_ACCESS_KEY,
                'secretKey' => AMAZON_SECRET_KEY,
                'associateTag' => AMAZON_ASSOCIATE_TAG
            ]
        ];
        
        $debug['test_payload'] = 'Ready to test API';
        
        // Quick test of signature generation
        $timestamp = gmdate('Ymd\THis\Z');
        $debug['timestamp'] = $timestamp;
        
    } catch (Exception $e) {
        $debug['test_error'] = $e->getMessage();
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>