import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Clock3, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useCharacters } from './hooks/useCharacters';
import mapSvg from './assets/map-full.svg?raw';

const numberFormatter = new Intl.NumberFormat('ja-JP');

const statusBadge = (status: number) => {
  if (status === 2) return { label: '上位30%', color: 'bg-emerald-200 text-emerald-900 border-emerald-300' };
  if (status === 1) return { label: '中間帯', color: 'bg-amber-200 text-amber-900 border-amber-300' };
  return { label: 'これから', color: 'bg-slate-200 text-slate-900 border-slate-300' };
};

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'rank' | 'map'>('rank');

  const {
    data: rankData,
    loading: rankLoading,
    error: rankError,
    refetch: refetchRank,
    lastUpdated: rankLastUpdated,
  } = useCharacters({
    pollingMs: 60000,
  });

  const {
    data: mapData,
    loading: mapLoading,
    error: mapError,
    refetch: refetchMap,
    lastUpdated: mapLastUpdated,
  } = useCharacters({
    autoFetch: false,
  });

  const topPref = rankData[0];
  const secondSteps = rankData[1]?.averageSteps ?? topPref?.averageSteps ?? 0;
  const leadGap = Math.max(0, (topPref?.averageSteps ?? 0) - secondSteps);
  const topSteps = topPref?.averageSteps || 1;

  const tileRefs = useRef(new Map<number, HTMLDivElement>());
  const positions = useRef(new Map<number, DOMRect>());
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapFetched = useRef(false);
  const mapInjected = useRef(false);
  const pickImage = (_prefectureId: number, imageUrl?: string) => imageUrl ?? '';

  // FLIP animation for rank tiles
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
  }, [rankData]);

  // Apply status colors to the SVG map after data changes
  useEffect(() => {
    if (!mapInjected.current) return;
    const colorByStatus = (status: number) => {
      if (status === 2) return '#34d399';
      if (status === 1) return '#f59e0b';
      return '#94a3b8';
    };
    const root = mapRef.current;
    if (!root) return;
    mapData.forEach((pref) => {
      const target = root.querySelector(`[data-code="${pref.prefectureId}"]`) as SVGElement | null;
      if (!target) return;
      const color = colorByStatus(pref.status);
      target.setAttribute('fill', color);
      target.setAttribute('stroke', '#0f172a');
      target.setAttribute('stroke-width', '0.6');
      target.querySelectorAll('*').forEach((child) => {
        (child as SVGElement).setAttribute('fill', color);
      });
    });
  }, [mapData]);

  // Inject SVG once whenマップタブを開いたとき
  useEffect(() => {
    if (activeTab !== 'map') return;
    if (mapInjected.current) return;
    if (!mapRef.current) return;
    mapRef.current.innerHTML = mapSvg.replace(/class="prefecture"/g, 'class="prefecture pref-hoverable"');
    mapInjected.current = true;
  }, [activeTab]);

  // Fetch map data automatically the first time the map tab is opened
  useEffect(() => {
    if (activeTab !== 'map') return;
    if (mapFetched.current) return;
    mapFetched.current = true;
    refetchMap();
  }, [activeTab, refetchMap]);

  const renderRankTab = () => (
    <div className="grid gap-6">
      {rankError && (
        <div className="rounded-2xl bg-rose-50 text-rose-700 px-4 py-3 flex items-center gap-2 shadow-sm">
          データ取得に失敗しました: {rankError}
        </div>
      )}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>ライブタイル</span>
            <span className="text-xs text-slate-500">全国 {rankData.length || 47} 県</span>
          </div>
          <button
            onClick={refetchRank}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            今すぐ更新
          </button>
        </div>
        {rankLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {topPref && (
              <div
                key={topPref.prefectureId}
                ref={(el) => {
                  if (el) tileRefs.current.set(topPref.prefectureId, el);
                  else tileRefs.current.delete(topPref.prefectureId);
                }}
                className="relative overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.08)] sm:col-span-2 xl:col-span-3"
              >
                <div className="relative p-6 md:p-8 flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-1/2">
                    <div className="aspect-square max-h-[380px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg shadow-slate-300/40">
                      {pickImage(topPref.prefectureId, topPref.imageUrl) ? (
                        <img
                          src={pickImage(topPref.prefectureId, topPref.imageUrl)}
                          alt={`${topPref.name} のイメージ`}
                          className="h-full w-full object-contain p-4"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">画像なし</div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                      <span className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold">#1</span>
                      <span className="text-sm">{topPref.name}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
                      <Trophy className="h-4 w-4 text-slate-700" />
                      Winner
                    </div>
                    <p className="text-sm text-slate-600">キャラクター: {topPref.characterName}</p>
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
                      <span>{rankLastUpdated ? rankLastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rankData.slice(1).map((pref, idx) => {
              const badge = statusBadge(pref.status);
              const gapToTop = Math.max(0, topSteps - pref.averageSteps);
              return (
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
                      {pickImage(pref.prefectureId, pref.imageUrl) ? (
                        <img
                          src={pickImage(pref.prefectureId, pref.imageUrl)}
                          alt={`${pref.name} のイメージ`}
                          className="h-full w-full object-contain p-3"
                        />
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
                          <p className="text-[11px] text-slate-600 mt-1">あと {numberFormatter.format(gapToTop)} 歩で1位</p>
                          <p className="text-[11px] text-slate-600 mt-1">キャラ: {pref.characterName}</p>
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
                        <span>{rankLastUpdated ? rankLastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!rankData.length && <p className="text-sm text-slate-600">データがありません</p>}
          </div>
        )}
      </section>
    </div>
  );

  const renderMapTab = () => (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>ステータスマップ</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <button
              onClick={refetchMap}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              手動取得
            </button>
            {mapLoading && <span className="text-slate-500">取得中...</span>}
          </div>
        </div>
        {mapError && (
          <div className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            データ取得に失敗しました: {mapError}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-1 border border-emerald-200">
            上位30%
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-1 border border-amber-200">
            中間
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200">
            下位
          </span>
          <span className="ml-auto text-[11px] text-slate-500">
            最終更新: {mapLastUpdated ? mapLastUpdated.toLocaleTimeString('ja-JP') : '---'}
          </span>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="relative w-full" ref={mapRef} />
          {!mapData.length && <p className="mt-3 text-xs text-slate-600">手動取得で表示します。</p>}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="rounded-3xl bg-white text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden relative">
          <div className="relative px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex items-center justify-center text-sm font-semibold text-slate-700">
                LB
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 font-semibold">Live Tiles</p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">リーダーボード</h1>
                <p className="text-sm text-slate-600 mt-1">
                  ランキングは1分ごと自動更新。マップは必要に応じて手動取得できます。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-700">
                <button
                  onClick={() => setActiveTab('rank')}
                  className={`px-3 py-1 rounded-full transition ${activeTab === 'rank' ? 'bg-slate-900 text-white' : ''}`}
                >
                  ランキング
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1 rounded-full transition ${activeTab === 'map' ? 'bg-slate-900 text-white' : ''}`}
                >
                  マップ
                </button>
              </div>
            </div>
          </div>
          {activeTab === 'rank' ? (
            <div className="relative border-t border-slate-200 px-6 py-3 text-xs text-slate-600 flex items-center gap-3 bg-white">
              <Clock3 className="h-4 w-4 text-slate-600" />
              <span>最終更新: {rankLastUpdated ? rankLastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
              <div className="ml-auto inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>自動更新: 60秒</span>
              </div>
            </div>
          ) : (
            <div className="relative border-t border-slate-200 px-6 py-3 text-xs text-slate-600 flex items-center gap-3 bg-white">
              <Clock3 className="h-4 w-4 text-slate-600" />
              <span>最終更新: {mapLastUpdated ? mapLastUpdated.toLocaleTimeString('ja-JP') : '---'}</span>
              <div className="ml-auto inline-flex items-center gap-2">
                <button
                  onClick={refetchMap}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  手動取得
                </button>
                <span className="text-[11px] text-slate-500">自動取得なし</span>
              </div>
            </div>
          )}
        </header>

        {activeTab === 'rank' ? renderRankTab() : renderMapTab()}
      </div>
    </div>
  );
}
