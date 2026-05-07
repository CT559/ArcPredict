"use client";
// app/markets/[id]/page.tsx - Market Detail Page

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, TrendingUp, Users, Zap,
  Info, BarChart2, AlertCircle, CheckCircle2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  ALL_MARKETS, Market, formatUSDC, getTimeLeft,
  MARKETS
} from "@/lib/mockData";
import { useStore } from "@/lib/store";

// ── Custom Tooltip ─────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs border border-[#1A2F52]">
      <div className="text-[var(--text-muted)] mb-1.5">
        {label ? format(new Date(label), "dd/MM HH:mm") : ""}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">{p.dataKey === "yes" ? "YES" : "NO"}</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}¢</span>
        </div>
      ))}
    </div>
  );
}

// ── Bet Panel ─────────────────────────────────────────────
function BetPanel({ market }: { market: Market }) {
  const { isConnected, usdcBalance, placeBet, connectWallet } = useStore();
  const [position, setPosition] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  const price = position === "yes" ? market.yesPrice : market.noPrice;
  const shares = price > 0 ? (amount / price) * 100 : 0;
  const potentialWin = shares; // 1 share = $1 at resolution
  const profit = potentialWin - amount;
  const roi = amount > 0 ? ((profit / amount) * 100).toFixed(1) : "0";

  const handleBet = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (amount > usdcBalance) {
      toast.error("Số dư USDC không đủ");
      return;
    }
    if (amount < 1) {
      toast.error("Số tiền cược tối thiểu là $1 USDC");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate tx

    const success = placeBet({
      marketId: market.id,
      marketTitle: market.title,
      position,
      amount,
      shares: parseFloat(shares.toFixed(2)),
      priceAtBet: price,
      walletAddress: "",
      potentialWinnings: parseFloat(potentialWin.toFixed(2)),
    });

    setLoading(false);

    if (success) {
      toast.success(`✅ Đặt cược thành công!`, {
        description: `${amount} USDC → ${position.toUpperCase()} | Potential: ${formatUSDC(potentialWin)}`,
      });
    } else {
      toast.error("Đặt cược thất bại");
    }
  };

  const PRESETS = [10, 25, 50, 100, 250];

  return (
    <div className="glass-card p-5 space-y-5">
      <h3 className="font-display font-bold text-lg">Đặt cược</h3>

      {/* Position selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPosition("yes")}
          className={`py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
            position === "yes"
              ? "bg-cyan-gradient text-white shadow-cyan"
              : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-cyan-500/40"
          }`}
        >
          <div className="text-xl mb-0.5">✅</div>
          <div>YES</div>
          <div className="font-mono text-lg mt-0.5">{market.yesPrice}¢</div>
        </button>
        <button
          onClick={() => setPosition("no")}
          className={`py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
            position === "no"
              ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
              : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-orange-500/40"
          }`}
        >
          <div className="text-xl mb-0.5">❌</div>
          <div>NO</div>
          <div className="font-mono text-lg mt-0.5">{market.noPrice}¢</div>
        </button>
      </div>

      {/* Amount input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <label className="text-[var(--text-secondary)]">Số tiền cược (USDC)</label>
          {isConnected && (
            <button
              onClick={() => setAmount(Math.floor(usdcBalance))}
              className="text-xs text-gold-300 hover:text-gold-400 transition-colors"
            >
              Max: {formatUSDC(usdcBalance)}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] focus-within:border-gold-400/40 transition-colors">
          <span className="text-[var(--text-muted)] font-bold">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
            className="flex-1 bg-transparent font-mono font-bold text-lg text-[var(--text-primary)] outline-none"
            min={1}
            max={isConnected ? usdcBalance : 999999}
          />
          <span className="text-xs text-[var(--text-muted)]">USDC</span>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={1}
          max={isConnected ? Math.min(usdcBalance, 10000) : 10000}
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          className="w-full accent-yellow-400"
        />

        {/* Preset buttons */}
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all border ${
                amount === p
                  ? "border-gold-400/50 bg-gold-400/15 text-gold-300"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
              }`}
            >
              ${p}
            </button>
          ))}
        </div>
      </div>

      {/* Payout breakdown */}
      <div className="space-y-2 p-3 rounded-xl bg-[var(--bg-surface)] text-sm">
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Số shares nhận được</span>
          <span className="font-mono">{shares.toFixed(2)} shares</span>
        </div>
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Tiền nhận nếu thắng</span>
          <span className="font-mono text-emerald-400 font-bold">{formatUSDC(potentialWin)}</span>
        </div>
        <div className="flex justify-between text-[var(--text-secondary)]">
          <span>Lợi nhuận kỳ vọng</span>
          <span className={`font-mono font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? "+" : ""}{formatUSDC(profit)} ({roi}%)
          </span>
        </div>
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleBet}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
          position === "yes"
            ? "btn-cyan"
            : "bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-lg"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang xử lý...
          </span>
        ) : !isConnected ? (
          "Kết nối ví để cược"
        ) : (
          `Cược ${formatUSDC(amount)} → ${position.toUpperCase()}`
        )}
      </motion.button>

      {!isConnected && (
        <p className="text-xs text-center text-[var(--text-muted)]">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Kết nối MetaMask để bắt đầu đặt cược
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function MarketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const market = ALL_MARKETS.find((m) => m.id === id);
  const { resolvedMarkets, bets } = useStore();

  // Simulate realtime price update
  const [liveProb, setLiveProb] = useState(market?.probability ?? 50);
  useEffect(() => {
    if (!market) return;
    const interval = setInterval(() => {
      setLiveProb((prev) => {
        const drift = (Math.random() - 0.48) * 1.5;
        return Math.max(5, Math.min(95, Math.round(prev + drift)));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [market]);

  const myBets = bets.filter((b) => b.marketId === id);
  const resolvedOutcome = market ? resolvedMarkets.get(market.id) || market.outcome : undefined;
  const isResolved = !!resolvedOutcome;

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="font-display text-2xl font-bold">Không tìm thấy thị trường</h2>
          <Link href="/" className="btn-gold inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Chart data
  const chartData = market.priceHistory.map((p) => ({
    time: p.timestamp,
    yes: p.yes,
    no: p.no,
    volume: p.volume,
  }));

  const timeLeft = getTimeLeft(market.resolveDate);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />
      <Header />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Thị trường
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{market.category}</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] truncate max-w-[200px]">{market.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Chart + Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Market Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{market.icon}</span>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      market.category === "Kim loại" ? "badge-metal" :
                      market.category === "Năng lượng" ? "badge-energy" :
                      market.category === "Lương thực" ? "badge-food" : "badge-crypto"
                    }`}>
                      {market.category}
                    </span>
                    {isResolved && (
                      <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                        resolvedOutcome === "yes"
                          ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                          : "bg-red-400/15 text-red-400 border border-red-400/30"
                      }`}>
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Resolved: {resolvedOutcome?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] shrink-0">
                  <Clock className="w-4 h-4" />
                  <span className={timeLeft.includes("h") && !timeLeft.includes("d") ? "text-orange-400" : ""}>
                    {timeLeft}
                  </span>
                </div>
              </div>

              <h1 className="font-display font-bold text-xl md:text-2xl text-[var(--text-primary)] leading-snug">
                {market.title}
              </h1>

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {market.description}
              </p>

              {/* Live probability display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400/25 text-center">
                  <div className="text-xs text-cyan-400 mb-1">YES</div>
                  <div className="text-3xl font-mono font-bold text-cyan-400">{liveProb}¢</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {liveProb >= 70 ? "Rất có thể" : liveProb >= 55 ? "Có thể" : liveProb >= 45 ? "Cân bằng" : "Ít có thể"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-400/10 border border-orange-400/25 text-center">
                  <div className="text-xs text-orange-400 mb-1">NO</div>
                  <div className="text-3xl font-mono font-bold text-orange-400">{100 - liveProb}¢</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {100 - liveProb >= 70 ? "Rất có thể" : 100 - liveProb >= 55 ? "Có thể" : 100 - liveProb >= 45 ? "Cân bằng" : "Ít có thể"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Price Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gold-300" />
                  Biểu đồ xác suất
                </h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-cyan-400 rounded" />
                    YES
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-orange-400 rounded" />
                    NO
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradYes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,47,82,0.6)" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => format(new Date(t), "dd/MM")}
                    tick={{ fontSize: 10, fill: "#4A6080" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#4A6080" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}¢`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={50} stroke="#1A2F52" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="yes"
                    stroke="#22D3EE"
                    strokeWidth={2}
                    fill="url(#gradYes)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#22D3EE" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="no"
                    stroke="#FB923C"
                    strokeWidth={2}
                    fill="url(#gradNo)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#FB923C" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Market Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: "Total Volume", value: formatUSDC(market.volume), icon: TrendingUp, color: "text-gold-300" },
                { label: "Liquidity", value: formatUSDC(market.liquidity), icon: Zap, color: "text-cyan-400" },
                { label: "Unique Traders", value: market.stats.uniqueTraders.toLocaleString(), icon: Users, color: "text-purple-400" },
                { label: "Total Bets", value: market.totalBets.toLocaleString(), icon: BarChart2, color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
                  <div className={`font-mono font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* My bets for this market */}
            {myBets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-5"
              >
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gold-300" />
                  Cược của bạn
                </h3>
                <div className="space-y-2">
                  {myBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                          bet.position === "yes"
                            ? "bg-cyan-400/15 text-cyan-400"
                            : "bg-orange-400/15 text-orange-400"
                        }`}>
                          {bet.position.toUpperCase()}
                        </span>
                        <span className="text-[var(--text-secondary)]">{formatUSDC(bet.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">+{formatUSDC(bet.potentialWinnings)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          bet.status === "won" ? "bg-emerald-400/15 text-emerald-400" :
                          bet.status === "lost" ? "bg-red-400/15 text-red-400" :
                          "bg-[var(--border)] text-[var(--text-muted)]"
                        }`}>
                          {bet.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Bet Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-24"
            >
              {isResolved ? (
                <div className="glass-card p-6 text-center space-y-4">
                  <div className="text-5xl">{resolvedOutcome === "yes" ? "✅" : "❌"}</div>
                  <h3 className="font-display font-bold text-lg">Thị trường đã resolve</h3>
                  <p className={`text-2xl font-mono font-bold ${
                    resolvedOutcome === "yes" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    Kết quả: {resolvedOutcome?.toUpperCase()}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Thị trường này đã kết thúc. Kiểm tra bảng lịch sử cược.
                  </p>
                </div>
              ) : (
                <BetPanel market={{ ...market, yesPrice: liveProb, noPrice: 100 - liveProb }} />
              )}

              {/* Market info */}
              <div className="glass-card p-4 mt-4 space-y-3 text-sm">
                <h4 className="font-semibold text-[var(--text-secondary)]">Thông tin thị trường</h4>
                {[
                  { label: "Resolve date", value: format(new Date(market.resolveDate), "dd/MM/yyyy HH:mm") },
                  { label: "Created", value: format(new Date(market.createdAt), "dd/MM/yyyy") },
                  { label: "Min bet", value: "$1 USDC" },
                  { label: "Max bet", value: "$50,000 USDC" },
                  { label: "Settlement", value: "Tự động" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="text-[var(--text-secondary)] font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {market.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
