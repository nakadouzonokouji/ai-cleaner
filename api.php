<?php
// エラー表示設定（本番環境では無効化）
error_reporting(0);
ini_set('display_errors', 0);

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
    
    // クエリに詳細情報が含まれているかチェック
    $hasDetail = false;
    $detailKeywords = ['浴槽', '排水口', '鏡', '床', '壁', 'シャワー', '換気扇', 'コンロ', 'シンク', 'レンジフード', '便器', '便座', 'タンク', '窓ガラス', '網戸', 'サッシ', 'フローリング', '畳', 'カーペット', 'フィルター', '水垢', '油汚れ', 'カビ', '尿石', '黄ばみ'];
    
    foreach ($detailKeywords as $keyword) {
        if (mb_strpos($query, $keyword) !== false) {
            $hasDetail = true;
            break;
        }
    }
    
    $prompt = "次の掃除に関する質問に対して、具体的で実践的なアドバイスを提供してください：\n\n" .
              "質問: " . $query . "\n\n";
    
    if ($hasDetail) {
        // 詳細が含まれている場合は、より具体的なアドバイスを提供
        $prompt .= "以下の形式で、非常に具体的で詳細な回答をしてください：\n";
    } else {
        // 詳細がない場合は、一般的なアドバイスを提供
        $prompt .= "以下の形式で回答してください：\n";
    }
    
    $prompt .= "1. 汚れの種類と原因の説明\n" .
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
    // 掃除関連のキーワードを生成（詳細度に応じて）
    $searchKeywords = generateDetailedCleaningKeywords($query);
    
    // Amazon PA API v5の実装
    $products = [];
    
    foreach ($searchKeywords as $keyword) {
        $searchResults = callAmazonAPI($keyword, $config);
        if ($searchResults) {
            $products = array_merge($products, $searchResults);
        }
        
        // 4個集まったら終了
        if (count($products) >= 4) {
            break;
        }
    }
    
    // 4個に絞る
    $products = array_slice($products, 0, 4);
    
    echo json_encode(['products' => $products]);
}

