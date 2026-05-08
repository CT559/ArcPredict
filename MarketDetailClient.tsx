"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart2,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/markets/PriceChart";
import { TradingPanel } from "@/components/markets/TradingPanel";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import type { Market } from "@/services/market-service";

function StatPill({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3", className)}>
      <span className="text-zinc-500">{icon}</span>
      <div>
        <div className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-zinc-200">{value}</div>
      </div>
    </div>
  );
}

function formatVolume(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return "—";
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  if (days < 0) return "Closed";
  if (days === 0) return "Today";
  return `${days}d`;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  politics: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  sports: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  economy: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

interface MarketDetailClientProps {
  market: Market;
}

export function MarketDetailClient({ market }: MarketDetailClientProps) {
  const { isConnected } = useAccount();
  const isUp = (market.priceChange24h ?? 0) >= 0;
  const categoryColor = CATEGORY_COLORS[market.category?.toLowerCase()] ?? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";

  function handleConnect() {
    // Trigger wagmi connect modal — integrate with your ConnectButton
    document.getElementById("connect-wallet-btn")?.click();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          All Markets
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border", categoryColor)}
          >
            {market.category}
          </Badge>
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              isUp ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isUp ? "+" : ""}{(market.priceChange24h * 100).toFixed(2)}% (24h)
          </span>
          <button className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-2 max-w-3xl">
          {market.title}
        </h1>
        {market.description && (
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">{market.description}</p>
        )}
      </motion.div>

      {/* Stats pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        <StatPill
          icon={<DollarSign className="w-4 h-4" />}
          label="24h Volume"
          value={formatVolume(market.volume24h)}
        />
        <StatPill
          icon={<BarChart2 className="w-4 h-4" />}
          label="Total Liquidity"
          value={formatVolume(market.liquidity ?? market.volume24h * 3)}
        />
        <StatPill
          icon={<Users className="w-4 h-4" />}
          label="Traders"
          value={market.traderCount?.toLocaleString() ?? "—"}
        />
        <StatPill
          icon={<Clock className="w-4 h-4" />}
          label="Closes In"
          value={daysUntil(market.endDate)}
        />
      </motion.div>

      {/* Odds bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-300">Current Odds</span>
          <span className="text-xs text-zinc-500">Last updated: just now</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">{(market.yesPrice * 100).toFixed(1)}¢</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">YES</div>
          </div>
          <div className="flex-1">
            {/* Probability bar */}
            <div className="h-3 rounded-full overflow-hidden bg-zinc-800 flex">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${market.yesPrice * 100}%` }}
              />
              <div
                className="bg-gradient-to-r from-rose-600 to-rose-500 flex-1 transition-all duration-700"
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-zinc-600">
              <span>YES {(market.yesPrice * 100).toFixed(0)}%</span>
              <span>NO {(market.noPrice * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-rose-400">{(market.noPrice * 100).toFixed(1)}¢</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">NO</div>
          </div>
        </div>
      </motion.div>

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: chart + details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <PriceChart market={market} />
          </motion.div>

          {/* Resolution rules */}
          {market.resolutionRules && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5"
            >
              <h3 className="text-sm font-bold text-zinc-100 mb-3 uppercase tracking-wider">
                Resolution Rules
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{market.resolutionRules}</p>
            </motion.div>
          )}

          {/* Market info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5"
          >
            <h3 className="text-sm font-bold text-zinc-100 mb-3 uppercase tracking-wider">
              Market Info
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: "Market ID", value: market.id },
                { label: "Chain", value: "Arc Testnet" },
                { label: "Settlement", value: "USDC" },
                { label: "Created", value: market.createdAt ? new Date(market.createdAt).toLocaleDateString() : "—" },
                { label: "Closes", value: market.endDate ? new Date(market.endDate).toLocaleDateString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-zinc-800/60 pb-2 last:border-0 last:pb-0">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-300 font-medium font-mono">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: trading panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <TradingPanel
            market={market}
            isConnected={isConnected}
            onConnect={handleConnect}
          />
        </motion.div>
      </div>
    </div>
  );
}
