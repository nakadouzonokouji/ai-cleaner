<?php
// cURL機能のテスト
echo "Testing cURL functionality...\n\n";

// cURLが有効か確認
if (!function_exists('curl_init')) {
    die("Error: cURL is not enabled on this server\n");
}

echo "cURL is enabled\n";

// 簡単なテスト
$ch = curl_init('https://www.google.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($result !== FALSE) {
    echo "cURL test successful! HTTP Code: $httpCode\n";
} else {
    echo "cURL test failed: $error\n";
}

// PHPの設定確認
echo "\nPHP Settings:\n";
echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'Yes' : 'No') . "\n";
echo "openssl extension: " . (extension_loaded('openssl') ? 'Yes' : 'No') . "\n";