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
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const api = new Hono();

// ユーザー関連
api.get('/users', async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

api.post('/users', async (c) => {
  const body = await c.req.json();
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
    },
  });
  return c.json(user, 201);
});

// ヘルスレコード関連
api.get('/health-records', async (c) => {
  const userId = c.req.query('userId');
  const records = await prisma.healthRecord.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { recordedAt: 'desc' },
  });
  return c.json(records);
});

api.post('/health-records', async (c) => {
  const body = await c.req.json();
  const record = await prisma.healthRecord.create({
    data: {
      userId: body.userId,
      recordType: body.recordType,
      data: body.data,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
    },
  });
  return c.json(record, 201);
});

app.route('/api', api);

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
