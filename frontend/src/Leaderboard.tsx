import { useLayoutEffect, useMemo, useRef } from 'react';
import { Clock3, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useCharacters } from './hooks/useCharacters';
import prefIcon1 from './assets/test1.png';
import prefIcon2 from './assets/test2.png';
import prefIcon3 from './assets/test3.png';

const numberFormatter = new Intl.NumberFormat('ja-JP');

const statusBadge = (status: number) => {
  if (status === 2)
    return { label: '上位30%', color: 'bg-emerald-200 text-emerald-900 border-emerald-300' };
  if (status === 1)
    return { label: '中間帯', color: 'bg-amber-200 text-amber-900 border-amber-300' };
  return { label: 'これから', color: 'bg-slate-200 text-slate-900 border-slate-300' };
};

export function Leaderboard() {
  const { data, loading, error, refetch, lastUpdated } = useCharacters({ pollingMs: 10000 });
  const topPref = data[0];
  const secondSteps = data[1]?.averageSteps ?? topPref?.averageSteps ?? 0;
  const leadGap = Math.max(0, (topPref?.averageSteps ?? 0) - secondSteps);
  const topSteps = topPref?.averageSteps || 1;

  const tileRefs = useRef(new Map<number, HTMLDivElement>());
  const positions = useRef(new Map<number, DOMRect>());
  const prefImages = useMemo(() => [prefIcon1, prefIcon2, prefIcon3], []);
  const imageMapRef = useRef(new Map<number, string>());
  const pickImage = (prefectureId: number) => {
    const cached = imageMapRef.current.get(prefectureId);
    if (cached) return cached;
    const choice = prefImages[Math.floor(Math.random() * prefImages.length)];
    imageMapRef.current.set(prefectureId, choice);
    return choice;
  };

  useLayoutEffect(() => {
    const nextPositions = new Map<number, DOMRect>();
    tileRefs.current.forEach((el, id) => {
      if (!el) return;
      nextPositions.set(id, el.getBoundingClientRect());
    });

    nextPositions.forEach((newBox, id) => {
      const prev = positions.current.get(id);
      if (!prev) return;
      const deltaX = prev.left - newBox.left;
      const deltaY = prev.top - newBox.top;
      if (deltaX === 0 && deltaY === 0) return;
      const el = tileRefs.current.get(id);
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 450ms ease, opacity 450ms ease';
        el.style.transform = '';
      });
    });

    positions.current = nextPositions;
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="rounded-3xl bg-white text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden relative">
          <div className="relative px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img src={prefIcon1} alt="キャラクター" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">
                  Live Tiles
                </p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  リーダーボード
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  10秒ごとに最新の並びへ自動更新。タイルが滑らかに動き、今の順位がひと目でわかります。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow-md hover:translate-y-[1px] transition"
              >
                <RefreshCw className="h-4 w-4" />
                今すぐ更新
              </button>
              <div className="text-xs text-slate-700 bg-slate-100 px-3 py-2 rounded-full">
                自動更新: 10秒ごと
              </div>
            </div>
          </div>
          <div className="relative border-t border-slate-200 px-6 py-3 text-xs text-slate-600 flex items-center gap-3 bg-white">
            <Clock3 className="h-4 w-4 text-slate-600" />
            <span>最終更新: {lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
          </div>
        </header>

        {error && (
          <div className="rounded-2xl bg-rose-50 text-rose-700 px-4 py-3 flex items-center gap-2 shadow-sm">
            データ取得に失敗しました: {error}
          </div>
        )}

        <div className="grid gap-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Sparkles className="h-5 w-5" />
                <span>ライブタイル</span>
                <span className="text-xs text-slate-500">全国 {data.length || 47} 県</span>
              </div>
            </div>
            {loading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-3xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-[1fr]">
                {topPref && (
                  <div
                    key={topPref.prefectureId}
                    ref={(el) => {
                      if (el) {
                        tileRefs.current.set(topPref.prefectureId, el);
                      } else {
                        tileRefs.current.delete(topPref.prefectureId);
                      }
                    }}
                    className="relative overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.08)] sm:col-span-2 xl:col-span-3"
                  >
                    <div className="relative p-6 md:p-8 flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="relative w-full lg:w-1/2">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg shadow-slate-300/40">
                          <img
                            src={pickImage(topPref.prefectureId)}
                            alt={`${topPref.name} のイメージ`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                          <span className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">
                            #1
                          </span>
                          <span className="text-sm">{topPref.name}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
                          <Trophy className="h-4 w-4 text-slate-700" />
                          Winner
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">現在の平均歩数</p>
                          <p className="text-5xl font-bold tracking-tight drop-shadow-sm text-slate-900">
                            {numberFormatter.format(topPref.averageSteps)}
                            <span className="text-xl font-semibold text-slate-500 ml-2">歩</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                            2位との差 {numberFormatter.format(leadGap)} 歩
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                            次の更新で1位をキープしよう
                          </span>
                          <span>{lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {data.slice(1).map((pref, idx) => {
                  const badge = statusBadge(pref.status);
                  const gapToTop = Math.max(0, topSteps - pref.averageSteps);
                  return (
                    <div
                      key={pref.prefectureId}
                      ref={(el) => {
                        if (el) {
                          tileRefs.current.set(pref.prefectureId, el);
                        } else {
                          tileRefs.current.delete(pref.prefectureId);
                        }
                      }}
                      className="relative overflow-hidden rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_90px_rgba(0,0,0,0.1)] will-change-transform"
                    >
                      <div className="relative h-full flex flex-col">
                        <div className="relative h-52 w-full overflow-hidden bg-slate-50">
                          <img
                            src={pickImage(pref.prefectureId)}
                            alt={`${pref.name} のイメージ`}
                            className="h-full w-full object-cover"
                          />
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
                              <p className="text-[11px] text-slate-600 mt-1">
                                あと {numberFormatter.format(gapToTop)} 歩で1位
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>あと {numberFormatter.format(gapToTop)} 歩で1位</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden bg-slate-200">
                              <div
                                className="h-full rounded-full bg-slate-700"
                                style={{ width: `${Math.max(10, Math.min(100, Math.round((pref.averageSteps / topSteps) * 100)))}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-auto flex items-center justify-end text-[11px] text-slate-500">
                            <span>{lastUpdated ? lastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!data.length && (
                  <p className="text-sm text-slate-600">データがありません</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
