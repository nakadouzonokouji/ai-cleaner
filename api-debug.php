<?php
// デバッグ用API
error_reporting(E_ALL);
ini_set('display_errors', 1);

// まずPHPが動作するか確認
echo "Debug mode active\n";

// config.phpの存在確認
if (!file_exists('config.php')) {
    die("Error: config.php not found");
}

// config.phpを読み込み
try {
    $config = require_once 'config.php';
    echo "Config loaded successfully\n";
} catch (Exception $e) {
    die("Error loading config: " . $e->getMessage());
}

// APIキーの存在確認（最初の5文字のみ表示）
if (isset($config['gemini_api_key'])) {
    echo "Gemini API key found: " . substr($config['gemini_api_key'], 0, 5) . "...\n";
} else {
    echo "Gemini API key NOT found\n";
}

// JSONレスポンスのテスト
header('Content-Type: application/json');
echo json_encode(['status' => 'API is working', 'config_loaded' => true]);