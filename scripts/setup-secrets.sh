#!/bin/bash

# GitHub Secrets セットアップスクリプト
# 使用方法: ./scripts/setup-secrets.sh

set -e

echo "🔐 GitHub Secrets セットアップ"
echo "================================"
echo ""

# GitHub CLI がインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "インストール: brew install gh"
    exit 1
fi

# ログイン確認
if ! gh auth status &> /dev/null; then
    echo "GitHub にログインしてください:"
    gh auth login
fi

echo "📝 必要な情報を入力してください:"
echo ""

# Supabase 設定
read -p "Supabase Database URL: " SUPABASE_DB_URL
read -p "Vercel Token: " VERCEL_TOKEN
read -p "Vercel Org ID: " VERCEL_ORG_ID
read -p "Vercel Project ID: " VERCEL_PROJECT_ID

echo ""
echo "🚀 Secrets を設定中..."

# GitHub Secrets を設定
gh secret set SUPABASE_DATABASE_URL -b "$SUPABASE_DB_URL"
gh secret set VERCEL_TOKEN -b "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID -b "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID -b "$VERCEL_PROJECT_ID"

echo ""
echo "✅ GitHub Secrets の設定が完了しました!"
echo ""
echo "次のステップ:"
echo "1. Vercel プロジェクトで環境変数を設定"
echo "2. git push origin deploy2 でデプロイ開始"
