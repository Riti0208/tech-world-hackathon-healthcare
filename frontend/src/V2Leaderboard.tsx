import {
  Crown,
  Dumbbell,
  Flame,
  Headphones,
  Home,
  Medal,
  RefreshCw,
  Shield,
  Trophy,
  Wand2,
} from 'lucide-react';

type Player = {
  rank: number;
  name: string;
  xp: number;
  accent: string;
  isYou?: boolean;
  delta?: number;
  trend?: 'up' | 'down' | 'steady';
  region?: string;
};

const players: Player[] = [
  { rank: 1, name: 'Jason', xp: 12580, accent: 'from-amber-300 to-yellow-300', delta: 42, trend: 'up', region: '東京' },
  { rank: 2, name: 'Cindy', xp: 11320, accent: 'from-purple-300 to-pink-300', delta: 12, trend: 'up', region: '大阪' },
  { rank: 3, name: 'Ashley', xp: 9800, accent: 'from-orange-300 to-amber-300', delta: -8, trend: 'down', region: '福岡' },
  { rank: 4, name: 'Tiffany', xp: 8740, accent: 'from-lime-300 to-green-300', isYou: true, delta: 24, trend: 'up', region: '神奈川' },
  { rank: 5, name: 'Sergio', xp: 8560, accent: 'from-sky-300 to-cyan-300', delta: 4, trend: 'steady', region: '愛知' },
];

const footerIcons = [
  { icon: Home, color: 'text-purple-500' },
  { icon: Headphones, color: 'text-pink-500' },
  { icon: Dumbbell, color: 'text-sky-500' },
  { icon: Shield, color: 'text-amber-500' },
  { icon: Wand2, color: 'text-orange-500' },
];

const Token = ({ color }: { color: string }) => (
  <div
    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} shadow-inner shadow-slate-900/5 border border-white/60`}
  />
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
  <div
    className={`h-12 w-12 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-slate-900 font-semibold shadow-md`}
  >
    {name.slice(0, 1)}
  </div>
);

const TrendBadge = ({
  delta,
  trend,
}: {
  delta?: number;
  trend?: Player['trend'];
}) => {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
        <Flame className="h-3.5 w-3.5" />
        +{delta}
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-semibold">
        -{delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-semibold">
      {delta ? `±${delta}` : '±0'}
    </span>
  );
};

const regions = [
  { name: '東京', average: 10240, delta: '+320' },
  { name: '大阪', average: 9860, delta: '+140' },
  { name: '福岡', average: 9540, delta: '+60' },
];

const flowMeta = {
  updatedAt: '09:42',
  serverLoad: 'balanced',
  nationalAverage: 7560,
};

export function V2Leaderboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-emerald-200 via-cyan-100 to-transparent" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="rounded-[32px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-center gap-3">
              <Token color="from-pink-300 to-fuchsia-400" />
              <Token color="from-slate-400 to-slate-500" />
              <Token color="from-teal-200 to-cyan-300" />
            </div>
            <div className="px-6 text-center pb-4">
              <p className="text-sm font-semibold text-slate-500">Diamond League</p>
              <h1 className="mt-1 text-xl font-bold text-slate-800">
                Top 10 qualify for the Tournament
              </h1>
              <p className="mt-1 text-amber-500 font-semibold text-sm">3 days</p>
              <p className="mt-2 text-xs text-slate-500">
                v1要素: サーバー計算の順位を即時可視化 / 「頑張ったら上がった」を色と順位で表示
              </p>
            </div>

            <div className="border-t border-slate-200" />

            <div className="divide-y divide-slate-200">
              {players.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-3 px-6 py-4 ${
                    player.isYou ? 'bg-lime-200/70' : 'bg-white'
                  }`}
                >
                  <RankBadge rank={player.rank} />
                  <Avatar name={player.name} accent={player.accent} />
                  <div className="flex-1">
                    <p className="text-base font-semibold">
                      {player.name}
                      {player.isYou && <span className="ml-2 text-xs text-emerald-600 font-semibold">You</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{player.region}</span>
                      <TrendBadge delta={player.delta} trend={player.trend} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-semibold">{player.xp.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-medium">歩</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-around px-6 py-4">
              {footerIcons.map(({ icon: Icon, color }, index) => (
                <button
                  key={index}
                  className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner"
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">API 2 / フロー状態取得</p>
                  <p className="text-sm text-slate-700 mt-1">
                    サーバー計算の平均・順位をWebで即可視化
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-sm">
                  <RefreshCw className="h-4 w-4" />
                  Flow再取得
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <p className="text-[11px] text-slate-500">最新更新</p>
                  <p className="text-lg font-semibold text-slate-800">{flowMeta.updatedAt}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <p className="text-[11px] text-slate-500">全国平均</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {flowMeta.nationalAverage.toLocaleString()} 歩
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <p className="text-[11px] text-slate-500">サーバー負荷</p>
                  <p className="text-lg font-semibold text-slate-800 capitalize">
                    {flowMeta.serverLoad}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                v1継承: サーバー負荷を強調し「計算をサーバーに寄せる」方針をUIに表示。
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">地域平均トップ</p>
                <span className="text-xs text-emerald-600 font-semibold">「やってます」を伝える帯</span>
              </div>
              <div className="mt-3 space-y-2">
                {regions.map((region, idx) => (
                  <div key={region.name} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-500">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{region.name}</p>
                      <p className="text-xs text-slate-500">平均 {region.average.toLocaleString()} 歩</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      {region.delta}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                v1継承: 地域ランキングのトップ表示で競争心を煽る。
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-slate-800">AI煽りヒント</p>
              </div>
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                「あと1,200歩で県内トップ帯に再計算。夜ウォークで押し上げよう。」
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 rounded-full bg-slate-900 text-white py-2 text-sm font-semibold shadow-md">
                  API 1: 歩数アップデート送信
                </button>
                <button className="flex-1 rounded-full bg-white border border-slate-200 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                  AI メッセージ再取得
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                v1継承: AI活用とAPI 1送信ボタンをセットで提示。
              </p>
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
