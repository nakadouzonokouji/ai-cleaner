<?php
// エラー表示設定（一時的にデバッグ有効）
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS設定
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 設定ファイルを読み込み
if (!file_exists('config.php')) {
    http_response_code(500);
    die(json_encode(['error' => 'Configuration file not found']));
}

try {
    $config = require_once 'config.php';
} catch (Exception $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to load configuration: ' . $e->getMessage()]));
}

// リクエストデータを取得
$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : '';

switch ($action) {
    case 'getCleaningAdvice':
        getCleaningAdvice($input['query'], $config);
        break;
    case 'searchProducts':
        searchAmazonProducts($input['query'], $config);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

// Gemini APIを使用して掃除アドバイスを取得
function getCleaningAdvice($query, $config) {
    $apiKey = $config['gemini_api_key'];
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;
    
    $prompt = "次の掃除に関する質問に対して、具体的で実践的なアドバイスを提供してください：\n\n" .
              "質問: " . $query . "\n\n" .
              "以下の形式で回答してください：\n" .
              "1. 汚れの種類と原因の説明\n" .
              "2. 必要な道具や洗剤\n" .
              "3. 具体的な掃除手順（ステップバイステップ）\n" .
              "4. 注意点やコツ\n" .
              "5. 予防方法\n\n" .
              "回答は日本語で、わかりやすく簡潔にまとめてください。";
    
    $data = [
        'contents' => [[
            'parts' => [[
                'text' => $prompt
            ]]
        ]]
    ];
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    // cURLを使用してAPIを呼び出し
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen(json_encode($data)),
        'Referer: https://cxmainte.com/'
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // SSL証明書の検証を一時的に無効化
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($result === FALSE) {
        http_response_code(500);
        echo json_encode(['error' => 'Gemini API error: ' . $error]);
        return;
    }
    
    if ($httpCode !== 200) {
        http_response_code(500);
        echo json_encode(['error' => 'Gemini API returned status code: ' . $httpCode]);
        return;
    }
    
    $response = json_decode($result, true);
    $advice = $response['candidates'][0]['content']['parts'][0]['text'];
    
    echo json_encode(['advice' => $advice]);
}

// Amazon PA APIを使用して商品を検索
function searchAmazonProducts($query, $config) {
    // 掃除関連のキーワードを生成
    $searchKeywords = generateCleaningKeywords($query);
    
    // Amazon PA API v5の実装
    $products = [];
    
    foreach ($searchKeywords as $keyword) {
        $searchResults = callAmazonAPI($keyword, $config);
        if ($searchResults) {
            $products = array_merge($products, $searchResults);
        }
        
        // 10個集まったら終了
        if (count($products) >= 10) {
            break;
        }
    }
    
    // 10個に絞る
    $products = array_slice($products, 0, 10);
    
    echo json_encode(['products' => $products]);
}

// 掃除関連のキーワードを生成
function generateCleaningKeywords($query) {
    $keywords = [];
    
    // 基本的な掃除用品
    $keywords[] = '掃除 洗剤 人気';
    
    // クエリに基づいたキーワード
    if (strpos($query, '換気扇') !== false) {
        $keywords[] = '換気扇 掃除 洗剤';
        $keywords[] = '油汚れ クリーナー';
        $keywords[] = 'マジックリン 換気扇';
    }
    
    if (strpos($query, '浴') !== false || strpos($query, '風呂') !== false) {
        $keywords[] = '風呂 掃除 洗剤';
        $keywords[] = 'カビキラー';
        $keywords[] = '水垢 クリーナー';
        $keywords[] = 'バスマジックリン';
    }
    
    if (strpos($query, '窓') !== false) {
        $keywords[] = '窓 ガラス クリーナー';
        $keywords[] = 'ガラスマジックリン';
        $keywords[] = '窓掃除 道具';
    }
    
    if (strpos($query, 'トイレ') !== false) {
        $keywords[] = 'トイレ 掃除 洗剤';
        $keywords[] = 'トイレマジックリン';
        $keywords[] = 'サンポール';
        $keywords[] = 'トイレブラシ';
    }
    
    if (strpos($query, 'キッチン') !== false || strpos($query, '台所') !== false) {
        $keywords[] = 'キッチン 掃除 洗剤';
        $keywords[] = '油汚れ 洗剤';
        $keywords[] = 'キッチンマジックリン';
    }
    
    return $keywords;
}

// Amazon PA API呼び出し（簡易実装）
function callAmazonAPI($keyword, $config) {
    // ここでは実際のAPI呼び出しの代わりにダミーデータを返します
    // 実際の実装では、Amazon PA API v5のSDKを使用する必要があります
    
    $dummyProducts = [
        [
            'title' => '【Amazon.co.jp限定】 激落ちくん ' . $keyword,
            'price' => '¥' . rand(300, 2000),
            'rating' => number_format(rand(35, 50) / 10, 1),
            'image' => 'https://via.placeholder.com/150',
            'url' => 'https://www.amazon.co.jp/dp/B' . str_pad(rand(1, 999999999), 9, '0', STR_PAD_LEFT) . '/?tag=' . $config['amazon_associate_tag'],
            'salesRank' => rand(1, 100)
        ]
    ];
    
    return $dummyProducts;
}

// 実際のAmazon PA API v5実装用の署名生成関数
function getSignatureKey($key, $dateStamp, $regionName, $serviceName) {
    $kDate = hash_hmac('sha256', $dateStamp, 'AWS4' . $key, true);
    $kRegion = hash_hmac('sha256', $regionName, $kDate, true);
    $kService = hash_hmac('sha256', $serviceName, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    return $kSigning;
}