<?php
// Amazon SDK テストとデバッグ
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'amazon-sdk.php';

$config = require 'config.php';

?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amazon SDK テスト</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 { color: #333; }
        .status { 
            padding: 10px; 
            margin: 10px 0; 
            border-radius: 4px; 
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb;
        }
        .error { 
            background: #f8d7da; 
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .product {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            gap: 15px;
        }
        .product img {
            width: 150px;
            height: 150px;
            object-fit: contain;
        }
        .product-info {
            flex: 1;
        }
        pre {
            background: #f8f8f8;
            padding: 10px;
            overflow-x: auto;
        }
        .config-info {
            background: #f0f0f0;
            padding: 10px;
            margin: 10px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>Amazon SDK テストページ</h1>
    
    <h2>1. 設定情報の確認</h2>
    <div class="config-info">
        <?php
        echo "PA API アクセスキー: " . (isset($config['paapi_access_key']) ? substr($config['paapi_access_key'], 0, 10) . "..." : "未設定") . "<br>";
        echo "PA API シークレットキー: " . (isset($config['paapi_secret_key']) ? "設定済み" : "未設定") . "<br>";
        echo "PA API パートナータグ: " . ($config['paapi_partner_tag'] ?? "未設定") . "<br>";
        echo "PA API ホスト: " . ($config['paapi_host'] ?? "未設定") . "<br>";
        echo "PA API リージョン: " . ($config['paapi_region'] ?? "未設定") . "<br>";
        ?>
    </div>
    
    <h2>2. SDK動作テスト</h2>
    
    <?php
    try {
        $sdk = new AmazonProductSDK($config);
        echo '<div class="status success">✅ SDKインスタンスの作成に成功しました</div>';
        
        // テスト1: 基本的な検索
        echo '<h3>テスト1: 「掃除 洗剤」で検索</h3>';
        $results1 = $sdk->searchItems('掃除 洗剤', 4);
        
        if ($results1 === false) {
            echo '<div class="status error">❌ 検索が失敗しました（API認証エラーの可能性）</div>';
        } elseif (empty($results1)) {
            echo '<div class="status error">❌ 商品が見つかりませんでした</div>';
        } else {
            echo '<div class="status success">✅ ' . count($results1) . '個の商品が見つかりました</div>';
            
            foreach ($results1 as $product) {
                echo '<div class="product">';
                if (!empty($product['image'])) {
                    echo '<img src="' . htmlspecialchars($product['image']) . '" alt="' . htmlspecialchars($product['title']) . '">';
                }
                echo '<div class="product-info">';
                echo '<h4>' . htmlspecialchars($product['title']) . '</h4>';
                echo '<p>ASIN: ' . htmlspecialchars($product['asin']) . '</p>';
                if (!empty($product['price'])) {
                    echo '<p>価格: ' . htmlspecialchars($product['price']) . '</p>';
                }
                if (!empty($product['manufacturer'])) {
                    echo '<p>メーカー: ' . htmlspecialchars($product['manufacturer']) . '</p>';
                }
                echo '<p><a href="' . htmlspecialchars($product['url']) . '" target="_blank">Amazonで見る</a></p>';
                echo '</div>';
                echo '</div>';
            }
        }
        
        // テスト2: 特定商品の検索
        echo '<h3>テスト2: 「カビキラー」で検索</h3>';
        $results2 = $sdk->searchItems('カビキラー', 2);
        
        if ($results2 === false) {
            echo '<div class="status error">❌ 検索が失敗しました</div>';
        } elseif (empty($results2)) {
            echo '<div class="status error">❌ 商品が見つかりませんでした</div>';
        } else {
            echo '<div class="status success">✅ ' . count($results2) . '個の商品が見つかりました</div>';
            
            foreach ($results2 as $product) {
                echo '<div class="product">';
                if (!empty($product['image'])) {
                    echo '<img src="' . htmlspecialchars($product['image']) . '" alt="' . htmlspecialchars($product['title']) . '">';
                }
                echo '<div class="product-info">';
                echo '<h4>' . htmlspecialchars($product['title']) . '</h4>';
                echo '<p>ASIN: ' . htmlspecialchars($product['asin']) . '</p>';
                echo '</div>';
                echo '</div>';
            }
        }
        
    } catch (Exception $e) {
        echo '<div class="status error">❌ エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    ?>
    
    <h2>3. API統合テスト</h2>
    <?php
    // api.phpの関数をテスト
    echo '<h3>api.php経由でのテスト</h3>';
    
    $testProducts = callAmazonAPI('窓 掃除', $config);
    
    if ($testProducts === false) {
        echo '<div class="status error">❌ API統合テストが失敗しました</div>';
    } elseif (empty($testProducts)) {
        echo '<div class="status error">❌ 商品が見つかりませんでした</div>';
    } else {
        echo '<div class="status success">✅ ' . count($testProducts) . '個の商品が取得できました（api.php経由）</div>';
        echo '<pre>';
        foreach ($testProducts as $product) {
            echo "- " . $product['title'] . " (ASIN: " . $product['asin'] . ")\n";
        }
        echo '</pre>';
    }
    ?>
    
    <hr>
    <p>
        <a href="index.html">← アプリに戻る</a> | 
        <a href="test-amazon-api.php">PA APIテスト</a> | 
        <a href="setup-paapi.php">セットアップガイド</a>
    </p>
</body>
</html>