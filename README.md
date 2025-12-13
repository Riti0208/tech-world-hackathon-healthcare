# TECH WORLD Hackathon 2025 - Healthcare App

## 技術スタック

### ローカル開発

```
┌─────────────────────────────────────────────────────────┐
│                   docker-compose                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  frontend   │  │   backend   │  │     db      │     │
│  │ React+Vite  │  │ Hono+Mastra │  │ PostgreSQL  │     │
│  │   :5173     │  │ +Prisma     │  │   :5432     │     │
│  │             │  │   :3000     │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

| サービス | 技術 | ポート |
|---------|------|--------|
| Frontend | React 19.2.1 + Vite 7.2.7 + Tailwind CSS 4.0 | 5173 |
| Backend | Hono 4.10.8 + Mastra 1.0.0-beta.0 + Prisma 7.1.0 | 3000 |
| Database | PostgreSQL 16 | 5432 |
| Runtime | Node.js 22.20.0 LTS | - |

---

## 🚀 クイックスタート

### 必要環境

- Docker & Docker Compose
- Git

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd tech-world-hackathon
```

2. **Docker Composeで起動**

```bash
docker-compose up -d
```

3. **データベースのマイグレーション**

```bash
docker-compose exec backend npx prisma migrate dev --name init
```

4. **アプリケーションにアクセス**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

---

## 📁 ディレクトリ構成

```
tech-world-hackathon/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── lib/
│   │   │   └── client.ts     # Hono RPC Client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/
    ├── src/
    │   ├── routes/
    │   └── index.ts
    ├── prisma/
    │   └── schema.prisma
    ├── Dockerfile
    ├── package.json
    └── tsconfig.json
```

---

## 🛠️ 開発コマンド

### Docker Compose操作

```bash
# 起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down

# 完全削除（ボリューム含む）
docker-compose down -v
```

### データベース操作

```bash
# マイグレーション作成
docker-compose exec backend npx prisma migrate dev --name <migration-name>

# Prisma Studio起動
docker-compose exec backend npx prisma studio

# スキーマのプッシュ（開発時のみ）
docker-compose exec backend npx prisma db push
```

### バックエンド開発

```bash
# コンテナに入る
docker-compose exec backend sh

# 依存関係の追加
docker-compose exec backend npm install <package-name>
```

### フロントエンド開発

```bash
# コンテナに入る
docker-compose exec frontend sh

# 依存関係の追加
docker-compose exec frontend npm install <package-name>
```

---

## 🔌 API エンドポイント

### ヘルスチェック

```
GET /health
```

### ユーザー

```
GET  /api/users           # ユーザー一覧取得
POST /api/users           # ユーザー作成
```

### ヘルスレコード

```
GET  /api/health-records  # ヘルスレコード一覧取得
POST /api/health-records  # ヘルスレコード作成
```

---

## 🎨 フロントエンド

### Tailwind CSS v4

本プロジェクトではTailwind CSS v4を使用しています。設定は`src/index.css`の`@theme`ディレクティブで行います。

```css
@theme {
  --color-primary: #3b82f6;
  --radius-md: 0.5rem;
}
```

### Hono RPC Client

型安全なAPIクライアントとして`@hono/client`を使用しています。

```typescript
import { apiClient } from '@/lib/client';

// 使用例
const response = await apiClient.api.users.$get();
const users = await response.json();
```

---

## ⚠️ セキュリティ警告

### React CVE-2025-55182 (React2Shell) - CVSS 10.0

本プロジェクトは**React 19.2.1**を使用しており、この脆弱性に対応済みです。

### Node.js セキュリティ

Node.js 22.20.0 LTSを使用しており、最新のセキュリティパッチが適用されています。

---

## 📝 本番環境（さくらのクラウド）

### デプロイ構成

| コンポーネント | サービス | 備考 |
|--------------|---------|------|
| Frontend | オブジェクトストレージ + Web Accelerator | 静的ファイル配信 |
| Backend | AppRun 共用型 | ゼロスケール対応 |
| Database | DBアプライアンス (PostgreSQL) | VPCルータ経由で接続 |
| LLM | AI Engine API (gpt-oss-120b) | OpenAI互換 |

### コスト見積もり

| サービス | 月額 |
|---------|------|
| オブジェクトストレージ | ¥495 |
| Web Accelerator | ¥0 (500GiB無料) |
| AppRun 共用型 | ~¥5,000 |
| VPCルータ (スタンダード) | ¥2,200 |
| DBアプライアンス (10GB) | ¥2,700 |
| AI Engine API | 従量課金 |
| **合計** | **~¥10,400/月** |

---

## 🔗 参考リンク

### フレームワーク・ライブラリ
- [Hono](https://hono.dev/)
- [Hono RPC Client](https://hono.dev/docs/guides/rpc)
- [Mastra](https://mastra.ai/)
- [Prisma](https://www.prisma.io/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### さくらのクラウド
- [さくらのクラウド マニュアル](https://manual.sakura.ad.jp/cloud/)
- [AppRun ドキュメント](https://manual.sakura.ad.jp/cloud/apprun/)
- [AI Engine API](https://manual.sakura.ad.jp/cloud/ai-engine/)

---

## 📄 ライセンス

MIT License
