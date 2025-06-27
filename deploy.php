<?php
// GitHubからのWebhookを受け取ってデプロイを実行するスクリプト
// このファイルをエックスサーバーに配置して使用します

// セキュリティ: GitHubからのWebhookのみ許可
$secret = 'YOUR_WEBHOOK_SECRET'; // GitHubで設定したシークレット
$headers = getallheaders();
$hubSignature = $headers['X-Hub-Signature'] ?? '';

// ペイロードを取得
$payload = file_get_contents('php://input');

// 署名を検証
$hash = 'sha1=' . hash_hmac('sha1', $payload, $secret, false);
if (!hash_equals($hash, $hubSignature)) {
    http_response_code(403);
    die('Unauthorized');
}

// JSONをデコード
$data = json_decode($payload, true);

// mainブランチへのプッシュのみ処理
if ($data['ref'] !== 'refs/heads/main') {
    die('Not main branch');
}

// デプロイ処理
$deployDir = '/home/YOUR_USERNAME/www/cleaning-advisor';
$commands = [
    "cd $deployDir",
    'git pull origin main',
    'chmod 600 config.php',
    'chmod 644 api.php index.html .htaccess',
];

$output = [];
foreach ($commands as $command) {
    $result = shell_exec($command . ' 2>&1');
    $output[] = $command . ': ' . $result;
}

// ログを記録
file_put_contents('deploy.log', date('Y-m-d H:i:s') . "\n" . implode("\n", $output) . "\n\n", FILE_APPEND);

echo "Deploy completed successfully";