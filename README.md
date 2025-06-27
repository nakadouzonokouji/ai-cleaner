# お掃除アドバイザーアプリ

AIを活用した掃除方法提案サービスです。

## GitHub Actions自動デプロイ設定

### 必要なGitHub Secrets

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：

1. **API関連**
   - `GEMINI_API_KEY`: Gemini APIキー
   - `AMAZON_ASSOCIATE_TAG`: Amazonアソシエイトタグ
   - `PAAPI_ACCESS_KEY`: Amazon PA APIアクセスキー
   - `PAAPI_SECRET_KEY`: Amazon PA APIシークレットキー

2. **FTP接続情報**
   - `FTP_SERVER`: FTPサーバーアドレス (例: sv123.xserver.jp)
   - `FTP_USERNAME`: FTPユーザー名
   - `FTP_PASSWORD`: FTPパスワード
   - `FTP_SERVER_DIR`: デプロイ先ディレクトリ (例: /public_html/cleaning-advisor/)

### 自動デプロイの流れ

1. mainブランチにプッシュ
2. GitHub Actionsが自動実行
3. config.phpがSecretsから生成
4. FTPでエックスサーバーにアップロード

## 機能

- テキスト入力による掃除相談
- Gemini APIによるAI掃除アドバイス
- Amazon売れ筋商品の表示（アソシエイトリンク付き）
- レスポンシブデザイン
- SEO対策済み

## ファイル構成

```
cleaning-advisor-app/
├── index.html      # メインのHTMLファイル
├── api.php         # APIプロキシ（Gemini/Amazon）
├── config.php      # API設定ファイル（要保護）
├── .htaccess       # セキュリティ設定
└── README.md       # このファイル
```

## エックスサーバーへのデプロイ手順

### 1. ファイルのアップロード

1. エックスサーバーのファイルマネージャーまたはFTPクライアントを使用
2. public_html内に新しいディレクトリを作成（例：`cleaning-advisor`）
3. すべてのファイルをアップロード

### 2. パーミッション設定

```bash
# ファイルのパーミッション
config.php: 600 または 640
api.php: 644
index.html: 644
.htaccess: 644

# ディレクトリのパーミッション
ディレクトリ: 755
```

### 3. config.phpの保護

以下のいずれかの方法で保護：

**方法1：public_html外に配置**
```php
// api.phpを修正
$config = require_once '../private/config.php';
```

**方法2：.htaccessで保護（実装済み）**
現在の.htaccessで直接アクセスを禁止しています。

### 4. エラーログの設定

.htaccess内のエラーログパスを実際のパスに変更：
```
php_value error_log /home/あなたのユーザー名/logs/error.log
```

### 5. PHPバージョンの確認

エックスサーバーのコントロールパネルでPHP 7.4以上を選択

### 6. SSL設定

エックスサーバーの無料SSLを有効化し、HTTPSでアクセスできるようにする

## セキュリティ注意事項

1. **APIキーの管理**
   - config.phpは必ず保護してください
   - 定期的にAPIキーを更新してください

2. **使用量制限**
   - Gemini APIの使用量制限を設定
   - Amazon PA APIの呼び出し制限に注意

3. **アクセス制限**
   - 必要に応じてIPアドレス制限を追加
   - レート制限の実装を検討

## トラブルシューティング

### エラーが表示される場合

1. PHPエラーログを確認
2. ブラウザの開発者ツールでエラーを確認
3. APIキーが正しく設定されているか確認

### 商品が表示されない場合

現在はダミーデータを表示しています。実際のAmazon商品を表示するには：
1. Amazon PA API v5のSDKをインストール
2. api.phpのcallAmazonAPI関数を実装

## ライセンス

個人使用に限ります。APIキーは他者と共有しないでください。