import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from 'https://deno.land/x/hono@v4.0.0/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.0.0/middleware.ts';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';
import { setupRoutes } from '../../../shared/routes.ts';
import type { DbAdapter } from '../../../shared/routes.ts';

const app = new Hono().basePath('/healthcare-api');

// CORS設定（認証不要）
app.use('/*', cors({
  origin: '*',
  credentials: false,
}));

// Postgres Client DB Adapter
const postgresAdapter: DbAdapter = {
  async upsertUser(uuid: string, prefectureId: number, steps: number) {
    const client = new Client(Deno.env.get('DATABASE_URL')!);
    await client.connect();
    try {
      await client.queryObject`
        INSERT INTO "User" (uuid, "prefectureId", steps, "updatedAt")
        VALUES (${uuid}, ${prefectureId}, ${steps}, NOW())
        ON CONFLICT (uuid)
        DO UPDATE SET
          "prefectureId" = ${prefectureId},
          steps = ${steps},
          "updatedAt" = NOW()
      `;
    } finally {
      await client.end();
    }
  },

  async getPrefectureStats() {
    const client = new Client(Deno.env.get('DATABASE_URL')!);
    await client.connect();
    try {
      const result = await client.queryObject<{
        prefecture_id: number;
        avg_steps: number;
        user_count: number;
      }>`
        SELECT
          "prefectureId" as prefecture_id,
          COALESCE(AVG(steps), 0)::int as avg_steps,
          COUNT(*) as user_count
        FROM "User"
        GROUP BY "prefectureId"
      `;
      return result.rows;
    } finally {
      await client.end();
    }
  },

  async getPrefectureAvgSteps(prefectureId: number) {
    const client = new Client(Deno.env.get('DATABASE_URL')!);
    await client.connect();
    try {
      const result = await client.queryObject<{ avg_steps: number }>`
        SELECT COALESCE(AVG(steps), 0)::int as avg_steps
        FROM "User"
        WHERE "prefectureId" = ${prefectureId}
      `;
      return result.rows[0]?.avg_steps || 0;
    } finally {
      await client.end();
    }
  },
};

// 共通ルートをセットアップ
setupRoutes(app, postgresAdapter);

Deno.serve((req) => app.fetch(req));
