import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Flame,
  MapPin,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';

type Trend = 'up' | 'down' | 'steady';

interface Leader {
  id: string;
  name: string;
  region: string;
  stepsToday: number;
  delta: number;
  trend: Trend;
}

interface RegionStat {
  name: string;
  average: number;
  delta: number;
  trend: Trend;
}

interface FlowState {
  updatedAt: string;
  nationalAverage: number;
  totalParticipants: number;
  serverLoad: 'light' | 'balanced' | 'heavy';
  leaders: Leader[];
  regions: RegionStat[];
}

const player = {
  name: 'あなた',
  stepsToday: 8420,
  yesterday: 7200,
  rank: 12,
  weeklyGoal: 70000,
};

const hypeLines = [
  {
    title: 'あと2,000歩で県内TOP10圏内',
    body: '夜の15分ウォークで一気にランクアップ。サーバーが順位を即再計算します。',
  },
  {
    title: '周りの平均を+18%リード中',
    body: 'ペースを保てば「やってます」感が伝わる位置。あと1セットで確実に差を広げられます。',
  },
  {
    title: 'チーム東京が追い上げ中',
    body: '地域平均が上昇。フロー更新のタイミングで表示が跳ねるので、今が押しどきです。',
  },
];

const pick = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];
const numberFormatter = new Intl.NumberFormat('ja-JP');
const jitter = (value: number, span = 600) =>
  Math.max(2800, Math.round(value + (Math.random() - 0.5) * span));

const generateMockFlowState = (): FlowState => {
  const leaders: Leader[] = [
    {
      id: 'u1',
      name: 'Riku',
      region: '東京',
      stepsToday: jitter(13250, 900),
      delta: 4,
      trend: 'up',
    },
    {
      id: 'u2',
      name: 'Miyu',
      region: '大阪',
      stepsToday: jitter(12640, 750),
      delta: 2,
      trend: 'up',
    },
    {
      id: 'u3',
      name: 'Kai',
      region: '福岡',
      stepsToday: jitter(11840, 650),
      delta: -1,
      trend: 'steady',
    },
    {
      id: 'u4',
      name: 'Sora',
      region: '北海道',
      stepsToday: jitter(11020, 620),
      delta: 3,
      trend: 'up',
    },
    {
      id: 'u5',
      name: 'Hana',
      region: '神奈川',
      stepsToday: jitter(10480, 540),
      delta: 0,
      trend: 'steady',
    },
    {
      id: 'u6',
      name: 'Yuto',
      region: '愛知',
      stepsToday: jitter(9860, 500),
      delta: -2,
      trend: 'down',
    },
    {
      id: 'u7',
      name: 'Mei',
      region: '京都',
      stepsToday: jitter(9540, 440),
      delta: 1,
      trend: 'up',
    },
    {
      id: 'u8',
      name: 'Ren',
      region: '広島',
      stepsToday: jitter(9020, 400),
      delta: 0,
      trend: 'steady',
    },
    {
      id: 'u9',
      name: 'Noa',
      region: '宮城',
      stepsToday: jitter(8760, 380),
      delta: 2,
      trend: 'up',
    },
    {
      id: 'u10',
      name: 'Aki',
      region: '長野',
      stepsToday: jitter(8420, 360),
      delta: 1,
      trend: 'up',
    },
  ];

  const regions: RegionStat[] = [
    { name: '東京', average: jitter(9800, 500), delta: 320, trend: 'up' },
    { name: '大阪', average: jitter(9320, 480), delta: 210, trend: 'up' },
    { name: '福岡', average: jitter(9040, 460), delta: 140, trend: 'steady' },
    { name: '愛知', average: jitter(8760, 420), delta: 80, trend: 'steady' },
    { name: '北海道', average: jitter(8460, 400), delta: -60, trend: 'down' },
  ];

  return {
    updatedAt: new Date().toISOString(),
    nationalAverage: jitter(7560, 480),
    totalParticipants: 12480 + Math.round(Math.random() * 280),
    serverLoad: pick(['light', 'balanced', 'heavy']),
    leaders,
    regions,
  };
};

