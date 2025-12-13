#!/bin/bash

# クイックデプロイスクリプト
# 使用方法: ./scripts/deploy.sh "コミットメッセージ"

set -e

COMMIT_MSG="${1:-Update deployment configuration}"

echo "🚀 デプロイを開始します..."
echo "================================"
echo ""

# 変更があるか確認
if [[ -z $(git status -s) ]]; then
    echo "✅ 変更がありません"
else
    echo "📝 変更をコミットします: $COMMIT_MSG"
    git add .
    git commit -m "$COMMIT_MSG"
fi

echo ""
echo "⬆️  deploy2 ブランチにプッシュします..."
git push origin deploy2

echo ""
echo "✅ デプロイが開始されました!"
echo ""
echo "📊 デプロイ状況を確認:"
echo "  GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo "  Vercel: https://vercel.com/dashboard"
