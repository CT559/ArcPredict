"use client";
// app/admin/page.tsx - Admin Dashboard

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Shield, BarChart2, TrendingUp, Users, DollarSign,
  CheckCircle2, XCircle, Clock, LogOut, ChevronDown,
  Activity, Lock
} from "lucide-react";
import Header from "@/components/Header";
import {
  MARKETS, RESOLVED_MARKETS, ALL_MARKETS,
  formatUSDC, getTimeLeft
} from "@/lib/mockData";
import { useStore } from "@/lib/store";

const ADMIN_PASSWORD = "admin123";

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

// ── Login Gate ─────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (pwd === ADMIN_PASSWORD) {
      onLogin();
      toast.success("Đăng nhập Admin thành công");
    } else {
      setError(true);
      setPwd("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8 space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-400/15 border border-gold-400/30 mb-4">
              <Shield className="w-7 h-7 text-gold-300" />
            </div>
            <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Nhập mật khẩu để truy cập
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-secondary)]">Mật khẩu</label>
              <div className={`flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border transition-colors ${
                error ? "border-red-400/50" : "border-[var(--border)] focus-within:border-gold-400/40"
              }`}>
                <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => { setPwd(e.target.value); setError(false); }}
                  placeholder="Nhập mật khẩu admin..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] outline-none"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-400">❌ Mật khẩu không đúng</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !pwd}
              className="w-full btn-gold py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-arc-bg/30 border-t-arc-bg rounded-full animate-spin" />
                  Đang xác thực...
                </span>
              ) : (
                "Đăng nhập Admin"
              )}
            </button>
          </form>

          <p className="text-xs text-center text-[var(--text-muted)]">
            Demo password: <code className="font-mono bg-[var(--bg-surface)] px-1.5 py-0.5 rounded text-gold-300">admin123</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Admin Content ─────────────────────────────────────────
