"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredMarkets } from "@/lib/store";
import { Market, MarketCategory, getOdds, formatCurrency, timeUntilResolution } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, TrendingDown, ChevronRight, Zap, Trophy, BarChart3, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CATEGORIES: (MarketCategory | "All")[] = ["All", "Metals", "Energy", "Agriculture", "Crypto", "Indices"];

const CATEGORY_COLORS: Record<string, string> = {
  Metals: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Energy: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  Agriculture: "text-green-500 bg-green-500/10 border-green-500/20",
  Crypto: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Indices: "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "All">("All");
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    setMarkets(getStoredMarkets());
  }, []);

  const filtered = markets.filter((m) => {
    const catMatch = activeCategory === "All" || m.category === activeCategory;
    const statusMatch = showResolved ? true : m.status === "active";
    return catMatch && statusMatch;
  });

  const activeMarkets = markets.filter((m) => m.status === "active");
  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-12 relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-12">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-arc-green rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-arc-blue rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-arc-green animate-pulse" />
            <span className="text-xs font-mono text-arc-green uppercase tracking-widest">Live Markets</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Predict. Trade.{" "}
            <span className="gradient-arc-text">Earn USDC.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-8">
            Short-term prediction markets on commodities, crypto, and indices.
            Connect your wallet, bet with USDC, and claim rewards within hours.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              { icon: BarChart3, label: "Active Markets", value: activeMarkets.length },
              { icon: Trophy, label: "Total Volume", value: formatCurrency(totalVolume) },
              { icon: Zap, label: "Avg Resolution", value: "< 48 hours" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-arc-green" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="font-display font-semibold">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 mr-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              activeCategory === cat
                ? "bg-arc-green text-white border-arc-green"
                : "bg-card border-border text-muted-foreground hover:border-arc-green/50 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setShowResolved((v) => !v)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              showResolved
                ? "bg-secondary border-border text-foreground"
                : "bg-card border-border text-muted-foreground"
            )}
          >
            {showResolved ? "Hide Resolved" : "Show Resolved"}
          </button>
        </div>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((market, i) => (
          <MarketCard key={market.id} market={market} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No markets found</p>
          <p className="text-sm mt-1">Try a different category or show resolved markets</p>
        </div>
      )}
    </div>
  );
}

function MarketCard({ market, index }: { market: Market; index: number }) {
  const odds = getOdds(market.yesPool, market.noPool);
  const timeLeft = timeUntilResolution(market.resolutionDate, market.resolutionTime);
  const isResolved = market.status === "resolved";
  const priceChange = market.priceHistory.length > 1
    ? market.currentPrice - market.priceHistory[market.priceHistory.length - 2].price
    : 0;
  const priceUp = priceChange >= 0;

  return (
    <Link href={`/markets/${market.id}`}>
      <div
        className={cn(
          "group relative bg-card border border-border rounded-xl p-5 card-hover cursor-pointer overflow-hidden",
          isResolved && "opacity-70"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Resolved badge */}
        {isResolved && (
          <div className={cn(
            "absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded-full",
            market.resolvedOutcome === "yes"
              ? "bg-arc-green/20 text-arc-green border border-arc-green/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>
            {market.resolvedOutcome?.toUpperCase()}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{market.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border font-medium",
                  CATEGORY_COLORS[market.category]
                )}>
                  {market.category}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono mt-0.5 block">{market.symbol}</span>
            </div>
          </div>
          {!isResolved && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-sm leading-snug mb-3 group-hover:text-arc-green transition-colors">
          {market.title}
        </h3>

        {/* Current Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-mono font-bold">
            {market.currentPrice > 1000
              ? `$${market.currentPrice.toLocaleString()}`
              : `$${market.currentPrice.toFixed(2)}`}
          </span>
          <span className={cn("flex items-center gap-0.5 text-xs font-mono", priceUp ? "text-arc-green" : "text-red-400")}>
            {priceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(priceChange).toFixed(2)}
          </span>
        </div>

        {/* Odds Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-arc-green font-medium">YES {odds.yes}%</span>
            <span className="text-red-400 font-medium">NO {odds.no}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full gradient-arc transition-all duration-500"
              style={{ width: `${odds.yes}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Vol: <span className="text-foreground font-mono">{formatCurrency(market.totalVolume)}</span>
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-arc-green group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
