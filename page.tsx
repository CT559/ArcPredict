"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Award,
  Target,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  BarChart2,
  Layers,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Circle,
  Eye,
  EyeOff,
  Wallet,
  PieChart as PieChartIcon,
  Calendar,
  Globe,
  Lock,
} from "lucide-react";
import { useAccount } from "wagmi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: string;
  market: string;
  category: string;
  outcome: "YES" | "NO";
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  status: "open" | "won" | "lost" | "resolved";
  resolveDate: string;
  volume24h: number;
  tags: string[];
}

interface HistoryEntry {
  date: string;
  value: number;
  pnl: number;
}

interface CategoryAllocation {
  name: string;
  value: number;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const portfolioHistory: HistoryEntry[] = Array.from({ length: 90 }, (_, i) => {
  const base = 10000;
  const trend = i * 18;
  const noise = Math.sin(i * 0.4) * 600 + Math.cos(i * 0.15) * 400;
  return {
    date: new Date(Date.now() - (89 - i) * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Math.round(base + trend + noise),
    pnl: Math.round(trend + noise - 400),
  };
});

const positions: Position[] = [
  {
    id: "1",
    market: "Fed cuts rates before September 2025",
    category: "Macro",
    outcome: "YES",
    shares: 480,
    avgPrice: 0.62,
    currentPrice: 0.78,
    invested: 297.6,
    currentValue: 374.4,
    pnl: 76.8,
    pnlPct: 25.8,
    status: "open",
    resolveDate: "Sep 1, 2025",
    volume24h: 148200,
    tags: ["high-confidence", "macro"],
  },
  {
    id: "2",
    market: "BTC reaches $150k in 2025",
    category: "Crypto",
    outcome: "YES",
    shares: 1200,
    avgPrice: 0.41,
    currentPrice: 0.55,
    invested: 492,
    currentValue: 660,
    pnl: 168,
    pnlPct: 34.1,
    status: "open",
    resolveDate: "Dec 31, 2025",
    volume24h: 892000,
    tags: ["crypto", "trending"],
  },
  {
    id: "3",
    market: "Apple releases AR glasses in 2025",
    category: "Tech",
    outcome: "NO",
    shares: 350,
    avgPrice: 0.58,
    currentPrice: 0.44,
    invested: 203,
    currentValue: 154,
    pnl: -49,
    pnlPct: -24.1,
    status: "open",
    resolveDate: "Dec 31, 2025",
    volume24h: 34100,
    tags: ["tech", "speculative"],
  },
  {
    id: "4",
    market: "S&P 500 ends 2024 above 5000",
    category: "Macro",
    outcome: "YES",
    shares: 1000,
    avgPrice: 0.88,
    currentPrice: 1.0,
    invested: 880,
    currentValue: 1000,
    pnl: 120,
    pnlPct: 13.6,
    status: "won",
    resolveDate: "Dec 31, 2024",
    volume24h: 0,
    tags: ["resolved", "won"],
  },
  {
    id: "5",
    market: "Ethereum ETF approved in 2024",
    category: "Crypto",
    outcome: "YES",
    shares: 600,
    avgPrice: 0.71,
    currentPrice: 1.0,
    invested: 426,
    currentValue: 600,
    pnl: 174,
    pnlPct: 40.8,
    status: "won",
    resolveDate: "Dec 31, 2024",
    volume24h: 0,
    tags: ["resolved", "won"],
  },
  {
    id: "6",
    market: "Argentina wins Copa América 2024",
    category: "Sports",
    outcome: "NO",
    shares: 200,
    avgPrice: 0.35,
    currentPrice: 0.0,
    invested: 70,
    currentValue: 0,
    pnl: -70,
    pnlPct: -100,
    status: "lost",
    resolveDate: "Jul 14, 2024",
    volume24h: 0,
    tags: ["resolved", "lost"],
  },
  {
    id: "7",
    market: "OpenAI launches GPT-5 before mid-2025",
    category: "AI",
    outcome: "YES",
    shares: 900,
    avgPrice: 0.52,
    currentPrice: 0.69,
    invested: 468,
    currentValue: 621,
    pnl: 153,
    pnlPct: 32.7,
    status: "open",
    resolveDate: "Jun 30, 2025",
    volume24h: 212400,
    tags: ["ai", "trending"],
  },
];

const categoryAllocation: CategoryAllocation[] = [
  { name: "Crypto", value: 38, color: "#f59e0b" },
  { name: "Macro", value: 28, color: "#6366f1" },
  { name: "AI", value: 20, color: "#10b981" },
  { name: "Tech", value: 9, color: "#ec4899" },
  { name: "Sports", value: 5, color: "#ef4444" },
];

const weeklyPnl = [
  { day: "Mon", pnl: 124 },
  { day: "Tue", pnl: -88 },
  { day: "Wed", pnl: 310 },
  { day: "Thu", pnl: 45 },
  { day: "Fri", pnl: 198 },
  { day: "Sat", pnl: -34 },
  { day: "Sun", pnl: 267 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  accent: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6 group"
  >
    {/* Accent glow */}
    <div
      className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
      style={{ background: accent }}
    />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}22` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono tracking-tight">
        {value}
      </div>
      {sub && (
        <div
          className={`mt-1 text-xs flex items-center gap-1 ${
            trend === "up"
              ? "text-emerald-400"
              : trend === "down"
              ? "text-red-400"
              : "text-zinc-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight size={10} />
          ) : trend === "down" ? (
            <ArrowDownRight size={10} />
          ) : null}
          {sub}
        </div>
      )}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }: { status: Position["status"] }) => {
  const config = {
    open: { label: "Open", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Circle },
    won: { label: "Won", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
    lost: { label: "Lost", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    resolved: { label: "Resolved", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20", icon: CheckCircle2 },
  };
  const { label, color, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
      <Icon size={9} />
      {label}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111318] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-400 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-white font-mono font-semibold">
          {p.name === "pnl" ? (p.value >= 0 ? "+" : "") : ""}
          {typeof p.value === "number"
            ? p.name === "value"
              ? `$${p.value.toLocaleString()}`
              : `$${p.value.toLocaleString()}`
            : p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "history" | "analytics">("overview");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "won" | "lost">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"pnl" | "value" | "date">("pnl");
  const [hideValues, setHideValues] = useState(false);
  const [chartRange, setChartRange] = useState<"1W" | "1M" | "3M">("3M");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 120], [1, 0.85]);

  // Derived stats
  const totalInvested = positions.reduce((s, p) => s + p.invested, 0);
  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = (totalPnl / totalInvested) * 100;
  const openPositions = positions.filter((p) => p.status === "open");
  const winRate =
    (positions.filter((p) => p.status === "won").length /
      positions.filter((p) => ["won", "lost"].includes(p.status)).length) *
    100;

  const filteredPositions = positions
    .filter((p) => (filterStatus === "all" ? true : p.status === filterStatus))
    .filter((p) => (filterCategory === "all" ? true : p.category === filterCategory))
    .sort((a, b) =>
      sortBy === "pnl"
        ? b.pnl - a.pnl
        : sortBy === "value"
        ? b.currentValue - a.currentValue
        : new Date(b.resolveDate).getTime() - new Date(a.resolveDate).getTime()
    );

  const chartData =
    chartRange === "1W"
      ? portfolioHistory.slice(-7)
      : chartRange === "1M"
      ? portfolioHistory.slice(-30)
      : portfolioHistory;

  const mask = (val: string) => (hideValues ? "••••••" : val);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#080a0e] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">
            Connect your wallet to view your portfolio, positions, and performance analytics.
          </p>
          <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-white text-sm font-semibold">
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0e] text-white">
      {/* ── Background grid ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ── */}
      <motion.header
        ref={headerRef}
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080a0e]/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400 font-mono">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-semibold text-white">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 rounded-lg hover:bg-white/5 transition text-zinc-400 hover:text-white"
            >
              {hideValues ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition text-zinc-400 hover:text-white">
              <Download size={15} />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition text-zinc-400 hover:text-white">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Hero value ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 mb-2">
            Total Portfolio Value
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <h1 className="text-5xl font-black font-mono tracking-tight text-white">
              {mask(`$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)}
            </h1>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                totalPnl >= 0
                  ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                  : "bg-red-400/10 text-red-400 border border-red-400/20"
              }`}
            >
              {totalPnl >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {totalPnl >= 0 ? "+" : ""}
              {mask(`$${Math.abs(totalPnl).toFixed(2)}`)} ({totalPnlPct.toFixed(1)}%)
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            All time · Updated just now
          </p>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Invested"
            value={mask(`$${totalInvested.toFixed(0)}`)}
            icon={DollarSign}
            accent="#6366f1"
            delay={0.05}
          />
          <StatCard
            label="Open Positions"
            value={String(openPositions.length)}
            sub="Active markets"
            icon={Activity}
            accent="#f59e0b"
            delay={0.1}
          />
          <StatCard
            label="Win Rate"
            value={`${winRate.toFixed(0)}%`}
            sub="Resolved markets"
            icon={Award}
            trend="up"
            accent="#10b981"
            delay={0.15}
          />
          <StatCard
            label="Best Trade"
            value={mask("+$174")}
            sub="+40.8% — ETH ETF"
            icon={Zap}
            trend="up"
            accent="#ec4899"
            delay={0.2}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/[0.06] pb-0">
          {(["overview", "positions", "history", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─────────── OVERVIEW ─────────── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Portfolio chart */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Portfolio Value</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Historical performance</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                    {(["1W", "1M", "3M"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setChartRange(r)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                          chartRange === r
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#52525b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.floor(chartData.length / 6)}
                    />
                    <YAxis
                      tick={{ fill: "#52525b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                      width={48}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#portfolioGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#6366f1" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom grid: allocation + weekly pnl */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Allocation */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6">
                  <h3 className="text-sm font-semibold text-white mb-5">Category Allocation</h3>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={130} height={130}>
                      <PieChart>
                        <Pie
                          data={categoryAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={62}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {categoryAllocation.map((c, i) => (
                            <Cell key={i} fill={c.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {categoryAllocation.map((c) => (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: c.color }}
                            />
                            <span className="text-xs text-zinc-400">{c.name}</span>
                          </div>
                          <span className="text-xs font-semibold font-mono text-white">
                            {c.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly PnL */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6">
                  <h3 className="text-sm font-semibold text-white mb-5">Weekly P&amp;L</h3>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={weeklyPnl} barSize={22}>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#52525b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {weeklyPnl.map((e, i) => (
                          <Cell
                            key={i}
                            fill={e.pnl >= 0 ? "#10b981" : "#ef4444"}
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────── POSITIONS ─────────── */}
          {activeTab === "positions" && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                  {(["all", "open", "won", "lost"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        filterStatus === s
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                  {["all", "Crypto", "Macro", "AI", "Tech"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        filterCategory === c
                          ? "bg-indigo-600 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2 py-1.5"
                  >
                    <option value="pnl">P&L</option>
                    <option value="value">Value</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>

              {/* Position cards */}
              <div className="space-y-3">
                {filteredPositions.map((pos, i) => (
                  <motion.div
                    key={pos.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() =>
                      setSelectedPosition(selectedPosition?.id === pos.id ? null : pos)
                    }
                    className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-5 cursor-pointer hover:border-white/10 hover:bg-[#111318] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <StatusBadge status={pos.status} />
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {pos.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pos.outcome === "YES"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {pos.outcome}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate pr-4 group-hover:text-indigo-300 transition-colors">
                          {pos.market}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-500">
                            {pos.shares.toLocaleString()} shares @ ${pos.avgPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-zinc-600">·</span>
                          <span className="text-xs text-zinc-500">
                            <Clock size={9} className="inline mr-1" />
                            {pos.resolveDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono text-white">
                          {mask(`$${pos.currentValue.toFixed(2)}`)}
                        </div>
                        <div
                          className={`text-xs font-semibold font-mono flex items-center justify-end gap-0.5 ${
                            pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {pos.pnl >= 0 ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                          {pos.pnl >= 0 ? "+" : ""}
                          {mask(`$${Math.abs(pos.pnl).toFixed(2)}`)} ({pos.pnlPct.toFixed(1)}%)
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-0.5">
                          Current: ${pos.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {selectedPosition?.id === pos.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-4">
                            {[
                              {
                                label: "Invested",
                                value: `$${pos.invested.toFixed(2)}`,
                              },
                              {
                                label: "Avg Price",
                                value: `$${pos.avgPrice.toFixed(3)}`,
                              },
                              {
                                label: "24h Volume",
                                value:
                                  pos.volume24h > 0
                                    ? `$${(pos.volume24h / 1000).toFixed(0)}k`
                                    : "—",
                              },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider">
                                  {item.label}
                                </div>
                                <div className="text-sm font-semibold font-mono text-white">
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                          {pos.status === "open" && (
                            <div className="mt-3 flex gap-2">
                              <button className="flex-1 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold transition border border-indigo-600/30">
                                Add Position
                              </button>
                              <button className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition border border-white/10">
                                Exit Position
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─────────── HISTORY ─────────── */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-white">P&L History</h3>
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                    {(["1W", "1M", "3M"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setChartRange(r)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                          chartRange === r
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="pnlGradPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff05" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#52525b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.floor(chartData.length / 6)}
                    />
                    <YAxis
                      tick={{ fill: "#52525b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v >= 0 ? `+$${v}` : `-$${Math.abs(v)}`)}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#pnlGradPos)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#10b981" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Transaction log */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">Transaction Log</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {[
                    { type: "BUY", market: "BTC $150k", shares: 300, price: 0.41, date: "May 7", value: 123, hash: "0xab12…ef34" },
                    { type: "BUY", market: "Fed Rate Cut", shares: 200, price: 0.62, date: "May 5", value: 124, hash: "0xcd56…gh78" },
                    { type: "SELL", market: "Apple AR", shares: 100, price: 0.44, date: "May 3", value: 44, hash: "0xef90…ij12" },
                    { type: "CLAIM", market: "ETH ETF Won", shares: 600, price: 1.0, date: "Apr 29", value: 600, hash: "0xkl34…mn56" },
                    { type: "BUY", market: "GPT-5 Launch", shares: 400, price: 0.52, date: "Apr 22", value: 208, hash: "0xop78…qr90" },
                  ].map((tx, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tx.type === "BUY"
                              ? "bg-emerald-400/10 text-emerald-400"
                              : tx.type === "SELL"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-indigo-400/10 text-indigo-400"
                          }`}
                        >
                          {tx.type}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-white">{tx.market}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{tx.hash}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold font-mono text-white">
                          ${tx.value.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500">{tx.date}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────── ANALYTICS ─────────── */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Performance metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Trades", value: "23", sub: "All time" },
                  { label: "Win Rate", value: "67%", sub: "Resolved markets" },
                  { label: "Avg Return", value: "+18.4%", sub: "Per trade" },
                  { label: "Sharpe Ratio", value: "1.42", sub: "Risk-adjusted" },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-5"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                      {m.label}
                    </div>
                    <div className="text-xl font-bold font-mono text-white">{m.value}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{m.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Category performance */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6">
                <h3 className="text-sm font-semibold text-white mb-5">
                  Performance by Category
                </h3>
                <div className="space-y-3">
                  {[
                    { cat: "Crypto", return: 34.1, trades: 8, win: 75, color: "#f59e0b" },
                    { cat: "AI", return: 32.7, trades: 5, win: 80, color: "#10b981" },
                    { cat: "Macro", return: 20.3, trades: 6, win: 67, color: "#6366f1" },
                    { cat: "Tech", return: -24.1, trades: 3, win: 33, color: "#ec4899" },
                    { cat: "Sports", return: -100, trades: 1, win: 0, color: "#ef4444" },
                  ].map((c) => (
                    <div key={c.cat} className="flex items-center gap-4">
                      <div className="w-16 text-xs font-semibold text-zinc-400">{c.cat}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-500">
                            {c.trades} trades · {c.win}% win rate
                          </span>
                          <span
                            className={`text-xs font-bold font-mono ${
                              c.return >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {c.return >= 0 ? "+" : ""}
                            {c.return.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(Math.abs(c.return), 100)}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: c.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk metrics */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f14] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Shield size={14} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Risk Profile</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Max Drawdown", value: "-18.4%", status: "warn" },
                    { label: "Concentration", value: "38% Crypto", status: "warn" },
                    { label: "Avg Exposure", value: "$347 / trade", status: "ok" },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.05]">
                      <div className="flex items-center gap-1.5 mb-2">
                        {r.status === "ok" ? (
                          <CheckCircle2 size={11} className="text-emerald-400" />
                        ) : (
                          <AlertCircle size={11} className="text-amber-400" />
                        )}
                        <span className="text-[10px] text-zinc-500">{r.label}</span>
                      </div>
                      <div className="text-sm font-bold font-mono text-white">{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
