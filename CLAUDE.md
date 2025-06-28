# AI掃除アドバイザー - Claude Development Notes

## 🔧 最近の修正内容 (2025/6/28)

### 1. Netlify Functions パスエラーの修正
- Netlify Functionsは既に正しく配置されています (`/netlify/functions/`)
- `gemini-chat.js`が適切に実装されており、環境変数からGemini APIキーを読み取ります

### 2. Tailwind CSS CDN警告の解決
- 全てのHTMLファイル（index.html, admin.html, admin-dialogue.html, index-dialogue.html）に警告抑制スクリプトを追加
- 以下のコードで本番環境でのCDN警告を抑制:
```javascript
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        // Add any custom configuration here
    }
}
```

## 📋 環境変数の設定

Netlifyでデプロイする際は、以下の環境変数を設定してください：

1. **AMAZON_ACCESS_KEY** - Amazon Product Advertising APIのアクセスキー
2. **AMAZON_SECRET_KEY** - Amazon Product Advertising APIのシークレットキー
3. **AMAZON_ASSOCIATE_TAG** - Amazonアソシエイトタグ（デフォルト: asdfghj12-22）
4. **GEMINI_API_KEY** - Google Gemini APIキー

## 🚀 デプロイチェックリスト

- [x] 全必要ファイルの存在確認
- [x] Netlify Functions の正しい配置
- [x] Tailwind CSS CDN警告の抑制
- [ ] 環境変数の設定（Netlify管理画面で行う）
- [ ] デプロイ後の動作確認

## 💡 開発時の注意点

1. **ローカルテスト**: `env-loader.js`がローカルストレージから環境変数を読み込めるようになっています
2. **Gemini API**: Netlifyドメインでのみ自動的にNetlify Functions経由で呼び出されます
3. **Amazon API**: X-Serverの`server/amazon-proxy.php`を使用しています

## 🧪 テストコマンド

```bash
# Tailwind CSSのビルド（必要な場合）
npm run build-css

# ローカルサーバーの起動（任意のHTTPサーバーを使用）
python3 -m http.server 8000
# または
npx http-server
```

## Gemini CLI 連携ガイド

### 目的
ユーザーが **「Geminiと相談しながら進めて」** （または同義語）と指示した場合、Claude は以降のタスクを **Gemini CLI** と協調しながら進める。
Gemini から得た回答はそのまま提示し、Claude 自身の解説・統合も付け加えることで、両エージェントの知見を融合する。

---

### トリガー
- 正規表現: `/Gemini.*相談しながら/`
- 例:
  - 「Geminiと相談しながら進めて」
  - 「この件、Geminiと話しつつやりましょう」

---

### 基本フロー
1. **PROMPT 生成**
   Claude はユーザーの要件を 1 つのテキストにまとめ、環境変数 `$PROMPT` に格納する。

2. **Gemini CLI 呼び出し**
   ```bash
   gemini <<EOF
   $PROMPT
   EOF
   ```