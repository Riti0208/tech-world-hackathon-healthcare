# 🚀 クイックスタートガイド

deploy2 ブランチを Supabase + Vercel にデプロイするための最速手順です。

## ステップ 1: Supabase プロジェクト作成 (5分)

1. https://supabase.com にアクセス
2. "New project" をクリック
3. プロジェクト名を入力 (例: healthcare-app)
4. Database パスワードを設定して保存
5. リージョンを選択 (Northeast Asia (Tokyo) 推奨)
6. "Create new project" をクリック

### Database URL を取得
1. Settings → Database → Connection string
2. URI タブを選択
3. `[YOUR-PASSWORD]` を実際のパスワードに置き換え
4. コピーして保存:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

## ステップ 2: Vercel プロジェクト作成 (3分)

1. https://vercel.com にアクセス
2. "Add New..." → "Project" をクリック
3. GitHub リポジトリを選択
4. **重要**: "Configure Project" で以下を設定:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. "Deploy" をクリック (初回は失敗しても OK)

### 必要な ID を取得
1. **Vercel Token**:
   - Account Settings → Tokens → Create Token
   - 名前を入力 (例: github-actions)
   - コピーして保存

2. **Org ID と Project ID**:
   - プロジェクトの Settings → General
   - スクロールダウンして確認
   - 両方コピーして保存

## ステップ 3: GitHub Secrets 設定 (2分)

### 方法 A: スクリプトを使う (推奨)
```bash
cd tech-world-hackathon-deploy2
./scripts/setup-secrets.sh
```

### 方法 B: 手動で設定
1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. "New repository secret" で以下を追加:

| Name | Value |
|------|-------|
| `SUPABASE_DATABASE_URL` | ステップ1で取得した Database URL |
| `VERCEL_TOKEN` | ステップ2で取得した Token |
| `VERCEL_ORG_ID` | ステップ2で取得した Org ID |
| `VERCEL_PROJECT_ID` | ステップ2で取得した Project ID |

## ステップ 4: Vercel 環境変数設定 (1分)

1. Vercel プロジェクト → Settings → Environment Variables
2. 以下を追加:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | Supabase Database URL | Production |
| `VITE_API_URL` | バックエンド URL (後で設定可) | Production |

## ステップ 5: デプロイ実行 (1分)

```bash
cd tech-world-hackathon-deploy2

# 変更をコミット & プッシュ
git add .
git commit -m "Initial Supabase + Vercel deployment"
git push origin deploy2

# または、スクリプトを使用
./scripts/deploy.sh "Initial deployment"
```

## デプロイ状況の確認

### GitHub Actions
https://github.com/your-username/tech-world-hackathon/actions

- ✅ 緑色のチェック: デプロイ成功
- ❌ 赤色の×: デプロイ失敗 (ログを確認)

### Vercel Dashboard
https://vercel.com/dashboard

- デプロイされた URL が表示されます
- ログで詳細を確認できます

## 次のステップ

### バックエンドのデプロイ

フロントエンドは Vercel にデプロイされましたが、バックエンド API は別途デプロイが必要です。

#### オプション 1: Railway (推奨、簡単)
```bash
# Railway CLI をインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクトを初期化
cd backend
railway init

# 環境変数を設定
railway variables set DATABASE_URL="your-supabase-url"

# デプロイ
railway up
```

Railway でデプロイ後の URL (例: `https://your-app.railway.app`) を Vercel の環境変数 `VITE_API_URL` に設定してください。

#### オプション 2: Render
1. https://render.com にアクセス
2. "New +" → "Web Service"
3. GitHub リポジトリを接続
4. 設定:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
5. Environment Variables で `DATABASE_URL` を設定

#### オプション 3: Fly.io
```bash
# Fly CLI をインストール
curl -L https://fly.io/install.sh | sh

# ログイン
fly auth login

# アプリを作成
cd backend
fly launch

# Secrets を設定
fly secrets set DATABASE_URL="your-supabase-url"

# デプロイ
fly deploy
```

### API URL の更新

バックエンドをデプロイしたら:

1. Vercel → Settings → Environment Variables
2. `VITE_API_URL` を更新 (例: `https://your-backend.railway.app`)
3. Vercel で再デプロイ (Deployments → ... → Redeploy)

## トラブルシューティング

### デプロイが失敗する
```bash
# GitHub Actions のログを確認
# Settings → Secrets が正しく設定されているか確認
```

### フロントエンドは表示されるが API が動かない
```bash
# バックエンドが正しくデプロイされているか確認
# Vercel の VITE_API_URL が正しいか確認
```

### データベース接続エラー
```bash
# Supabase の Database URL が正しいか確認
# パスワードに特殊文字がある場合は URL エンコード
```

## 参考リンク

- 詳細なデプロイ手順: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Supabase ドキュメント: https://supabase.com/docs
- Vercel ドキュメント: https://vercel.com/docs
- Railway ドキュメント: https://docs.railway.app
