import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from 'https://deno.land/x/hono@v4.0.0/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.0.0/middleware.ts';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

const app = new Hono();

const getDbClient = async () => {
  const client = new Client(Deno.env.get('DATABASE_URL')!);
  await client.connect();
  return client;
};

app.use('/*', cors());

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/steps', async (c) => {
  const client = await getDbClient();
  try {
    const body = await c.req.json();
    const { uuid, prefectureId, steps } = body;

    if (!uuid || typeof uuid !== 'string') {
      return c.json({ error: 'Invalid uuid' }, 400);
    }
    if (typeof prefectureId !== 'number' || prefectureId < 1 || prefectureId > 47) {
      return c.json({ error: 'Invalid prefectureId. Must be between 1 and 47' }, 400);
    }
    if (typeof steps !== 'number' || steps < 0) {
      return c.json({ error: 'Invalid steps. Must be a non-negative number' }, 400);
    }

    await client.queryObject`
      INSERT INTO "User" (uuid, "prefectureId", steps, "updatedAt")
      VALUES (${uuid}, ${prefectureId}, ${steps}, NOW())
      ON CONFLICT (uuid)
      DO UPDATE SET
        "prefectureId" = ${prefectureId},
        steps = ${steps},
        "updatedAt" = NOW()
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in POST /steps:', error);
    return c.json({ error: 'Internal server error' }, 500);
  } finally {
    await client.end();
  }
});

app.get('/characters', async (c) => {
  const client = await getDbClient();
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

    const prefectureStats = result.rows;
    const activePrefs = prefectureStats
      .filter(p => p.avg_steps > 0)
      .sort((a, b) => b.avg_steps - a.avg_steps);

    const statusMap = new Map<number, number>();
    const top30Percent = Math.ceil(activePrefs.length * 0.3);

    activePrefs.forEach((pref, index) => {
      if (index < top30Percent) {
        statusMap.set(pref.prefecture_id, 2);
      } else if (index < activePrefs.length / 2) {
        statusMap.set(pref.prefecture_id, 1);
      } else {
        statusMap.set(pref.prefecture_id, 1);
      }
    });

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
  } finally {
    await client.end();
  }
});

app.get('/characters/:prefectureId', async (c) => {
  const client = await getDbClient();
  try {
    const prefectureId = parseInt(c.req.param('prefectureId'));

    if (isNaN(prefectureId) || prefectureId < 1 || prefectureId > 47) {
      return c.json({ error: 'Invalid prefectureId. Must be between 1 and 47' }, 400);
    }

    const result = await client.queryObject<{ avg_steps: number }>`
      SELECT COALESCE(AVG(steps), 0)::int as avg_steps
      FROM "User"
      WHERE "prefectureId" = ${prefectureId}
    `;

    const averageSteps = result.rows[0]?.avg_steps || 0;

    const allPrefs = await client.queryObject<{
      prefecture_id: number;
      avg_steps: number;
    }>`
      SELECT
        "prefectureId" as prefecture_id,
        COALESCE(AVG(steps), 0)::int as avg_steps
      FROM "User"
      GROUP BY "prefectureId"
    `;

    const activePrefs = allPrefs.rows
      .filter(p => p.avg_steps > 0)
      .sort((a, b) => b.avg_steps - a.avg_steps);

    const top30Percent = Math.ceil(activePrefs.length * 0.3);
    const rank = activePrefs.findIndex(p => p.prefecture_id === prefectureId);

    let status = 0;
    if (rank !== -1 && averageSteps > 0) {
      if (rank < top30Percent) {
        status = 2;
      } else if (rank < activePrefs.length / 2) {
        status = 1;
      } else {
        status = 1;
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
  } finally {
    await client.end();
  }
});

Deno.serve(app.fetch);