// 詳細な掃除関連のキーワードを生成
function generateDetailedCleaningKeywords($query) {
    $keywords = [];
    
    // 基本的な掃除用品
    $keywords[] = '掃除 洗剤 人気';
    
    // 詳細なクエリに基づいたキーワード
    // お風呂関連
    if (strpos($query, '浴槽') !== false && strpos($query, '水垢') !== false) {
        $keywords[] = '浴槽 水垢 クリーナー';
        $keywords[] = 'バスタブクレンジング';
        $keywords[] = '水垢落とし スポンジ';
    } elseif (strpos($query, '排水口') !== false) {
        $keywords[] = '排水口 クリーナー';
        $keywords[] = 'パイプユニッシュ';
        $keywords[] = '排水口 ヌメリ取り';
    } elseif (strpos($query, '鏡') !== false && strpos($query, 'ウロコ') !== false) {
        $keywords[] = '鏡 ウロコ取り';
        $keywords[] = 'クエン酸 クリーナー';
        $keywords[] = 'ダイヤモンドパッド';
    } elseif (strpos($query, 'カビ') !== false) {
        $keywords[] = 'カビキラー';
        $keywords[] = '防カビ スプレー';
        $keywords[] = 'カビ取り剤 強力';
    } elseif (strpos($query, 'シャワーヘッド') !== false) {
        $keywords[] = 'シャワーヘッド クリーナー';
        $keywords[] = 'シャワーヘッド カビ取り';
    } elseif (strpos($query, '浴') !== false || strpos($query, '風呂') !== false) {
        $keywords[] = '風呂 掃除 洗剤';
        $keywords[] = 'カビキラー';
        $keywords[] = '水垢 クリーナー';
        $keywords[] = 'バスマジックリン';
    }
    
    // キッチン関連
    if (strpos($query, '換気扇') !== false || strpos($query, 'レンジフード') !== false) {
        $keywords[] = '換気扇 フィルター';
        $keywords[] = 'マジックリン 換気扇';
        $keywords[] = '油汚れ落とし 強力';
        $keywords[] = 'レンジフード クリーナー';
    } elseif (strpos($query, 'コンロ') !== false) {
        $keywords[] = 'コンロ クリーナー';
        $keywords[] = '焦げ付き落とし';
        $keywords[] = 'IHクリーナー';
    } elseif (strpos($query, 'シンク') !== false) {
        $keywords[] = 'シンク クリーナー';
        $keywords[] = 'ステンレス クリーナー';
        $keywords[] = '排水口 ネット';
    } elseif (strpos($query, '電子レンジ') !== false) {
        $keywords[] = '電子レンジ クリーナー';
        $keywords[] = 'レンジ スチームクリーナー';
    } elseif (strpos($query, '冷蔵庫') !== false) {
        $keywords[] = '冷蔵庫 クリーナー';
        $keywords[] = '冷蔵庫 消臭剤';
    } elseif (strpos($query, 'キッチン') !== false || strpos($query, '台所') !== false) {
        $keywords[] = 'キッチン 掃除 洗剤';
        $keywords[] = '油汚れ 洗剤';
        $keywords[] = 'キッチンマジックリン';
    }
    
    // トイレ関連
    if (strpos($query, '便器') !== false && strpos($query, '尿石') !== false) {
        $keywords[] = 'サンポール';
        $keywords[] = '尿石除去剤';
        $keywords[] = 'トイレ 酸性クリーナー';
    } elseif (strpos($query, '便座') !== false) {
        $keywords[] = '便座 クリーナー';
        $keywords[] = 'トイレ 除菌シート';
    } elseif (strpos($query, 'タンク') !== false) {
        $keywords[] = 'トイレタンク クリーナー';
        $keywords[] = 'ブルーレット';
    } elseif (strpos($query, 'トイレ') !== false) {
        $keywords[] = 'トイレ 掃除 洗剤';
        $keywords[] = 'トイレマジックリン';
        $keywords[] = 'サンポール';
        $keywords[] = 'トイレブラシ';
    }
    
    // 窓関連
    if (strpos($query, '窓ガラス') !== false) {
        $keywords[] = 'ガラスマジックリン';
        $keywords[] = '窓 スクイジー';
        $keywords[] = '窓拭き ロボット';
    } elseif (strpos($query, '網戸') !== false) {
        $keywords[] = '網戸 クリーナー';
        $keywords[] = '網戸 ブラシ';
    } elseif (strpos($query, 'サッシ') !== false) {
        $keywords[] = 'サッシ クリーナー';
        $keywords[] = 'サッシ ブラシ';
    } elseif (strpos($query, '窓') !== false) {
        $keywords[] = '窓 ガラス クリーナー';
        $keywords[] = 'ガラスマジックリン';
        $keywords[] = '窓掃除 道具';
    }
    
    // 床関連
    if (strpos($query, 'フローリング') !== false) {
        $keywords[] = 'フローリング ワックス';
        $keywords[] = 'フローリング モップ';
        $keywords[] = 'フローリング クリーナー';
    } elseif (strpos($query, '畳') !== false) {
        $keywords[] = '畳 クリーナー';
        $keywords[] = '畳 ダニ取り';
    } elseif (strpos($query, 'カーペット') !== false || strpos($query, '絨毯') !== false) {
        $keywords[] = 'カーペット クリーナー';
        $keywords[] = 'カーペット シミ取り';
        $keywords[] = 'リンサークリーナー';
    }
    
    // エアコン関連
    if (strpos($query, 'エアコン') !== false || strpos($query, 'フィルター') !== false) {
        $keywords[] = 'エアコン クリーナー';
        $keywords[] = 'エアコン フィルター スプレー';
        $keywords[] = 'エアコン カビ取り';
    }
    
    return $keywords;
}

// Amazon商品を取得
function callAmazonAPI($keyword, $config) {
    // Amazon SDKを使用
    require_once 'amazon-sdk.php';
    
    try {
        // SDKを使用して商品を検索
        $products = searchAmazonProductsSDK($keyword, $config, 4);
        
        // SDKが成功した場合はその結果を返す
        if ($products !== false && !empty($products)) {
            error_log('Amazon SDK successful, found ' . count($products) . ' products');
            return $products;
        }
        
        // SDKが失敗した場合、従来のPA API実装を試す
        error_log('Amazon SDK failed, trying PA API implementation');
        require_once 'amazon-paapi.php';
        
        $api = new AmazonProductAPI($config);
        $products = $api->searchItems($keyword, 4);
        
        if ($products !== false && !empty($products)) {
            return $products;
        }
        
        // それも失敗した場合のみ、フォールバックとして簡易実装を使用
        error_log('Both SDK and PA API failed, using fallback implementation');
        require_once 'amazon-simple.php';
        return getAmazonProducts($keyword, $config);
        
    } catch (Exception $e) {
        error_log('Amazon API error: ' . $e->getMessage());
        
        // エラーが発生した場合も簡易実装にフォールバック
        require_once 'amazon-simple.php';
        return getAmazonProducts($keyword, $config);
    }
}

// 実際のAmazon PA API v5実装用の署名生成関数
function getSignatureKey($key, $dateStamp, $regionName, $serviceName) {
    $kDate = hash_hmac('sha256', $dateStamp, 'AWS4' . $key, true);
    $kRegion = hash_hmac('sha256', $regionName, $kDate, true);
    $kService = hash_hmac('sha256', $serviceName, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
    return $kSigning;
}