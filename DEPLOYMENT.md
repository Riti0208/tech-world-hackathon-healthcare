# Supabase + Vercel デプロイメントガイド

このブランチ (deploy2) は Supabase (PostgreSQL) と Vercel へのデプロイ用です。

## 前提条件

1. Supabase アカウント: https://supabase.com
2. Vercel アカウント: https://vercel.com

## セットアップ手順

### 1. Supabase プロジェクト作成

1. Supabase ダッシュボードで新しいプロジェクトを作成
2. Database URL を取得:
   - Settings → Database → Connection string → URI
   - 形式: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Vercel プロジェクト作成

1. Vercel ダッシュボードで新しいプロジェクトを作成
2. このリポジトリを接続
3. ブランチを `deploy2` に設定
4. 必要な情報を取得:
   - Vercel Token: Account Settings → Tokens
   - Org ID: Project Settings → General
   - Project ID: Project Settings → General

### 3. GitHub Secrets 設定

リポジトリの Settings → Secrets and variables → Actions で以下を追加:

```
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### 4. Vercel 環境変数設定

Vercel プロジェクトの Settings → Environment Variables で設定:

```
VITE_API_URL=https://your-backend-url.com
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 5. バックエンドのホスティング

バックエンド (Hono API) は別途ホスティングが必要です。選択肢:

#### オプション A: Vercel Serverless Functions
```bash
cd backend
npm install -g vercel
vercel
```

#### オプション B: Railway / Render / Fly.io
- これらのサービスで Node.js アプリとしてデプロイ
- `npm start` コマンドで起動

#### オプション C: Supabase Edge Functions
```bash
# Supabase CLI をインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref your-project-ref

# デプロイ
supabase functions deploy
```

### 6. デプロイ

#### 自動デプロイ
deploy2 ブランチに push すると自動的にデプロイされます:

```bash
cd tech-world-hackathon-deploy2
git add .
git commit -m "Update configuration"
git push origin deploy2
```

#### 手動デプロイ
GitHub Actions タブから "Deploy to Supabase and Vercel" を手動実行できます。

## デプロイ後の確認

1. Supabase ダッシュボードで Database → Tables を確認
2. Vercel ダッシュボードでデプロイ状況を確認
3. フロントエンドの URL にアクセスしてテスト

## トラブルシューティング

### マイグレーションエラー
```bash
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### Vercel ビルドエラー
- ログを確認: Vercel Dashboard → Deployments → ログ確認
- ローカルでビルド確認: `cd frontend && npm run build`

### 接続エラー
- DATABASE_URL が正しいか確認
- Supabase の IP ホワイトリスト設定を確認

## ブランチ構成

- `main`: 開発環境 (PostgreSQL)
- `deploy2`: Supabase + Vercel 本番環境 (PostgreSQL) ← このブランチ
- `deploy`: Sakura Cloud 環境 (MariaDB)

## 開発ワークフロー

```bash
# deploy2 ブランチで作業
cd tech-world-hackathon-deploy2

# 変更をコミット
git add .
git commit -m "変更内容"
git push origin deploy2

# 自動的にデプロイが開始されます
```
