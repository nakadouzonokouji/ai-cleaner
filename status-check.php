<?php
// アプリの状態確認用ページ

echo "<h1>アプリ状態確認</h1>";

// 1. config.phpの存在確認
echo "<h2>1. 設定ファイル</h2>";
if (file_exists('config.php')) {
    echo "✅ config.php: 存在します<br>";
    $config = require_once 'config.php';
    
    // APIキーの存在確認（最初の5文字のみ表示）
    if (!empty($config['gemini_api_key'])) {
        echo "✅ Gemini APIキー: " . substr($config['gemini_api_key'], 0, 5) . "...<br>";
    } else {
        echo "❌ Gemini APIキー: 未設定<br>";
    }
    
    if (!empty($config['amazon_associate_tag'])) {
        echo "✅ Amazonアソシエイトタグ: " . $config['amazon_associate_tag'] . "<br>";
    } else {
        echo "❌ Amazonアソシエイトタグ: 未設定<br>";
    }
} else {
    echo "❌ config.php: 存在しません<br>";
    echo "GitHub Actionsの自動デプロイを実行してください<br>";
}

// 2. 必要なファイルの確認
echo "<h2>2. 必要なファイル</h2>";
$requiredFiles = ['index.html', 'api.php', '.htaccess'];
foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "✅ $file: 存在します<br>";
    } else {
        echo "❌ $file: 存在しません<br>";
    }
}

// 3. PHPの設定確認
echo "<h2>3. PHP設定</h2>";
echo "PHPバージョン: " . phpversion() . "<br>";
echo "cURL: " . (function_exists('curl_init') ? '✅ 有効' : '❌ 無効') . "<br>";
echo "JSON: " . (function_exists('json_decode') ? '✅ 有効' : '❌ 無効') . "<br>";

// 4. アプリへのリンク
echo "<h2>4. アプリへのアクセス</h2>";
echo '<a href="index.html" style="font-size: 1.2em;">→ アプリを開く</a><br><br>';

echo "<hr>";
echo "<p>問題がある場合は、GitHub Actionsから再デプロイしてください。</p>";
?>