# AI掃除マニュアル

## 概要
AI技術を活用した、誰でも簡単に使える掃除マニュアルアプリです。

## 特徴
- 5つのエリア（浴室、トイレ、リビング、キッチン、窓）+ 床の掃除方法
- 各項目に「軽い汚れ」「ひどい汚れ」の2パターン対応
- スマートフォン対応のレスポンシブデザイン
- 必要な道具と手順を分かりやすく表示

## 重要な技術仕様

### 商品表示仕様
- **商品数**: 各ページ15個（洗剤5個、道具5個、保護具5個）
- **テンプレート**: `kitchen/ih-heavy.html`が完璧なテンプレート
- **データソース**: `products-master.json`から商品データを取得
- **画像**: Amazon商品の実際の画像URLを使用（placeholderはエラー時のフォールバックのみ）

### Amazon Product Advertising API
- **SDK**: PA-API SDKを使用
- **アソシエイトタグ**: `asdfghj12-22`
- **商品リンク形式**: `https://www.amazon.co.jp/dp/{ASIN}?tag=asdfghj12-22`

### ページ構成
- **全53ページ**: 各場所×汚れレベル（軽い/ひどい）
- **統一レイアウト**: 全ページih-heavy.htmlと同じ構造
- **フィードバック機能**: Good/Badボタンで掃除方法の評価を収集

## URL
https://cxmainte.com/tools/ai-cleaner/

## ファイル構成
- 全51個のHTMLファイル
- styles.css（共通スタイルシート）
- 各エリアごとにフォルダ分け

## デプロイ
GitHub Actionsを使用してエックスサーバーに自動デプロイ

## 必要なSecrets設定
GitHubリポジトリのSettings > Secrets and variablesに以下を設定：
- FTP_SERVER: FTPサーバーのアドレス
- FTP_USERNAME: FTPユーザー名
- FTP_PASSWORD: FTPパスワード