const TrendBadge = ({ trend, delta }: { trend: Trend; delta: number }) => {
  const iconClass = 'h-4 w-4';
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-200 text-xs font-medium">
        <ArrowUpRight className={iconClass} />
        +{delta}
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/15 px-2 py-1 text-rose-200 text-xs font-medium">
        <ArrowDownRight className={iconClass} />
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-400/10 px-2 py-1 text-slate-200 text-xs font-medium">
      <Activity className={iconClass} />
      ±0
    </span>
  );
};

function App() {
  const [flowState, setFlowState] = useState<FlowState>(() =>
    generateMockFlowState(),
  );
  const [hype, setHype] = useState(() => pick(hypeLines));
  const [refreshing, setRefreshing] = useState(false);

  const bestRegionAverage = useMemo(
    () => Math.max(...flowState.regions.map((region) => region.average)),
    [flowState.regions],
  );

  const playerDelta = player.stepsToday - player.yesterday;
  const playerProgress = Math.min(
    100,
    Math.round((player.stepsToday / (player.weeklyGoal / 7)) * 100),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setFlowState(generateMockFlowState());
      setHype(pick(hypeLines));
      setRefreshing(false);
    }, 420);
  };

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
              歩数で煽るリアルタイムランキング盤
            </h1>
            <p className="text-slate-300 max-w-2xl">
              「こいつ頑張ったら上がった」が即伝わるボード。サーバーが計算した
              フロー（平均・順位）をWebで強調し、競争心を刺激します。
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 transition hover:translate-y-px"
            >
              <RefreshCw className="h-4 w-4" />
              Flow再取得
              {refreshing ? '中…' : ''}
            </button>
            <p className="text-xs text-slate-300">
              API 2: フロー状態取得 / {new Date(flowState.updatedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">あなたの今日</p>
              <Flame className="h-5 w-5 text-amber-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {numberFormatter.format(player.stepsToday)}
              <span className="text-lg text-slate-400 ml-1">歩</span>
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
              <span>昨日比</span>
              <TrendBadge trend={playerDelta >= 0 ? 'up' : 'down'} delta={Math.abs(playerDelta)} />
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-300"
                style={{ width: `${playerProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              週目標 {numberFormatter.format(player.weeklyGoal)} 歩 / 1日換算で{playerProgress}%達成
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">全国平均</p>
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {numberFormatter.format(flowState.nationalAverage)}
              <span className="text-lg text-slate-400 ml-1">歩</span>
            </p>
            <p className="mt-3 text-sm text-slate-400">
              サーバー計算で算出。リロードなしで平均を把握。
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">サーバー負荷</p>
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-2 text-2xl font-semibold capitalize">
              {flowState.serverLoad === 'light' && '軽め'}
              {flowState.serverLoad === 'balanced' && '標準'}
              {flowState.serverLoad === 'heavy' && '高負荷'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              平均計算・ランキング計算をサーバー側で実行し、利用を増やす前提の設計。
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">参加ユーザー</p>
              <Trophy className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              {numberFormatter.format(flowState.totalParticipants)}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              ランキング対象の総数。上位表示は {flowState.leaders.length} 位まで。
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-200 font-semibold">
                  <Trophy className="h-5 w-5" />
                  個人ランキング
                </div>
                <p className="text-sm text-slate-400">
                  「上がった」を可視化するトップ{flowState.leaders.length}リスト
                </p>
              </div>
              <span className="text-xs text-slate-400">努力が順位に直結</span>
            </div>
            <div className="mt-5 space-y-3">
              {flowState.leaders.map((leader, index) => (
                <div
                  key={leader.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 transition hover:border-cyan-300/40 hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/80 to-emerald-400/80 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">{leader.region}</p>
                      <p className="text-lg font-semibold tracking-tight">
                        {leader.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">今日</p>
                    <p className="text-2xl font-semibold tracking-tight">
                      {numberFormatter.format(leader.stepsToday)}
                      <span className="text-sm text-slate-400 ml-1">歩</span>
                    </p>
                    <div className="mt-1 flex justify-end">
                      <TrendBadge trend={leader.trend} delta={leader.delta} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <MapPin className="h-5 w-5" />
                  地域ランキング
                </div>
                <span className="text-xs text-slate-400">
                  上位県をトップ表示
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {flowState.regions.map((region, index) => {
                  const width = Math.round(
                    (region.average / bestRegionAverage) * 100,
                  );
                  return (
                    <div key={region.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            #{index + 1}
                          </span>
                          <span className="font-semibold">{region.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendBadge trend={region.trend} delta={region.delta} />
                          <span className="text-lg font-semibold tracking-tight">
                            {numberFormatter.format(region.average)}
                            <span className="text-sm text-slate-400 ml-1">
                              歩
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 text-cyan-200 font-semibold">
                <Sparkles className="h-5 w-5" />
                AI 煽りヒント
              </div>
              <p className="mt-3 text-lg font-semibold">{hype.title}</p>
              <p className="mt-2 text-sm text-slate-300">{hype.body}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Brain className="h-4 w-4" />
                タイミングを決めてAIがメッセージを提示（Web側でも利用可）
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setHype(pick(hypeLines))}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:border-cyan-300/50 transition"
                >
                  もう一度提案
                </button>
                <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
                  API 1: 歩数アップデート送信（デモ）
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6">
            <div className="flex items-center gap-2 text-emerald-200 font-semibold">
              <Activity className="h-5 w-5" />
              リアルタイムフロー
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-4">
                <p className="text-xs text-slate-400">平均歩数 (Server)</p>
                <p className="mt-2 text-2xl font-semibold">
                  {numberFormatter.format(flowState.nationalAverage)} 歩
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  サーバー計算で配信。利用量が増えるほど動的。
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-4">
                <p className="text-xs text-slate-400">最新更新</p>
                <p className="mt-2 text-2xl font-semibold">
                  {new Date(flowState.updatedAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  API 2 で取得し、リロードなしで再描画。
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-4">
                <p className="text-xs text-slate-400">順位変動検知</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200">
                  Up/Down バッジ
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  「頑張ったら上がった」を色と矢印で即表示。
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/80 p-4">
              <div>
                <p className="text-sm text-slate-300">
                  API 1 / 歩数アップデート → API 2 / フロー状態取得
                </p>
                <p className="text-xs text-slate-400">
                  アプリが送ったデータをサーバーが集計し、このUIが即時表示。
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10 transition"
              >
                <RefreshCw className="h-4 w-4" />
                今すぐ反映
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-200 font-semibold">
              <Flame className="h-5 w-5" />
              モーメンタムログ
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-3">
                <p className="font-semibold">#{player.rank} → #{player.rank - 2} へ</p>
                <p className="text-xs text-slate-400">
                  今日の追加 {numberFormatter.format(playerDelta)} 歩で順位を2つ押し上げ。
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-3">
                <p className="font-semibold">地域表示との連動</p>
                <p className="text-xs text-slate-400">
                  県内平均が上がるとカードを強調表示。競争心を煽る。
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/80 p-3">
                <p className="font-semibold">リロードなしの把握</p>
                <p className="text-xs text-slate-400">
                  Flow更新ボタン or 自動ポーリングで順位変動を確認可能。
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-cyan-300/50 bg-cyan-400/5 p-4 text-xs text-cyan-50">
              Web UI の叩き台: ランキング表示を核に、サーバーで計算された平均・順位・地域データを即時提示。
              AI メッセージと組み合わせて「やってます」を伝える導線を固定しています。
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
