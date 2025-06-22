#!/bin/bash
# AI掃除アドバイザー デプロイ準備スクリプト

echo "=== デプロイ準備を開始します ==="

# 1. 不要ファイルの削除
echo "1. クリーンアップ中..."
find updated-final -name "*.bak" -delete 2>/dev/null
find updated-final -name ".DS_Store" -delete 2>/dev/null

# 2. ファイル権限の設定
echo "2. ファイル権限を設定中..."
find updated-final -type f -name "*.html" -exec chmod 644 {} \;
find updated-final -type d -exec chmod 755 {} \;

# 3. デプロイ用アーカイブの作成
echo "3. デプロイ用アーカイブを作成中..."
tar -czf ai-cleaner-deploy-$(date +%Y%m%d).tar.gz updated-final/

echo "=== デプロイ準備完了 ==="
echo "アーカイブファイル: ai-cleaner-deploy-$(date +%Y%m%d).tar.gz"