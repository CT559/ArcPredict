"use client";

import { useState, useEffect } from "react";
import { getStoredMarkets, resolveMarket, updateMarket } from "@/lib/store";
import { MARKETS, Market, formatCurrency, getOdds } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, Lock, CheckCircle2, XCircle, BarChart3,
  TrendingUp, Users, DollarSign, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LEADERBOARD } from "@/lib/data";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authed) loadMarkets();
  }, [authed]);

  const loadMarkets = () => {
    setMarkets(getStoredMarkets());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  const handleResolve = async (marketId: string, outcome: "yes" | "no") => {
    setResolving(`${marketId}_${outcome}`);
    await new Promise((r) => setTimeout(r, 800));
    resolveMarket(marketId, outcome);
    toast({
      title: "Market Resolved ✓",
      description: `Market resolved as ${outcome.toUpperCase()}. Winners can now claim rewards.`,
    });
    loadMarkets();
    setResolving(null);
  };

  const handleReset = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("arcpredict_markets");
    localStorage.removeItem("arcpredict_bets");
    loadMarkets();
    toast({ title: "Data reset", description: "All markets and bets have been reset to defaults." });
  };

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-arc flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-arc-green/50 focus:border-arc-green transition-all"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>
            <Button type="submit" className="w-full bg-arc-green hover:bg-arc-green/90 text-white font-display font-bold">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Access Dashboard
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Hint: admin123
          </p>
        </div>
      </div>
    );
  }

  const activeMarkets = markets.filter((m) => m.status === "active");
  const resolvedMarkets = markets.filter((m) => m.status === "resolved");
  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-arc-green" />
            <span className="text-sm text-arc-green font-medium">Admin Access Granted</span>
          </div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage markets, resolve outcomes, view analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMarkets}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            Reset Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BarChart3, label: "Active Markets", value: activeMarkets.length, color: "text-arc-green" },
          { icon: CheckCircle2, label: "Resolved", value: resolvedMarkets.length, color: "text-blue-400" },
          { icon: DollarSign, label: "Total Volume", value: formatCurrency(totalVolume), color: "text-arc-amber" },
          { icon: Users, label: "Leaderboard", value: `${LEADERBOARD.length} traders`, color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="font-display font-bold text-2xl">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-xl">Market Management</h2>
            <span className="text-sm text-muted-foreground">{markets.length} total</span>
          </div>
          {markets.map((market) => {
            const odds = getOdds(market.yesPool, market.noPool);
            const isResolved = market.status === "resolved";
            return (
              <div key={market.id} className={cn(
                "bg-card border border-border rounded-xl p-4",
                isResolved && "opacity-70"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{market.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-sm truncate">{market.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">{market.symbol}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className={cn(
                          "text-xs font-mono px-1.5 py-0.5 rounded",
                          isResolved
                            ? "bg-secondary text-muted-foreground"
                            : "bg-arc-green/20 text-arc-green"
                        )}>
                          {isResolved ? `RESOLVED: ${market.resolvedOutcome?.toUpperCase()}` : "ACTIVE"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isResolved && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-arc-green hover:bg-arc-green/90 text-white"
                        disabled={!!resolving}
                        onClick={() => handleResolve(market.id, "yes")}
                      >
                        {resolving === `${market.id}_yes` ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><CheckCircle2 className="w-3 h-3 mr-1" />YES</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs"
                        disabled={!!resolving}
                        onClick={() => handleResolve(market.id, "no")}
                      >
                        {resolving === `${market.id}_no` ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" />NO</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pool bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-arc-green">YES {odds.yes}% — {formatCurrency(market.yesPool)}</span>
                    <span className="text-red-400">{formatCurrency(market.noPool)} — {odds.no}% NO</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-arc rounded-full" style={{ width: `${odds.yes}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Vol: <span className="font-mono text-foreground">{formatCurrency(market.totalVolume)}</span>
                    {" · "}Resolves: <span className="font-mono text-foreground">{market.resolutionDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard + Stats */}
        <div className="space-y-4">
          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-arc-green" />
              Leaderboard
            </h2>
            <div className="space-y-3">
              {LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-2">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0",
                    entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                      entry.rank === 2 ? "bg-zinc-400/20 text-zinc-400" :
                        entry.rank === 3 ? "bg-orange-600/20 text-orange-600" :
                          "bg-secondary text-muted-foreground"
                  )}>
                    {entry.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{entry.displayName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{entry.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-arc-green font-semibold">
                      {formatCurrency(entry.totalWon)}
                    </div>
                    <div className="text-xs text-muted-foreground">{entry.winRate}% win</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-display font-bold mb-4">Volume by Category</h2>
            {["Metals", "Energy", "Agriculture", "Crypto", "Indices"].map((cat) => {
              const catMarkets = markets.filter((m) => m.category === cat);
              const catVol = catMarkets.reduce((s, m) => s + m.totalVolume, 0);
              const pct = totalVolume > 0 ? (catVol / totalVolume) * 100 : 0;
              return (
                <div key={cat} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{cat}</span>
                    <span className="font-mono text-muted-foreground">{formatCurrency(catVol)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-arc"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
