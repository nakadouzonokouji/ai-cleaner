# 🧹 AI掃除アドバイザー - 対話型掃除相談システム

AIとの対話を通じて最適な掃除方法と商品を提案する次世代型アドバイザー

## 🚀 機能概要

- **💬 対話型相談**: AIが質問を重ねて具体的な掃除箇所を特定
- **🎯 的確なアドバイス**: Gemini AIが箇所に応じた詳細な掃除方法を提案
- **🛒 売れ筋商品推薦**: Amazonの人気商品4点を画像付きで表示
- **📊 質問分析**: よくある質問や人気の掃除箇所を管理画面で分析

## 🎯 使い方

### 1. 掃除の悩みを入力
```
例：「キッチンを掃除したい」
```

### 2. AIが詳細を質問
```
AIの応答：「キッチンのどの部分でしょうか？」
- シンク
- コンロ  
- 換気扇
- 冷蔵庫
```

### 3. 具体的な箇所を回答
```
ユーザー：「シンクです」
```

### 4. AIが掃除方法を提案
- 詳細な手順
- 必要な道具
- 所要時間
- 注意事項

### 5. おすすめ商品を表示
- 売れ筋商品4点
- 商品画像・価格
- Amazonで購入ボタン
- もっと見るボタン

## 🛠️ 技術スタック

### フロントエンド
- **HTML5/CSS3**: レスポンシブデザイン
- **JavaScript (ES6+)**: 対話型インターフェース
- **Tailwind CSS**: モダンなスタイリング

### AI・API統合
- **Google Gemini AI**: 自然な対話と掃除方法の生成
- **Amazon Product API**: 売れ筋商品情報の取得
- **アソシエイトプログラム**: 収益化対応

### バックエンド
- **PHP/Node.js**: APIプロキシサーバー
- **ローカルストレージ**: 質問ログの保存

## 📦 プロジェクト構成

```
ai-cleaner/
├── index.html          # メインアプリ（対話型UI）
├── admin.html          # 管理者ダッシュボード（分析機能）
├── app.js             # 対話ロジック・AI連携
├── config.js          # 商品データベース（売れ筋商品）
├── amazon-config.js   # Amazon API設定
├── amazon-api.js      # 商品取得ロジック
├── styles.css         # スタイルシート
└── server/            # APIプロキシ
    └── amazon-proxy.php
```

## 🚀 セットアップ

### 1. 環境変数の設定

```env
AMAZON_ACCESS_KEY=あなたのアクセスキー
AMAZON_SECRET_KEY=あなたのシークレットキー
AMAZON_ASSOCIATE_TAG=asdfghj12-22
GEMINI_API_KEY=あなたのGemini APIキー
```

### 2. デプロイ

#### Xサーバーの場合
```bash
git push origin main
# GitHub Actionsで自動デプロイ
```

#### Netlifyの場合
1. リポジトリを接続
2. 環境変数を設定
3. デプロイ実行

### 3. アクセスURL

- **メインアプリ**: `https://cxmainte.com/tools/ai-cleaner/`
- **管理画面**: `https://cxmainte.com/tools/ai-cleaner/admin.html`

## 📊 管理者機能

### 質問分析ダッシュボード
- **よくある質問TOP10**: どんな掃除の悩みが多いか
- **人気の掃除箇所**: シンク、コンロ、浴槽などのランキング
- **時間帯別アクセス**: いつ利用されているか
- **商品クリック率**: どの商品が人気か

### データエクスポート
- CSV形式で分析データをダウンロード
- 月次レポートの自動生成

## 🛒 商品推薦の仕組み

1. **売れ筋優先**: Amazonランキング上位商品を表示
2. **カテゴリマッチ**: 掃除箇所に適した商品を選定
3. **価格帯考慮**: 手頃な価格の商品を中心に
4. **レビュー重視**: 高評価商品を優先表示

## 🔐 セキュリティ

- APIキーは環境変数で管理
- プロキシ経由でAPI通信
- 入力値のサニタイズ
- HTTPS通信の強制

## 📈 今後の展開

- [ ] 画像アップロード対応
- [ ] 掃除のビフォーアフター投稿
- [ ] コミュニティ機能
- [ ] プロのアドバイス連携

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 📞 お問い合わせ

- **バグ報告**: [GitHub Issues](https://github.com/nakadouzonokouji/ai-cleaner/issues)
- **機能要望**: [GitHub Discussions](https://github.com/nakadouzonokouji/ai-cleaner/discussions)

---

### 🌟 特徴

✅ **自然な対話**: AIが状況を理解して最適な提案  
✅ **売れ筋商品**: Amazonで人気の商品を厳選  
✅ **収益化対応**: アソシエイトタグで収益化可能  
✅ **分析機能**: ユーザーのニーズを把握  
✅ **簡単導入**: 環境変数設定だけで即利用可能  

© 2025 CX Mainte - AI掃除アドバイザー