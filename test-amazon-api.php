<?php
// Amazon PA API のテストとデバッグ
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'amazon-paapi.php';

$config = require 'config.php';

echo "<h1>Amazon PA API テスト</h1>";

// 設定の確認
echo "<h2>1. API設定の確認</h2>";
echo "アクセスキー: " . substr($config['paapi_access_key'], 0, 10) . "...<br>";
echo "シークレットキー: " . substr($config['paapi_secret_key'], 0, 10) . "...<br>";
echo "アソシエイトタグ: " . $config['paapi_partner_tag'] . "<br>";
echo "ホスト: " . $config['paapi_host'] . "<br>";
echo "リージョン: " . $config['paapi_region'] . "<br><br>";

// APIテスト
echo "<h2>2. API呼び出しテスト</h2>";

try {
    $api = new AmazonProductAPI($config);
    
    // シンプルな検索
    echo "検索キーワード: '掃除 洗剤'<br>";
    $products = $api->searchItems('掃除 洗剤', 4);
    
    if ($products === false) {
        echo "❌ API呼び出しが失敗しました<br>";
        echo "エラーログを確認してください<br>";
    } else if (empty($products)) {
        echo "❌ 商品が見つかりませんでした<br>";
    } else {
        echo "✅ " . count($products) . "個の商品が見つかりました<br><br>";
        
        echo "<h3>商品リスト:</h3>";
        foreach ($products as $i => $product) {
            echo ($i + 1) . ". " . $product['title'] . "<br>";
            echo "ASIN: " . $product['asin'] . "<br>";
            echo "画像: " . ($product['image'] ? '✅あり' : '❌なし') . "<br>";
            echo "URL: <a href='" . $product['url'] . "' target='_blank'>商品ページ</a><br><br>";
        }
    }
} catch (Exception $e) {
    echo "❌ エラー: " . $e->getMessage() . "<br>";
}

// 直接API呼び出しテスト
echo "<h2>3. 直接API呼び出しテスト（デバッグ用）</h2>";

$timestamp = gmdate('Ymd\THis\Z');
$payload = [
    'PartnerTag' => $config['paapi_partner_tag'],
    'PartnerType' => 'Associates',
    'Keywords' => 'ウタマロクリーナー',
    'SearchIndex' => 'All',
    'ItemCount' => 1,
    'Resources' => ['ItemInfo.Title', 'Images.Primary.Large'],
    'Marketplace' => 'www.amazon.co.jp'
];

echo "ペイロード:<pre>";
echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "</pre>";

// 署名の作成をテスト
$api = new AmazonProductAPI($config);
$result = $api->searchItems('ウタマロクリーナー', 1);

echo "<br>結果:<pre>";
if ($result !== false) {
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo "APIエラーが発生しました";
}
echo "</pre>";
?>