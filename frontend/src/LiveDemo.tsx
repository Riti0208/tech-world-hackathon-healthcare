import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Clock3, RefreshCw, Sparkles } from 'lucide-react';
import { prefectureCharacterNameById, prefectureNameById } from './prefectures';

type LivePref = {
  prefectureId: number;
  name: string;
  characterName: string;
  averageSteps: number;
  image: string;
};

const numberFormatter = new Intl.NumberFormat('ja-JP');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function randomNormal(mean = 0, std = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function createInitialData(imageByPref: Record<number, string> = {}): LivePref[] {
  return Object.entries(prefectureNameById).map(([idStr, name]) => {
    const prefectureId = Number(idStr);
    // 平均3000を中心に大きめの分散を持たせた初期値
    const base = 3000 + randomNormal(0, 1500) + (Math.random() - 0.5) * 1200;
    const averageSteps = Math.max(0, Math.round(base));
    return {
      prefectureId,
      name,
      characterName: prefectureCharacterNameById[prefectureId] ?? 'キャラ未設定',
      averageSteps,
      image: imageByPref[prefectureId] ?? '',
    };
  });
}

export function LiveDemo() {
  const [imageByPref, setImageByPref] = useState<Record<number, string>>({});
  const [data, setData] = useState<LivePref[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const tileRefs = useRef(new Map<number, HTMLDivElement>());
  const positions = useRef(new Map<number, DOMRect>());
  const [loading, setLoading] = useState(true);

  // fetch images from API once
  useEffect(() => {
    const fetchImages = async () => {
      let map: Record<number, string> = {};
      try {
        const headers: HeadersInit = {};
        if (SUPABASE_ANON_KEY) {
          headers['apikey'] = SUPABASE_ANON_KEY;
          headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
        }
        const res = await fetch(`${API_URL}/characters`, { headers });
        if (!res.ok) throw new Error('failed');
        const json: { prefectureId: number; imageUrl?: string }[] = await res.json();
        json.forEach((item) => {
          if (item.imageUrl) {
            map[item.prefectureId] = item.imageUrl;
          }
        });
      } catch {
        // ignore fetch errors; will use empty map fallback
      } finally {
        setImageByPref(map);
        setData(createInitialData(map).sort((a, b) => b.averageSteps - a.averageSteps));
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // FLIP animation to visualize tile movement smoothly
  useLayoutEffect(() => {
    const next = new Map<number, DOMRect>();
    tileRefs.current.forEach((el, id) => {
      if (!el) return;
      next.set(id, el.getBoundingClientRect());
    });
    next.forEach((box, id) => {
      const prev = positions.current.get(id);
      if (!prev) return;
      const dx = prev.left - box.left;
      const dy = prev.top - box.top;
      if (dx === 0 && dy === 0) return;
      const el = tileRefs.current.get(id);
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 450ms ease, opacity 450ms ease';
        el.style.transform = '';
      });
    });
    positions.current = next;
  }, [data]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setData((prev) =>
        prev
          .map((item) => {
            const delta = Math.round(Math.random() * 200 - 100);
            const next = Math.max(0, item.averageSteps + delta);
            return { ...item, averageSteps: next };
          })
          .sort((a, b) => b.averageSteps - a.averageSteps),
      );
      setLastUpdated(new Date());
    }, 15000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetData = () => {
    setData(createInitialData(imageByPref).sort((a, b) => b.averageSteps - a.averageSteps));
    setLastUpdated(new Date());
  };

  const top = data[0];
  const second = data[1];
  const gap = Math.max(0, (top?.averageSteps ?? 0) - (second?.averageSteps ?? 0));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="rounded-3xl bg-white text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden relative">
          <div className="relative px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center text-sm font-semibold text-slate-700">
                Live
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">Live Demo</p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">リアルタイム平均歩数デモ</h1>
                <p className="text-sm text-slate-600 mt-1">デモ用のリアルタイム平均歩数。ルートの本番パスには影響しません。</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetData}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-2 text-xs font-semibold shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                初期化して再開
              </button>
            </div>
          </div>
          <div className="relative border-t border-slate-200 px-6 py-3 text-xs text-slate-600 flex items-center gap-3 bg-white">
            <Clock3 className="h-4 w-4 text-slate-600" />
            <span>最終更新: {lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <div className="ml-auto inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>自動更新: 15秒</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {loading && <p className="text-sm text-slate-600">画像を取得しています...</p>}
          {!loading && top && (
            <section
              className="relative overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.08)] sm:col-span-2 xl:col-span-3"
              ref={(el) => {
                if (el && top) tileRefs.current.set(top.prefectureId, el);
                else if (top) tileRefs.current.delete(top.prefectureId);
              }}
            >
              <div className="relative p-6 md:p-8 flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="relative w-full lg:w-1/2">
                  <div className="aspect-square max-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg shadow-slate-300/40">
                    {top.image ? (
                      <img src={top.image} alt={`${top.name} のイメージ`} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">画像なし</div>
                    )}
                  </div>
                  <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                    <span className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">#1</span>
                    <span className="text-sm">{top.name}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
                    <Sparkles className="h-4 w-4 text-slate-700" />
                    Winner
                  </div>
                  <p className="text-sm text-slate-600">キャラクター: {top.characterName}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">現在の平均歩数</p>
                    <p className="text-5xl font-bold tracking-tight drop-shadow-sm text-slate-900">
                      {numberFormatter.format(top.averageSteps)}
                      <span className="text-xl font-semibold text-slate-500 ml-2">歩</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                      2位との差 {numberFormatter.format(gap)} 歩
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {!loading &&
              data.slice(1).map((pref, idx) => (
                <div
                  key={pref.prefectureId}
                  ref={(el) => {
                    if (el) tileRefs.current.set(pref.prefectureId, el);
                    else tileRefs.current.delete(pref.prefectureId);
                  }}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
                >
                  <div className="relative h-full flex flex-col">
                    <div className="relative aspect-square w-full overflow-hidden bg-white border border-slate-200">
                      {pref.image ? (
                        <img src={pref.image} alt={`${pref.name} のイメージ`} className="h-full w-full object-contain p-3" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">画像なし</div>
                      )}
                      <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">
                          #{idx + 2}
                        </span>
                        <span>{pref.name}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-semibold tracking-tight text-slate-900">
                            {numberFormatter.format(pref.averageSteps)} <span className="text-sm text-slate-500">歩</span>
                          </p>
                          <p className="text-[11px] text-slate-600 mt-1">キャラ: {pref.characterName}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-end text-[11px] text-slate-500">
                        <span>{lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {!loading && data.length === 0 && <p className="text-sm text-slate-600">データがありません</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
