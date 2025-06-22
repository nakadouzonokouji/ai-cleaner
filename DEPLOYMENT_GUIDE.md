# AI掃除アドバイザー デプロイガイド

## 重要事項
- 商品画像を表示するには**HTTPサーバー経由**でアクセスする必要があります
- ローカルファイル（file://）では画像が表示されません

## デプロイオプション

### 1. レンタルサーバー / VPS
```bash
# ファイルをアップロード
scp -r updated-final/* user@server:/var/www/html/ai-cleaner/
```

### 2. GitHub Pages
- GitHubリポジトリにプッシュ
- Settings → Pages → Source を設定
- https://username.github.io/ai-cleaner/ でアクセス

### 3. Netlify
- https://www.netlify.com/ にアクセス
- updated-finalフォルダをドラッグ&ドロップ
- 自動的にURLが発行される

### 4. Amazon S3 + CloudFront
```bash
# S3バケットにアップロード
aws s3 sync updated-final/ s3://your-bucket-name/ --acl public-read
```

## ローカルテスト方法
```bash
cd updated-final
python3 -m http.server 8000
# ブラウザで http://localhost:8000 にアクセス
```

## 構成
- 総ページ数: 46ページ
- 総商品数: 690商品（各ページ15商品）
- カテゴリー: bathroom, kitchen, toilet, floor, window, living