# AI掃除アドバイザー 商品マスターデータ管理システム

## 概要

このシステムは、AI掃除アドバイザーの全53ページ（44HTMLファイル）で使用する商品情報を一元管理し、Amazon PA-APIを使用して自動的に最新のベストセラー商品を取得・更新します。

## システム構成

### 1. データ構造

```
products-master-complete.json
├── kitchen (キッチン)
│   ├── ih (IHクッキングヒーター)
│   │   ├── light (軽い汚れ)
│   │   │   ├── cleaners (洗剤 5商品)
│   │   │   ├── tools (道具 5商品)
│   │   │   └── protection (保護具 5商品)
│   │   └── heavy (ひどい汚れ)
│   │       ├── cleaners (洗剤 5商品)
│   │       ├── tools (道具 5商品)
│   │       └── protection (保護具 5商品)
│   └── ... (他のキッチンエリア)
├── bathroom (バスルーム)
├── living (リビング)
├── floor (床)
├── toilet (トイレ)
└── window (窓)
```

### 2. スクリプト

- **collect-all-products.js** - Amazon PA-APIから商品データを収集
- **generate-page-html.js** - 商品HTMLを生成するユーティリティ
- **update-all-html-files.js** - 全HTMLファイルを更新
- **test-system.js** - システムテスト

## 使用方法

### 初期設定

1. 環境変数を設定（またはGitHub Secretsに登録）:
```bash
export AMAZON_ACCESS_KEY="your-access-key"
export AMAZON_SECRET_KEY="your-secret-key"
export AMAZON_ASSOCIATE_TAG="asdfghj12-22"
```

### 商品データの収集

```bash
# 全商品データを収集（約660商品）
node scripts/collect-all-products.js
```

このコマンドは以下を実行します：
- 各場所・エリア・レベルごとに適切な検索クエリを生成
- Amazon PA-APIで商品を検索
- 高評価・ベストセラー商品を優先的に選定
- `products-master-complete.json`に保存

### HTMLファイルの更新

```bash
# 全HTMLファイルを更新
node scripts/update-all-html-files.js

# 特定の場所のみ更新
node scripts/update-all-html-files.js --location kitchen

# ドライラン（更新対象の確認のみ）
node scripts/update-all-html-files.js --dry-run
```

### システムテスト

```bash
node scripts/test-system.js
```

## 自動更新（GitHub Actions）

`.github/workflows/update-all-products.yml`により、以下のタイミングで自動実行されます：

- **定期実行**: 毎週月曜日 午前2時（UTC）
- **手動実行**: GitHub ActionsのUIから手動トリガー可能

### 手動実行方法

1. GitHubリポジトリの「Actions」タブを開く
2. 「Update All Products Master Data」を選択
3. 「Run workflow」をクリック
4. オプションで特定の場所を指定可能

## 商品選定ロジック

各商品カテゴリごとに以下の優先順位で選定：

1. **スコアリング要素**:
   - 商品評価（★4.0以上を重視）
   - ベストセラーマーク（+30ポイント）
   - Amazon's Choiceマーク（+20ポイント）

2. **検索戦略**:
   - 関連性順で検索
   - 評価順で検索
   - 結果を統合してスコアリング

3. **最終選定**:
   - 各カテゴリ上位5商品を選択
   - 重複を除外
   - 価格が適正範囲内（¥198〜¥3,000程度）

## トラブルシューティング

### マスターデータが生成されない

1. 環境変数が正しく設定されているか確認
2. PA-APIの認証情報が有効か確認
3. API制限に達していないか確認

### HTMLファイルが更新されない

1. マスターデータファイルが存在するか確認
2. HTMLファイルの構造が変更されていないか確認
3. エラーログを確認

### 商品が表示されない

1. ASINが有効か確認
2. アソシエイトタグが正しいか確認
3. 商品画像URLが正しいか確認

## 統計情報

- **場所数**: 6
- **エリア数**: 22
- **HTMLページ数**: 44
- **必要な商品数**: 660（各ページ15商品）

## 注意事項

- Amazon PA-APIには利用制限があります（1秒1リクエスト）
- 商品情報は定期的に更新することを推奨
- 手動で商品を変更した場合、次回の自動更新で上書きされます