function AdminContent({ onLogout }: { onLogout: () => void }) {
  const { resolvedMarkets, resolveMarket, bets } = useStore();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmOutcome, setConfirmOutcome] = useState<"yes" | "no">("yes");

  // Compute stats
  const totalVolume = ALL_MARKETS.reduce((a, m) => a + m.volume, 0);
  const activeMarkets = MARKETS.filter((m) => m.status === "active").length;
  const resolvedCount = RESOLVED_MARKETS.length + resolvedMarkets.size;
  const totalBets = ALL_MARKETS.reduce((a, m) => a + m.totalBets, 0) + bets.length;
  const totalTraders = ALL_MARKETS.reduce((a, m) => a + m.stats.uniqueTraders, 0);

  const handleResolve = async (marketId: string, outcome: "yes" | "no") => {
    setResolvingId(marketId);
    await new Promise((r) => setTimeout(r, 1000));
    resolveMarket(marketId, outcome);
    setResolvingId(null);
    setConfirmId(null);
    toast.success(`✅ Thị trường đã resolve: ${outcome.toUpperCase()}`, {
      description: "Người thắng sẽ nhận được USDC tự động",
    });
  };

  // All active markets + show resolve status
  const marketList = MARKETS.map((m) => ({
    ...m,
    adminResolved: resolvedMarkets.get(m.id),
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />
      <Header />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-gold-400/15 border border-gold-400/30">
                <Shield className="w-5 h-5 text-gold-300" />
              </div>
              <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Quản lý và resolve thị trường dự đoán
            </p>
          </motion.div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-red-400 border border-[var(--border)] hover:border-red-400/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Volume"
            value={`$${(totalVolume / 1000000).toFixed(1)}M`}
            sub="USDC"
            icon={DollarSign}
            color="text-gold-300"
            bg="bg-gold-400/10"
          />
          <StatCard
            label="Active Markets"
            value={activeMarkets}
            sub={`${resolvedCount} resolved`}
            icon={Activity}
            color="text-cyan-400"
            bg="bg-cyan-400/10"
          />
          <StatCard
            label="Total Bets"
            value={totalBets.toLocaleString()}
            sub="predictions placed"
            icon={TrendingUp}
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
          <StatCard
            label="Total Traders"
            value={totalTraders.toLocaleString()}
            sub="unique wallets"
            icon={Users}
            color="text-purple-400"
            bg="bg-purple-400/10"
          />
        </div>

        <div className="section-divider mb-8" />

        {/* Markets Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gold-300" />
            Tất cả thị trường Active
          </h2>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Thị trường", "Category", "Prob", "Volume", "Time Left", "Trạng thái", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-[var(--text-muted)] font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {marketList.map((market, i) => {
                    const isAlreadyResolved = !!market.adminResolved;
                    const isResolving = resolvingId === market.id;

                    return (
                      <motion.tr
                        key={market.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{market.icon}</span>
                            <span className="text-[var(--text-primary)] font-medium leading-tight line-clamp-2">
                              {market.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            market.category === "Kim loại" ? "badge-metal" :
                            market.category === "Năng lượng" ? "badge-energy" :
                            market.category === "Lương thực" ? "badge-food" : "badge-crypto"
                          }`}>
                            {market.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono font-bold ${
                            market.probability >= 70 ? "text-emerald-400" :
                            market.probability >= 50 ? "text-cyan-400" :
                            market.probability >= 35 ? "text-gold-300" : "text-red-400"
                          }`}>
                            {market.probability}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gold-300 font-bold">
                          {formatUSDC(market.volume)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-[var(--text-muted)]">
                            <Clock className="w-3 h-3" />
                            {getTimeLeft(market.resolveDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isAlreadyResolved ? (
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                              market.adminResolved === "yes"
                                ? "bg-emerald-400/15 text-emerald-400"
                                : "bg-red-400/15 text-red-400"
                            }`}>
                              <CheckCircle2 className="w-3 h-3" />
                              {market.adminResolved?.toUpperCase()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <span className="live-dot" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isAlreadyResolved ? (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
                          ) : confirmId === market.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-[var(--text-muted)] mr-1">Xác nhận:</span>
                              <button
                                onClick={() => handleResolve(market.id, "yes")}
                                disabled={isResolving}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-400/15 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/25 transition-all disabled:opacity-60"
                              >
                                {isResolving ? "..." : <><CheckCircle2 className="w-3 h-3" /> YES</>}
                              </button>
                              <button
                                onClick={() => handleResolve(market.id, "no")}
                                disabled={isResolving}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-400/15 text-red-400 border border-red-400/30 hover:bg-red-400/25 transition-all disabled:opacity-60"
                              >
                                {isResolving ? "..." : <><XCircle className="w-3 h-3" /> NO</>}
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmId(market.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg btn-gold"
                            >
                              Resolve
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Resolved Markets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10"
        >
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Thị trường đã Resolve gần đây
          </h2>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Thị trường", "Category", "Volume", "Outcome", "Resolved At"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-[var(--text-muted)] font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    // Admin-resolved markets
                    ...Array.from(resolvedMarkets.entries()).map(([id, outcome]) => {
                      const m = MARKETS.find((m) => m.id === id);
                      return m ? { ...m, outcome, resolvedAt: new Date().toISOString() } : null;
                    }).filter(Boolean),
                    // Pre-resolved
                    ...RESOLVED_MARKETS,
                  ].map((market: any, i) => (
                    <tr key={`${market.id}-${i}`} className="hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span>{market.icon}</span>
                          <span className="text-[var(--text-secondary)] line-clamp-2">{market.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          market.category === "Kim loại" ? "badge-metal" :
                          market.category === "Năng lượng" ? "badge-energy" :
                          market.category === "Lương thực" ? "badge-food" : "badge-crypto"
                        }`}>
                          {market.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gold-300 font-bold">
                        {formatUSDC(market.volume)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 w-fit text-xs font-bold px-2 py-0.5 rounded-full ${
                          market.outcome === "yes"
                            ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/25"
                            : "bg-red-400/15 text-red-400 border border-red-400/25"
                        }`}>
                          {market.outcome === "yes" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {market.outcome?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {market.resolvedAt
                          ? format(new Date(market.resolvedAt), "dd/MM/yyyy HH:mm")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginGate onLogin={() => setIsAuthenticated(true)} />;
  }

  return <AdminContent onLogout={() => setIsAuthenticated(false)} />;
}
