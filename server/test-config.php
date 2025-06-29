<?php
/**
 * 設定テストスクリプト
 * このファイルをX-Serverにアップロードして、ブラウザでアクセスしてください
 * URL: https://cxmainte.com/tools/ai-cleaner/server/test-config.php
 */

header('Content-Type: text/html; charset=UTF-8');

echo "<!DOCTYPE html>";
echo "<html><head><title>設定テスト</title></head><body>";
echo "<h1>X-Server 設定テスト</h1>";

// PHPバージョン
echo "<h2>1. PHP環境</h2>";
echo "<p>PHPバージョン: " . phpversion() . "</p>";

// config.phpの存在確認
echo "<h2>2. config.php確認</h2>";
if (file_exists(__DIR__ . '/config.php')) {
    echo "<p style='color:green'>✅ config.phpが存在します</p>";
    
    // 設定を読み込んでみる
    $config = include(__DIR__ . '/config.php');
    
    // APIキーの存在確認（値は表示しない）
    if (defined('AMAZON_ACCESS_KEY') && AMAZON_ACCESS_KEY) {
        echo "<p style='color:green'>✅ AMAZON_ACCESS_KEYが設定されています</p>";
    } else {
        echo "<p style='color:red'>❌ AMAZON_ACCESS_KEYが設定されていません</p>";
    }
    
    if (defined('AMAZON_SECRET_KEY') && AMAZON_SECRET_KEY) {
        echo "<p style='color:green'>✅ AMAZON_SECRET_KEYが設定されています</p>";
    } else {
        echo "<p style='color:red'>❌ AMAZON_SECRET_KEYが設定されていません</p>";
    }
    
    if (defined('GEMINI_API_KEY') && GEMINI_API_KEY) {
        echo "<p style='color:green'>✅ GEMINI_API_KEYが設定されています</p>";
    } else {
        echo "<p style='color:red'>❌ GEMINI_API_KEYが設定されていません</p>";
    }
} else {
    echo "<p style='color:red'>❌ config.phpが存在しません</p>";
    echo "<p>以下の内容でconfig.phpを作成してください：</p>";
    echo "<pre style='background:#f0f0f0;padding:10px'>";
    echo htmlspecialchars("<?php
define('AMAZON_ACCESS_KEY', 'あなたのアクセスキー');
define('AMAZON_SECRET_KEY', 'あなたのシークレットキー');
define('AMAZON_ASSOCIATE_TAG', 'asdfghj12-22');
define('GEMINI_API_KEY', 'あなたのGemini APIキー');
?>");
    echo "</pre>";
}

// cURLの確認
echo "<h2>3. cURL確認</h2>";
if (function_exists('curl_init')) {
    echo "<p style='color:green'>✅ cURLが利用可能です</p>";
} else {
    echo "<p style='color:red'>❌ cURLが利用できません</p>";
}

// ファイルパーミッション
echo "<h2>4. ディレクトリ確認</h2>";
echo "<p>現在のディレクトリ: " . __DIR__ . "</p>";
echo "<p>ファイル一覧:</p>";
echo "<ul>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        echo "<li>$file</li>";
    }
}
echo "</ul>";

echo "<h2>5. 次のステップ</h2>";
echo "<ol>";
echo "<li>config.phpを作成してAPIキーを設定</li>";
echo "<li><a href='https://cxmainte.com/tools/ai-cleaner/test-pa-api.html'>PA-APIテストページ</a>で動作確認</li>";
echo "</ol>";

echo "</body></html>";
?>