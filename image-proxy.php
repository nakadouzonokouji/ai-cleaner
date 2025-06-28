<?php
/**
 * Amazon画像プロキシ
 * Amazonの画像を取得して表示
 */

// エラー表示を無効化
error_reporting(0);
ini_set('display_errors', 0);

// 画像URLパラメータを取得
$imageUrl = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($imageUrl)) {
    // デフォルトの画像を返す
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    
    // 1x1の透明なPNG画像
    $img = imagecreatetruecolor(1, 1);
    imagesavealpha($img, true);
    $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
    imagefill($img, 0, 0, $transparent);
    imagepng($img);
    imagedestroy($img);
    exit;
}

// URLの検証（Amazonの画像URLのみ許可）
if (!preg_match('/^https:\/\/(m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//', $imageUrl)) {
    http_response_code(403);
    exit('Forbidden');
}

// キャッシュディレクトリ
$cacheDir = __DIR__ . '/cache/images/';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

// キャッシュファイル名を生成
$cacheFile = $cacheDir . md5($imageUrl) . '.jpg';

// キャッシュが存在し、24時間以内の場合は使用
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=86400');
    header('X-Cache: HIT');
    readfile($cacheFile);
    exit;
}

// cURLで画像を取得
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $imageUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CURLOPT_HTTPHEADER => [
        'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language: ja,en-US;q=0.9,en;q=0.8',
        'Referer: https://www.amazon.co.jp/',
        'Sec-Fetch-Dest: image',
        'Sec-Fetch-Mode: no-cors',
        'Sec-Fetch-Site: cross-site'
    ]
]);

$imageData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode !== 200 || empty($imageData)) {
    // エラーの場合はプレースホルダー画像を生成
    header('Content-Type: image/png');
    header('Cache-Control: no-cache');
    
    $img = imagecreatetruecolor(200, 200);
    $bg = imagecolorallocate($img, 240, 240, 240);
    $text = imagecolorallocate($img, 150, 150, 150);
    imagefill($img, 0, 0, $bg);
    
    // "画像なし"テキストを描画
    $font = 3;
    $text_width = imagefontwidth($font) * strlen('No Image');
    $text_height = imagefontheight($font);
    $x = (200 - $text_width) / 2;
    $y = (200 - $text_height) / 2;
    imagestring($img, $font, $x, $y, 'No Image', $text);
    
    imagepng($img);
    imagedestroy($img);
    exit;
}

// 画像をキャッシュに保存
file_put_contents($cacheFile, $imageData);

// 適切なContent-Typeを設定
if (strpos($contentType, 'image/') !== false) {
    header('Content-Type: ' . $contentType);
} else {
    // Content-Typeが不明な場合は画像形式を推測
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_buffer($finfo, $imageData);
    finfo_close($finfo);
    header('Content-Type: ' . $mimeType);
}

header('Cache-Control: public, max-age=86400');
header('X-Cache: MISS');

// 画像を出力
echo $imageData;