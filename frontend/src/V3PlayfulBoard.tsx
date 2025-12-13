import { useMemo } from 'react';
import { Activity, Flame, Heart, RefreshCw, Trophy } from 'lucide-react';
import { useCharacters } from './hooks/useCharacters';
import prefIcon from './assets/test1.png';

const numberFormatter = new Intl.NumberFormat('ja-JP');

const statusBadge = (status: number) => {
  if (status === 2) return { label: '上位30%', color: 'bg-emerald-100 text-emerald-700' };
  if (status === 1) return { label: '中間', color: 'bg-amber-100 text-amber-700' };
  return { label: 'がんばろう', color: 'bg-slate-100 text-slate-700' };
};

export function V3PlayfulBoard() {
  const {
    data,
    top,
    nationalAverage,
    loading,
    error,
    refetch,
    lastUpdated,
    statusCount,
  } = useCharacters({ pollingMs: 10000 });

  const heroPrefecture = top[0];
  const vibeColor = heroPrefecture ? 'from-orange-200 via-rose-100 to-amber-100' : 'from-slate-100 to-white';

  const tickerItems = useMemo(
    () => [
      `上位: ${statusCount.high} 県`,
      `中間: ${statusCount.mid} 県`,
      `下位: ${statusCount.low} 県`,
      `平均: ${nationalAverage ? `${numberFormatter.format(nationalAverage)} 歩` : '---'}`,
    ],
    [statusCount, nationalAverage],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-orange-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="rounded-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${vibeColor} opacity-70`} aria-hidden />
          <div className="relative flex flex-col lg:flex-row items-center lg:items-end justify-between px-6 py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white shadow-md border border-amber-100">
                <img src={prefIcon} alt="Mascot" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">
                  Step Battle v3
                </p>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  県対抗ランキング
                </h1>
                <p className="text-sm text-slate-700 mt-1">
                  10秒ごとに自動更新。がんばりが順位に反映される様子をリアルに表示。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-white px-4 py-2 text-sm font-semibold shadow-md hover:translate-y-[1px] transition"
              >
                <RefreshCw className="h-4 w-4" />
                今すぐ更新
              </button>
              <div className="text-xs text-amber-800 bg-amber-100 px-3 py-2 rounded-full">
                自動更新: 10秒間隔
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl bg-rose-100 text-rose-800 px-4 py-3 shadow-sm border border-rose-200">
            データ取得に失敗しました: {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">ライブ順位</h2>
                <span className="text-xs text-slate-500">(top 10)</span>
              </div>
              <div className="text-xs text-slate-500">
                {loading ? '読み込み中...' : lastUpdated ? `${lastUpdated.toLocaleTimeString('ja-JP')}` : '--:--'}
              </div>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500">読み込み中...</p>
            ) : (
              <div className="space-y-3">
                {top.map((pref, idx) => {
                  const badge = statusBadge(pref.status);
                  const isHero = idx === 0;
                  return (
                    <div
                      key={pref.prefectureId}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 border border-amber-100 ${
                        isHero ? 'bg-gradient-to-r from-amber-50 to-orange-50 shadow-inner' : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold">
                        {idx + 1}
                      </div>
                      <div className="h-12 w-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                        <img src={prefIcon} alt="県キャラ" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-slate-900">{pref.name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          {numberFormatter.format(pref.averageSteps)}
                        </p>
                        <p className="text-xs text-slate-500">歩</p>
                      </div>
                    </div>
                  );
                })}
                {!top.length && <p className="text-sm text-slate-500">データがありません</p>}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900">サマリー</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2">
                  <p className="text-xs text-amber-700">全国平均</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {loading ? '...' : numberFormatter.format(nationalAverage)}
                  </p>
                  <p className="text-[11px] text-amber-700">歩</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs text-slate-600">県数</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : data.length}</p>
                  <p className="text-[11px] text-slate-500">最大47</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <p className="text-xs text-emerald-700">上位30%</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">
                    {loading ? '...' : statusCount.high}
                  </p>
                </div>
                <div className="rounded-2xl bg-orange-50 border border-orange-100 px-3 py-2">
                  <p className="text-xs text-orange-700">更新間隔</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">10s</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">モチベーション帯</h3>
              </div>
              <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-pink-50 to-sky-50 border border-amber-100">
                <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700">
                  <img src={prefIcon} alt="キャラ" className="h-12 w-12 rounded-xl object-cover border border-amber-100" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">次の更新で飛び込もう！</p>
                    <p className="text-xs text-slate-600">
                      定期取得で順位が動きます。小さな加算でも上位帯に近づけます。
                    </p>
                  </div>
                  <Flame className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-amber-100 px-4 py-2 flex items-center gap-4 text-sm text-slate-700">
          <span className="text-amber-600 font-semibold">ライブTicker</span>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {tickerItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
