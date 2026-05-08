"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Clock, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { Market } from "@/types";
import {
  cn,
  formatUSDC,
  formatProbabilityInt,
  formatExpiry,
  getChangeColor,
  formatChange,
} from "@/lib/utils";

interface MarketCardProps {
  market: Market;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: "text-arc-secondary border-arc-secondary/30 bg-arc-secondary/10",
  commodities: "text-arc-warn border-arc-warn/30 bg-arc-warn/10",
  energy: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  macro: "text-arc-primary border-arc-primary/30 bg-arc-primary/10",
  equities: "text-arc-yes border-arc-yes/30 bg-arc-yes/10",
};

export function MarketCard({ market, featured = false }: MarketCardProps) {
  const yesProb = market.outcomes.yes.probability;
  const changeColor = getChangeColor(market.change24h);
  const isPositiveChange = market.change24h >= 0;

  // Mini chart data
  const chartData = market.priceHistory24h.map((p) => ({
    yes: Math.round(p.yes * 100),
  }));

  return (
    <Link href={`/market/${market.id}`}>
      <article className={cn(
        "group relative rounded-xl border border-arc-border bg-arc-surface",
        "hover:border-arc-primary/40 hover:shadow-arc-card hover:bg-arc-elevated",
        "transition-all duration-300 overflow-hidden cursor-pointer",
        "bg-card-shine bg-no-repeat",
        featured && "ring-1 ring-arc-primary/20"
      )}>

        {/* Top accent line */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-px",
          "bg-gradient-to-r from-transparent via-arc-primary/40 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none" role="img" aria-label={market.category}>
                {market.icon}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border",
                CATEGORY_COLORS[market.category] ?? "text-arc-text-muted border-arc-border bg-arc-muted"
              )}>
                {market.category}
              </span>
            </div>

            {/* 24h Change */}
            <div className={cn("flex items-center gap-1 shrink-0 text-xs font-semibold", changeColor)}>
              {isPositiveChange
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />
              }
              {formatChange(market.change24h)}
            </div>
          </div>

          {/* Title */}
          <h3 className="
            text-sm font-semibold text-arc-text-primary leading-snug mb-3
            group-hover:text-white transition-colors
            line-clamp-2 min-h-[2.5rem]
          ">
            {market.title}
          </h3>

          {/* Probability Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-arc-yes">
                  YES {formatProbabilityInt(yesProb)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-arc-no">
                  NO {formatProbabilityInt(market.outcomes.no.probability)}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-arc-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-arc-yes to-arc-yes/80 transition-all duration-500"
                style={{ width: `${yesProb * 100}%` }}
              />
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-10 mb-3 opacity-60 group-hover:opacity-90 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`grad-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={yesProb >= 0.5 ? "#22C55E" : "#EF4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={yesProb >= 0.5 ? "#22C55E" : "#EF4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="yes"
                  stroke={yesProb >= 0.5 ? "#22C55E" : "#EF4444"}
                  strokeWidth={1.5}
                  fill={`url(#grad-${market.id})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-arc-border/50">
            <div className="flex items-center gap-1 text-xs text-arc-text-muted">
              <BarChart2 size={11} />
              <span>{formatUSDC(market.volume24h)} 24h</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-arc-text-muted">
              <Clock size={11} />
              <span>{formatExpiry(market.expiresAt)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-arc-border bg-arc-surface p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-arc-muted" />
        <div className="w-20 h-4 rounded bg-arc-muted" />
      </div>
      <div className="w-full h-4 rounded bg-arc-muted mb-1" />
      <div className="w-3/4 h-4 rounded bg-arc-muted mb-3" />
      <div className="w-full h-1.5 rounded-full bg-arc-muted mb-3" />
      <div className="w-full h-10 rounded bg-arc-muted mb-3" />
      <div className="flex justify-between">
        <div className="w-16 h-3 rounded bg-arc-muted" />
        <div className="w-16 h-3 rounded bg-arc-muted" />
      </div>
    </div>
  );
}
