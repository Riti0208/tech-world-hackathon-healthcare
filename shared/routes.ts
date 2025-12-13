export interface DbAdapter {
  upsertUser(uuid: string, prefectureId: number, steps: number): Promise<void>;
  getPrefectureStats(): Promise<Array<{ prefecture_id: number; avg_steps: number; user_count: number }>>;
  getPrefectureAvgSteps(prefectureId: number): Promise<number>;
}

// 画像URLを生成するヘルパー関数
function getCharacterImageUrl(prefectureId: number, status: number): string {
  const paddedId = String(prefectureId).padStart(2, '0');
  return `https://vevadkrbiuoznulqgobv.supabase.co/storage/v1/object/public/healthcare-bucket/${paddedId}-${status}.jpeg`;
}

export function setupRoutes(app: any, db: DbAdapter) {
  // ヘルスチェック
  app.get('/health', (c: any) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 歩数登録
  app.post('/steps', async (c: any) => {
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

      await db.upsertUser(uuid, prefectureId, steps);
      return c.json({ success: true });
    } catch (error) {
      console.error('Error in POST /steps:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // キャラ一覧取得
  app.get('/characters', async (c: any) => {
    try {
      const prefectureStats = await db.getPrefectureStats();
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
          imageUrl: getCharacterImageUrl(prefectureId, status),
        });
      }

      return c.json(characters);
    } catch (error) {
      console.error('Error in GET /characters:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // キャラ単体取得
  app.get('/characters/:prefectureId', async (c: any) => {
    try {
      const prefectureId = parseInt(c.req.param('prefectureId'));

      if (isNaN(prefectureId) || prefectureId < 1 || prefectureId > 47) {
        return c.json({ error: 'Invalid prefectureId. Must be between 1 and 47' }, 400);
      }

      const averageSteps = await db.getPrefectureAvgSteps(prefectureId);
      const allPrefs = await db.getPrefectureStats();

      const activePrefs = allPrefs
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
        imageUrl: getCharacterImageUrl(prefectureId, status),
      });
    } catch (error) {
      console.error('Error in GET /characters/:prefectureId:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });
}
