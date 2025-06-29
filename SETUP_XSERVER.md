# X-Server設定ガイド

## 🔧 APIキーの設定方法

### 1. config.phpファイルの作成

X-Serverのファイルマネージャーまたはwebftpで以下の場所にファイルを作成：

```
/public_html/tools/ai-cleaner/server/config.php
```

### 2. config.phpの内容

以下の内容をコピーして、実際のAPIキーに置き換えてください：

```php
<?php
// Amazon Product Advertising API 設定
define('AMAZON_ACCESS_KEY', 'あなたのアクセスキー');
define('AMAZON_SECRET_KEY', 'あなたのシークレットキー');
define('AMAZON_ASSOCIATE_TAG', 'asdfghj12-22');

// Gemini API 設定
define('GEMINI_API_KEY', 'あなたのGemini APIキー');

// または配列形式でも可
return [
    'amazon_access_key' => 'あなたのアクセスキー',
    'amazon_secret_key' => 'あなたのシークレットキー',
    'amazon_associate_tag' => 'asdfghj12-22',
    'gemini_api_key' => 'あなたのGemini APIキー'
];
?>
```

### 3. ファイルのパーミッション

セキュリティのため、config.phpのパーミッションを`600`または`644`に設定してください。

### 4. 動作確認

1. `https://cxmainte.com/tools/ai-cleaner/test-pa-api.html` にアクセス
2. 環境変数のステータスを確認
3. 「PA-APIで画像を取得」ボタンをクリック

## 📋 必要なファイル構成

```
/public_html/tools/ai-cleaner/
├── index.html
├── server/
│   ├── amazon-proxy.php  ← GitHubから
│   ├── gemini-proxy.php  ← GitHubから
│   └── config.php        ← 手動で作成（APIキー設定）
└── その他のファイル...
```

## 🔒 セキュリティ注意事項

1. **config.phpは絶対にGitにコミットしない**
2. **APIキーは第三者に公開しない**
3. **定期的にAPIキーをローテーションする**

## 🚀 デプロイ手順

1. GitHubから最新のコードをダウンロード
2. X-Serverにアップロード
3. config.phpを作成してAPIキーを設定
4. 動作確認

## ❓ トラブルシューティング

### APIキーエラーが出る場合

1. config.phpが正しい場所にあるか確認
2. APIキーが正しくコピーされているか確認
3. ファイルの文字コードがUTF-8か確認

### 画像が表示されない場合

1. ブラウザの開発者ツール（F12）でエラーを確認
2. Networkタブで404エラーがないか確認
3. ConsoleタブでJavaScriptエラーを確認

### CORSエラーが出る場合

amazon-proxy.phpの4行目を確認：
```php
header('Access-Control-Allow-Origin: https://cxmainte.com');
```

必要に応じて、ワイルドカードに変更：
```php
header('Access-Control-Allow-Origin: *');
```