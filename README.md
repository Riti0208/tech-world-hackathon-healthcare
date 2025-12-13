# Healthcare App - TECH WORLD Hackathon 2025

## 技術スタック

| サービス | 技術 | ポート |
|---------|------|--------|
| Frontend | React 19.2.1 + Vite 7.2.7 + Tailwind CSS 4.0 | 5173 |
| Backend | Hono 4.10.8 + Prisma 7.1.0 | 3000 |
| Database | PostgreSQL 16 | 5432 |

## クイックスタート

```bash
# 起動
docker-compose up -d

# データベースマイグレーション
docker-compose exec backend npx prisma migrate dev --name init

# アクセス
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

## 開発コマンド

```bash
# ログ確認
docker-compose logs -f

# 停止
docker-compose down

# Prisma Studio
docker-compose exec backend npx prisma studio
```
