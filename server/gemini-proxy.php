<?php
/**
 * Gemini API プロキシ
 * クライアントからのリクエストを受けてGemini APIを呼び出す
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONSリクエストへの対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// POSTリクエストのみ受け付ける
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// 環境変数または設定ファイルからAPIキーを取得
$geminiApiKey = $_ENV['GEMINI_API_KEY'] ?? '';

// 設定ファイルから読み込む場合
if (empty($geminiApiKey) && file_exists(__DIR__ . '/config.php')) {
    $config = include(__DIR__ . '/config.php');
    $geminiApiKey = $config['gemini_api_key'] ?? '';
}

if (empty($geminiApiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'Gemini API key not configured']);
    exit();
}

// リクエストボディを取得
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';
$context = $input['context'] ?? [];

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit();
}

// プロンプトを構築
$prompt = buildCleaningPrompt($message, $context);

// Gemini APIを呼び出す
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$geminiApiKey}";

$requestData = [
    'contents' => [[
        'parts' => [[
            'text' => $prompt
        ]]
    ]],
    'generationConfig' => [
        'temperature' => 0.7,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 1024,
    ],
    'safetySettings' => [
        [
            'category' => 'HARM_CATEGORY_HARASSMENT',
            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
        ],
        [
            'category' => 'HARM_CATEGORY_HATE_SPEECH',
            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
        ],
        [
            'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
        ],
        [
            'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Gemini API error', 'details' => $response]);
    exit();
}

$data = json_decode($response, true);
$responseText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

// 応答を構造化
$structuredResponse = parseGeminiResponse($responseText, $message);

echo json_encode($structuredResponse);

/**
 * 掃除用のプロンプトを構築
 */
function buildCleaningPrompt($userMessage, $context) {
    $previousMessage = $context['previousMessage'] ?? 'なし';
    $location = $context['location'] ?? '未指定';
    $dirtType = $context['dirtType'] ?? '未指定';
    
    return "あなたは親切で専門的な掃除アドバイザーです。以下のルールに従って回答してください：

1. ユーザーの質問に対して、具体的で実用的な掃除方法を提案する
2. 必要な道具、手順、所要時間、ポイントを含める
3. 安全に関する注意事項も必ず含める
4. 質問が曖昧な場合は、詳細を確認するための選択肢を提供する
5. 回答は日本語で、敬語を使用する

コンテキスト:
- 前の会話: {$previousMessage}
- 現在の掃除場所: {$location}
- 汚れの種類: {$dirtType}

ユーザーの質問: {$userMessage}

回答は以下の形式のJSONで返してください：
{
  \"type\": \"advice\" または \"question\",
  \"message\": \"メインの回答（掃除方法の詳細）\",
  \"options\": [{\"text\": \"選択肢テキスト\", \"value\": \"選択肢の値\"}],
  \"showProducts\": true/false,
  \"location\": \"掃除場所（kitchen/bathroom/toilet/floor/window等）\",
  \"dirtType\": \"汚れの種類（油汚れ/カビ/水垢/尿石等）\"
}";
}

/**
 * Geminiの応答を解析
 */
function parseGeminiResponse($responseText, $userMessage) {
    // JSONとして解析を試みる
    if (preg_match('/\{[\s\S]*\}/', $responseText, $matches)) {
        $json = json_decode($matches[0], true);
        if ($json !== null) {
            return $json;
        }
    }
    
    // フォールバック：テキストから構造化データを生成
    $lowerMessage = mb_strtolower($userMessage);
    
    $location = 'general';
    $dirtType = '汚れ';
    
    if (strpos($lowerMessage, 'キッチン') !== false || 
        strpos($lowerMessage, '換気扇') !== false || 
        strpos($lowerMessage, 'コンロ') !== false) {
        $location = 'kitchen';
        $dirtType = '油汚れ';
    } elseif (strpos($lowerMessage, '風呂') !== false || 
              strpos($lowerMessage, '浴室') !== false || 
              strpos($lowerMessage, 'シャワー') !== false) {
        $location = 'bathroom';
        $dirtType = strpos($lowerMessage, 'カビ') !== false ? 'カビ' : '水垢';
    } elseif (strpos($lowerMessage, 'トイレ') !== false) {
        $location = 'toilet';
        $dirtType = '尿石';
    }
    
    $isQuestion = strpos($responseText, '？') !== false && mb_strlen($responseText) < 200;
    
    return [
        'type' => $isQuestion ? 'question' : 'advice',
        'message' => $responseText,
        'showProducts' => !$isQuestion,
        'location' => $location,
        'dirtType' => $dirtType
    ];
}