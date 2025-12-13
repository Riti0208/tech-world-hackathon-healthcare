import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import { useCharacters } from './hooks/useCharacters';

const accents = [
  'from-amber-300 to-yellow-300',
  'from-purple-300 to-pink-300',
  'from-orange-300 to-amber-300',
  'from-lime-300 to-green-300',
  'from-sky-300 to-cyan-300',
  'from-emerald-300 to-teal-300',
  'from-indigo-300 to-sky-300',
];

const Token = ({ color }: { color: string }) => (
  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} shadow-inner shadow-slate-900/5 border border-white/60`} />
);

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
        <Crown className="h-5 w-5 text-amber-500" />
      </div>
    );
  }
  if (rank === 2 || rank === 3) {
    return (
      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shadow-sm">
        <Medal className={`h-5 w-5 ${rank === 2 ? 'text-slate-500' : 'text-amber-600'}`} />
      </div>
    );
  }
  return (
    <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-semibold">
      {rank}
    </div>
  );
};

const Avatar = ({ name, accent }: { name: string; accent: string }) => (
  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-slate-900 font-semibold shadow-md`}>
    {name.slice(0, 1)}
  </div>
);

const statusLabel = (status: number) => {
  if (status === 2) return '上位30%';
  if (status === 1) return '中間';
  return '下位';
};

export function V2Leaderboard() {
  const { data, top, nationalAverage, loading, error, refetch, statusCount } =
    useCharacters();
  const top3 = top.slice(0, 3);
  const numberFormatter = new Intl.NumberFormat('ja-JP');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-emerald-200 via-cyan-100 to-transparent" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="rounded-[32px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-center gap-3">
              <Token color="from-pink-300 to-fuchsia-400" />
              <Token color="from-slate-400 to-slate-500" />
              <Token color="from-teal-200 to-cyan-300" />
            </div>
            <div className="px-6 text-center pb-4">
              <p className="text-sm font-semibold text-slate-500">Diamond League</p>
              <h1 className="mt-1 text-xl font-bold text-slate-800">Top 10 qualify for the Tournament</h1>
              <p className="mt-2 text-xs text-slate-500">/characters の平均歩数でランキング。</p>
            </div>

            {error && (
              <div className="mx-6 mb-3 rounded-xl bg-rose-100 text-rose-700 px-3 py-2 text-sm">
                データ取得に失敗しました: {error}
              </div>
            )}

            <div className="px-6 pb-2 space-y-2">
              {loading ? (
                <p className="text-center text-slate-500 text-sm py-4">フェッチ中...</p>
              ) : (
                top.map((pref, idx) => (
                  <div
                    key={pref.prefectureId}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                      idx === 3 ? 'bg-lime-200/70' : 'bg-slate-50'
                    }`}
                  >
                    <RankBadge rank={idx + 1} />
                    <Avatar name={pref.name} accent={accents[idx % accents.length]} />
                    <div className="flex-1">
                      <p className="text-base font-semibold">
                        {pref.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{statusLabel(pref.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold">
                        {numberFormatter.format(pref.averageSteps)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">歩</span>
                    </div>
                  </div>
                ))
              )}
              {!loading && !top.length && (
                <p className="text-center text-slate-500 text-sm py-4">データがありません</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">API 2 / フロー状態取得</p>
                  <p className="text-sm text-slate-700 mt-1">サーバー計算の平均・順位をWebで即可視化</p>
                </div>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Flow再取得
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">全国平均</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {loading ? '...' : `${numberFormatter.format(nationalAverage)} 歩`}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">県数</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {loading ? '...' : data.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">上位帯</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {loading ? '...' : statusCount.high} 県
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">仕様準拠の結果を表示。</p>
            </div>

            <div className="rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">地域平均トップ</p>
                <span className="text-xs text-emerald-600 font-semibold">上位3県</span>
              </div>
              {loading ? (
                <p className="mt-3 text-sm text-slate-500">フェッチ中...</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {top3.map((pref, idx) => (
                    <div key={pref.prefectureId} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-500">#{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{pref.name}</p>
                        <p className="text-xs text-slate-500">
                          平均 {numberFormatter.format(pref.averageSteps)} 歩
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                        {statusLabel(pref.status)}
                      </span>
                    </div>
                  ))}
                  {!top3.length && (
                    <p className="text-sm text-slate-500">データがありません</p>
                  )}
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">上位帯のみ強調。</p>
            </div>

            <div className="rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-slate-800">Duolingo風のライト版ランキング (v2)</p>
              </div>
              <p className="text-xs text-slate-500">API 2を前提にしたランキング表示。</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-4 right-4 flex items-center gap-2 text-xs text-slate-500">
          <Trophy className="h-4 w-4 text-amber-500" />
          Duolingo風のライト版ランキング (v2)
        </div>
      </div>
    </div>
  );
}
