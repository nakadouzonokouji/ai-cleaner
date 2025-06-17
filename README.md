# AI掃除マニュアル

## 概要
AI技術を活用した、誰でも簡単に使える掃除マニュアルアプリです。

## 特徴
- 5つのエリア（浴室、トイレ、リビング、キッチン、窓）+ 床の掃除方法
- 各項目に「軽い汚れ」「ひどい汚れ」の2パターン対応
- スマートフォン対応のレスポンシブデザイン
- 必要な道具と手順を分かりやすく表示

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