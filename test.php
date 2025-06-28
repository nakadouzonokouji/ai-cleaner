<?php
// エラー表示を有効化
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "PHP is working!<br>";
echo "PHP Version: " . phpversion() . "<br>";

// config.phpの存在確認
if (file_exists('config.php')) {
    echo "config.php exists<br>";
    $config = require_once 'config.php';
    echo "Config loaded successfully<br>";
    // APIキーの一部を表示（セキュリティのため最初の5文字のみ）
    echo "Gemini API Key starts with: " . substr($config['gemini_api_key'], 0, 5) . "...<br>";
} else {
    echo "config.php NOT found<br>";
}

// 書き込み権限の確認
echo "<br>Directory permissions:<br>";
echo "Current directory: " . getcwd() . "<br>";
echo "Is writable: " . (is_writable('.') ? 'Yes' : 'No') . "<br>";

phpinfo();