import { Activity, AlertCircle, MapPin, RefreshCw, Trophy } from 'lucide-react';
import { useCharacters } from './hooks/useCharacters';

const numberFormatter = new Intl.NumberFormat('ja-JP');

const statusLabel = (status: number) => {
  if (status === 2) return '上位30%';
  if (status === 1) return '中間';
  return '下位';
};

const statusColor = (status: number) => {
  if (status === 2) return 'bg-emerald-500/20 text-emerald-200';
  if (status === 1) return 'bg-amber-500/20 text-amber-100';
  return 'bg-slate-500/20 text-slate-200';
};

function App() {
  const { data, loading, error, nationalAverage, statusCount, top, refetch } =
    useCharacters();
  const topPrefecture = top[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.16),transparent_30%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.08),transparent_35%)]"
      />
      <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
              Flow State / Ranking
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              県対抗リアルタイムランキング
            </h1>
            <p className="text-slate-300 max-w-2xl">
              API `/characters` の平均歩数ランキング。サーバー計算の順位で「頑張ったら上がる」を即可視化します。
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 transition hover:translate-y-px"
            >
              <RefreshCw className="h-4 w-4" />
              Flow再取得
            </button>
            <p className="text-xs text-slate-300">
              API 2: /characters をフェッチして表示
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>データ取得に失敗しました: {error}</p>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">全国平均</p>
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {loading ? '...' : numberFormatter.format(nationalAverage)}
              {!loading && <span className="text-lg text-slate-400 ml-1">歩</span>}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              /characters の平均を単純平均した値。
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">県数</p>
              <MapPin className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {loading ? '...' : data.length}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              APIに含まれる県の件数（最大47）。
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">上位30% (status=2)</p>
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {loading ? '...' : statusCount.high}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              ステータス判定ロジックで付与された上位県数。
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">データ取得</p>
              <RefreshCw className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {loading ? 'フェッチ中' : '最新データ表示中'}
            </p>
            <p className="mt-3 text-sm text-slate-400">サーバーから取得した最新値を表示。</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-200 font-semibold">
                  <Trophy className="h-5 w-5" />
                  県ランキング（平均歩数順）
                </div>
              <p className="text-sm text-slate-400">API `/characters`の平均歩数から並べ替え</p>
              </div>
              <span className="text-xs text-slate-400">
                上位 {top.length} / {data.length} 県
              </span>
            </div>
            {loading ? (
              <p className="mt-6 text-slate-400 text-sm">フェッチ中...</p>
            ) : (
              <div className="mt-5 space-y-3">
                {top.map((pref, index) => (
                  <div
                    key={pref.prefectureId}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/80 to-emerald-400/80 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-lg font-semibold tracking-tight">
                          {pref.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${statusColor(pref.status)}`}
                        >
                          {statusLabel(pref.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold tracking-tight">
                        {numberFormatter.format(pref.averageSteps)}
                        <span className="text-sm text-slate-400 ml-1">歩</span>
                      </p>
                    </div>
                  </div>
                ))}
                {!top.length && (
                  <p className="text-sm text-slate-400">データがありません</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <MapPin className="h-5 w-5" />
                  上位3県の帯
                </div>
              </div>
              {loading ? (
                <p className="mt-4 text-slate-400 text-sm">フェッチ中...</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {top.slice(0, 3).map((pref, idx) => (
                    <div key={pref.prefectureId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold">{pref.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold tracking-tight">
                            {numberFormatter.format(pref.averageSteps)}
                            <span className="text-sm text-slate-400 ml-1">
                              歩
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (pref.averageSteps /
                                  (topPrefecture?.averageSteps || 1)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {!top.length && (
                    <p className="text-sm text-slate-400">データがありません</p>
                  )}
                </div>
              )}
            <p className="mt-3 text-xs text-slate-400">上位帯のみ強調表示。</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 space-y-4">
              <div className="flex items-center gap-2 text-cyan-200 font-semibold">
                <Activity className="h-5 w-5" />
                ステータス配分
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>上位 (status=2): {loading ? '...' : statusCount.high} 県</p>
                <p>中間 (status=1): {loading ? '...' : statusCount.mid} 県</p>
                <p>下位 (status=0): {loading ? '...' : statusCount.low} 県</p>
              </div>
              <p className="text-xs text-slate-400">ステータス判定ロジックに基づいた値を表示。</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
