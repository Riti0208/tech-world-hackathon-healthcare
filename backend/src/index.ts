import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = new Hono();

// CORS設定
app.use('/*', cors({
  origin: ['http://localhost:5173', 'https://healthcare-frontend-prod.s3.isk01.sakurastorage.jp'],
  credentials: true,
}));

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DBテスト用エンドポイント
app.get('/test/users', async (c) => {
  try {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
    return c.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error in GET /test/users:', error);
    return c.json({ error: 'Database error', details: String(error) }, 500);
  }
});

// テストユーザー作成
app.post('/test/create-user', async (c) => {
  try {
    const uuid = `test-${Date.now()}`;
    const prefectureId = Math.floor(Math.random() * 47) + 1;
    const steps = Math.floor(Math.random() * 10000);

    const user = await prisma.user.create({
      data: {
        uuid,
        prefectureId,
        steps,
      },
    });

    return c.json({
      success: true,
      message: 'Test user created',
      user
    });
  } catch (error) {
    console.error('Error in POST /test/create-user:', error);
    return c.json({ error: 'Database error', details: String(error) }, 500);
  }
});

// 県対抗歩数バトル API Routes

// 歩数登録
app.post('/steps', async (c) => {
  try {
    const body = await c.req.json();
    const { uuid, prefectureId, steps } = body;

    // バリデーション
    if (!uuid || typeof uuid !== 'string') {
      return c.json({ error: 'Invalid uuid' }, 400);
    }
    if (typeof prefectureId !== 'number' || prefectureId < 1 || prefectureId > 47) {
      return c.json({ error: 'Invalid prefectureId. Must be between 1 and 47' }, 400);
    }
    if (typeof steps !== 'number' || steps < 0) {
      return c.json({ error: 'Invalid steps. Must be a non-negative number' }, 400);
    }

    // Upsert（存在すれば更新、なければ作成）
    await prisma.user.upsert({
      where: { uuid },
      update: {
        prefectureId,
        steps,
      },
      create: {
        uuid,
        prefectureId,
        steps,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in POST /steps:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// キャラ一覧取得
app.get('/characters', async (c) => {
  try {
    // 全県のデータを取得し、平均歩数を計算
    const prefectureStats = await prisma.$queryRaw<Array<{
      prefecture_id: number;
      avg_steps: number;
      user_count: number;
    }>>`
      SELECT
        "prefectureId" as prefecture_id,
        COALESCE(AVG(steps), 0)::int as avg_steps,
        COUNT(*) as user_count
      FROM "User"
      GROUP BY "prefectureId"
    `;

    // 平均歩数が1以上の県を抽出してソート
    const activePrefs = prefectureStats
      .filter(p => p.avg_steps > 0)
      .sort((a, b) => b.avg_steps - a.avg_steps);

    // ステータス計算
    const statusMap = new Map<number, number>();
    const top30Percent = Math.ceil(activePrefs.length * 0.3);

    activePrefs.forEach((pref, index) => {
      if (index < top30Percent) {
        statusMap.set(pref.prefecture_id, 2); // 上位30%
      } else if (index < activePrefs.length / 2) {
        statusMap.set(pref.prefecture_id, 1); // 中間
      } else {
        statusMap.set(pref.prefecture_id, 1); // 中間（30%以降は1か0に分ける）
      }
    });

    // 全47県分のデータを作成
    const characters = [];
    for (let prefectureId = 1; prefectureId <= 47; prefectureId++) {
      const stat = prefectureStats.find(p => p.prefecture_id === prefectureId);
      const averageSteps = stat?.avg_steps || 0;
      const status = statusMap.get(prefectureId) || 0;

      characters.push({
        prefectureId,
        averageSteps,
        status,
      });
    }

    return c.json(characters);
  } catch (error) {
    console.error('Error in GET /characters:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// キャラ単体取得
app.get('/characters/:prefectureId', async (c) => {
  try {
    const prefectureId = parseInt(c.req.param('prefectureId'));

    // バリデーション
    if (isNaN(prefectureId) || prefectureId < 1 || prefectureId > 47) {
      return c.json({ error: 'Invalid prefectureId. Must be between 1 and 47' }, 400);
    }

    // 指定県の平均歩数を計算
    const result = await prisma.$queryRaw<Array<{
      avg_steps: number;
    }>>`
      SELECT COALESCE(AVG(steps), 0)::int as avg_steps
      FROM "User"
      WHERE "prefectureId" = ${prefectureId}
    `;

    const averageSteps = result[0]?.avg_steps || 0;

    // 全県のデータを取得してステータスを計算
    const allPrefs = await prisma.$queryRaw<Array<{
      prefecture_id: number;
      avg_steps: number;
    }>>`
      SELECT
        "prefectureId" as prefecture_id,
        COALESCE(AVG(steps), 0)::int as avg_steps
      FROM "User"
      GROUP BY "prefectureId"
    `;

    const activePrefs = allPrefs
      .filter(p => p.avg_steps > 0)
      .sort((a, b) => b.avg_steps - a.avg_steps);

    const top30Percent = Math.ceil(activePrefs.length * 0.3);
    const rank = activePrefs.findIndex(p => p.prefecture_id === prefectureId);

    let status = 0;
    if (rank !== -1 && averageSteps > 0) {
      if (rank < top30Percent) {
        status = 2; // 上位30%
      } else if (rank < activePrefs.length / 2) {
        status = 1; // 中間
      } else {
        status = 1; // 中間（30%以降は1か0に分ける）
      }
    }

    return c.json({
      prefectureId,
      averageSteps,
      status,
    });
  } catch (error) {
    console.error('Error in GET /characters/:prefectureId:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

const port = parseInt(process.env.PORT || '3000');

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});
