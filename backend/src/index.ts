import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { setupRoutes, type DbAdapter } from '../../shared/routes.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = new Hono();

// CORS設定
app.use('/*', cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// Prisma DB Adapter
const prismaAdapter: DbAdapter = {
  async upsertUser(uuid: string, prefectureId: number, steps: number) {
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
  },

  async getPrefectureStats() {
    const result = await prisma.$queryRaw<Array<{
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
    return result;
  },

  async getPrefectureAvgSteps(prefectureId: number) {
    const result = await prisma.$queryRaw<Array<{
      avg_steps: number;
    }>>`
      SELECT COALESCE(AVG(steps), 0)::int as avg_steps
      FROM "User"
      WHERE "prefectureId" = ${prefectureId}
    `;
    return result[0]?.avg_steps || 0;
  },
};

// 共通ルートをセットアップ
setupRoutes(app, prismaAdapter);

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
