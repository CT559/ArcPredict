"use client";
// components/MarketCard.tsx

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Users, Flame } from "lucide-react";
import { Market, formatUSDC, getTimeLeft, getCategoryColor } from "@/lib/mockData";

interface MarketCardProps {
  market: Market;
  index?: number;
}

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  "Kim loại": "badge-metal",
  "Năng lượng": "badge-energy",
  "Lương thực": "badge-food",
  Crypto: "badge-crypto",
};

export default function MarketCard({ market, index = 0 }: MarketCardProps) {
  const timeLeft = getTimeLeft(market.resolveDate);
  const isUrgent = timeLeft.includes("h") && !timeLeft.includes("d");
  const isHot = market.totalBets > 1000;

  const yesWidth = `${market.probability}%`;
  const noWidth = `${100 - market.probability}%`;

  const probColor =
    market.probability >= 70
      ? "text-emerald-400"
      : market.probability >= 55
      ? "text-teal-400"
      : market.probability >= 45
      ? "text-gold-300"
      : market.probability >= 30
      ? "text-orange-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link href={`/markets/${market.id}`} className="block h-full">
        <div className="glass-card-hover h-full p-5 flex flex-col gap-4 cursor-pointer group">

          {/* Top row: category badge + hot tag + time */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={CATEGORY_BADGE_CLASS[market.category] || "badge-crypto"}>
                {market.icon} {market.category}
              </span>
              {isHot && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-400/15 text-orange-400 border border-orange-400/25">
                  <Flame className="w-3 h-3" />
                  Hot
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
              isUrgent ? "text-orange-400" : "text-[var(--text-muted)]"
            }`}>
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors duration-200">
            {market.title}
          </h3>

          {/* Probability section */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--text-muted)]">Xác suất YES</span>
              <span className={`text-2xl font-mono font-bold ${probColor}`}>
                {market.probability}%
              </span>
            </div>

            {/* Dual progress bar */}
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-l-full transition-all duration-500"
                style={{
                  width: yesWidth,
                  background: "linear-gradient(90deg, #22D3EE, #06B6D4)",
                }}
              />
              <div
                className="h-full rounded-r-full transition-all duration-500"
                style={{
                  width: noWidth,
                  background: "linear-gradient(90deg, #FB923C, #EF4444)",
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span className="text-cyan-400 font-medium">YES {market.probability}¢</span>
              <span className="text-orange-400 font-medium">NO {100 - market.probability}¢</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--border)]">
            <div className="text-center">
              <div className="text-xs text-[var(--text-muted)] mb-0.5">Volume</div>
              <div className="text-xs font-bold text-gold-300">{formatUSDC(market.volume)}</div>
            </div>
            <div className="text-center border-x border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)] mb-0.5 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Cược
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {market.totalBets.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-muted)] mb-0.5 flex items-center justify-center gap-0.5">
                <Users className="w-3 h-3" /> Traders
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {market.stats.uniqueTraders}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
