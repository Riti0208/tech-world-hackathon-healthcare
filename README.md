# Healthcare App - TECH WORLD Hackathon 2025

## 技術スタック

| サービス | 技術 | ポート |
|---------|------|--------|
| Frontend | React 19.2.1 + Vite 7.2.7 + Tailwind CSS 4.0 | 5173 |
| Backend | Hono 4.10.8 + Prisma 7.1.0 | 3000 |
| Database | PostgreSQL 16 | 5432 |

## クイックスタート

```bash
# リポジトリクローン
git clone https://github.com/Riti0208/tech-world-hackathon-healthcare.git
cd tech-world-hackathon-healthcare

# コンテナビルド & 起動（初回は自動的にマイグレーション実行）
docker-compose up -d --build

# アクセス
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000/health
```

初回起動時は、バックエンドが自動的に以下を実行します：
- Prisma Client生成
- データベースマイグレーション
- アプリケーション起動

## 開発コマンド

```bash
# ログ確認
docker-compose logs -f

# 停止
docker-compose down

# Prisma Studio
docker-compose exec backend npx prisma studio
```

## トラブルシューティング

### バックエンドが起動しない場合

```bash
# バックエンドログを確認
docker-compose logs backend -f

# コンテナを完全削除して再ビルド
docker-compose down -v
docker-compose up -d --build
```
