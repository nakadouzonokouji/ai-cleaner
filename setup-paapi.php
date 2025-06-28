<?php
// Amazon PA API セットアップガイド
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amazon PA API セットアップガイド</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
        .step {
            background: #f5f5f5;
            border-left: 4px solid #007cba;
            padding: 15px;
            margin: 15px 0;
        }
        code {
            background: #f0f0f0;
            padding: 2px 5px;
            font-family: Consolas, Monaco, monospace;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        pre {
            background: #f8f8f8;
            border: 1px solid #ddd;
            padding: 10px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>Amazon PA API v5 セットアップガイド</h1>
    
    <div class="warning">
        <strong>重要:</strong> Amazon PA APIを使用するには、以下の手順に従って正しい認証情報を設定する必要があります。
    </div>

    <h2>ステップ 1: Amazonアソシエイトアカウントの確認</h2>
    <div class="step">
        <p>1. <a href="https://affiliate.amazon.co.jp/" target="_blank">Amazonアソシエイトセントラル</a>にログイン</p>
        <p>2. アカウントが承認されていることを確認（売上実績が必要）</p>
        <p>3. アソシエイトタグ（例: asdfghj12-22）をメモ</p>
    </div>

    <h2>ステップ 2: PA API認証情報の取得</h2>
    <div class="step">
        <p>1. アソシエイトセントラルで「ツール」→「Product Advertising API」をクリック</p>
        <p>2. 「認証情報を管理」をクリック</p>
        <p>3. 新しい認証情報を作成：</p>
        <ul>
            <li>アクセスキー</li>
            <li>シークレットキー</li>
        </ul>
        <p>4. 認証情報を安全な場所に保存（シークレットキーは一度しか表示されません）</p>
    </div>

    <h2>ステップ 3: GitHub Secretsの設定</h2>
    <div class="step">
        <p>GitHubリポジトリの設定で以下のSecretsを追加：</p>
        <pre>
PAAPI_ACCESS_KEY    : （Amazonから取得したアクセスキー）
PAAPI_SECRET_KEY    : （Amazonから取得したシークレットキー）
PAAPI_PARTNER_TAG   : asdfghj12-22（あなたのアソシエイトタグ）
PAAPI_HOST          : webservices.amazon.co.jp
PAAPI_REGION        : us-west-2
        </pre>
    </div>

    <h2>ステップ 4: デプロイの実行</h2>
    <div class="step">
        <p>1. GitHubで変更をプッシュ</p>
        <p>2. Actionsタブで自動デプロイを確認</p>
        <p>3. config.phpが自動生成される</p>
    </div>

    <h2>ステップ 5: 動作確認</h2>
    <div class="step">
        <p>以下のURLで動作を確認：</p>
        <ul>
            <li><a href="test-amazon-api.php">PA APIテストページ</a></li>
            <li><a href="status-check.php">アプリ状態確認</a></li>
            <li><a href="index.html">本番アプリ</a></li>
        </ul>
    </div>

    <h2>トラブルシューティング</h2>
    <div class="warning">
        <h3>よくあるエラー：</h3>
        <p><strong>InvalidSignature:</strong> シークレットキーが間違っています</p>
        <p><strong>InvalidPartnerTag:</strong> アソシエイトタグが間違っているか、アカウントが無効です</p>
        <p><strong>RequestThrottled:</strong> APIリクエストが制限を超えています（1秒に1回まで）</p>
        <p><strong>ItemNotFound:</strong> 検索結果が見つかりません</p>
    </div>

    <h2>PA API利用条件</h2>
    <div class="step">
        <p><strong>重要な制限事項：</strong></p>
        <ul>
            <li>過去30日間に3件以上の売上がないとAPIが利用できません</li>
            <li>リクエストは1秒あたり1回まで</li>
            <li>1日あたり8,640リクエストまで（初期段階）</li>
            <li>売上実績に応じて制限が緩和されます</li>
        </ul>
    </div>

    <?php
    // 現在の設定を確認
    if (file_exists('config.php')) {
        $config = require 'config.php';
        echo '<div class="success">';
        echo '<h3>現在の設定状態：</h3>';
        echo '<p>✅ config.phpが存在します</p>';
        if (!empty($config['paapi_access_key'])) {
            echo '<p>✅ PA APIアクセスキー: 設定済み</p>';
        } else {
            echo '<p>❌ PA APIアクセスキー: 未設定</p>';
        }
        if (!empty($config['paapi_secret_key'])) {
            echo '<p>✅ PA APIシークレットキー: 設定済み</p>';
        } else {
            echo '<p>❌ PA APIシークレットキー: 未設定</p>';
        }
        echo '</div>';
    }
    ?>

    <hr>
    <p><a href="index.html">← アプリに戻る</a></p>
</body>
</html>