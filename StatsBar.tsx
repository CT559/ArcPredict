"use client";
// components/StatsBar.tsx

import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, DollarSign } from "lucide-react";
import { MARKETS } from "@/lib/mockData";

const totalVolume = MARKETS.reduce((a, m) => a + m.volume, 0);
const totalBets = MARKETS.reduce((a, m) => a + m.totalBets, 0);
const totalTraders = MARKETS.reduce((a, m) => a + m.stats.uniqueTraders, 0);

const STATS = [
  {
    label: "Tổng Volume",
    value: `$${(totalVolume / 1000000).toFixed(1)}M`,
    sub: "USDC",
    icon: DollarSign,
    color: "text-gold-300",
    bg: "bg-gold-400/10",
  },
  {
    label: "Thị trường Active",
    value: MARKETS.length.toString(),
    sub: "markets",
    icon: Activity,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    label: "Tổng Cược",
    value: totalBets.toLocaleString(),
    sub: "predictions",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    label: "Traders",
    value: totalTraders.toLocaleString(),
    sub: "unique wallets",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="glass-card p-4 flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <div className={`text-xl font-mono font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
