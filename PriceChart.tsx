"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import type { Market } from "@/services/market-service";

type Timeframe = "1H" | "6H" | "1D" | "1W" | "ALL";

const TIMEFRAMES: Timeframe[] = ["1H", "6H", "1D", "1W", "ALL"];

interface PriceChartProps {
  market: Market;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-400">
          YES: {parseFloat(payload[0]?.value ?? 0).toFixed(1)}¢
        </p>
        {payload[1] && (
          <p className="text-sm font-bold text-rose-400">
            NO: {parseFloat(payload[1]?.value ?? 0).toFixed(1)}¢
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function PriceChart({ market }: PriceChartProps) {
  const [tf, setTf] = useState<Timeframe>("1D");

  const chartData = useMemo(() => {
    const history = market.priceHistory ?? [];
    // Slice based on timeframe (mock: slice tail)
    const sliceMap: Record<Timeframe, number> = {
      "1H": 6,
      "6H": 12,
      "1D": 24,
      "1W": history.length,
      ALL: history.length,
    };
    const slice = history.slice(-sliceMap[tf]);

    return slice.map((p, i) => {
      const now = Date.now();
      const intervalMs = { "1H": 600_000, "6H": 1_800_000, "1D": 3_600_000, "1W": 86_400_000, ALL: 86_400_000 }[tf];
      const ts = new Date(now - (slice.length - i) * intervalMs);
      const label =
        tf === "1W" || tf === "ALL"
          ? ts.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      return { t: label, yes: (p * 100).toFixed(1), no: ((1 - p) * 100).toFixed(1) };
    });
  }, [market.priceHistory, tf]);

  const isUp = (market.priceChange24h ?? 0) >= 0;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <span className="text-sm font-bold text-zinc-100">Price History</span>
          <span className="ml-3 text-xs text-zinc-500">YES probability over time</span>
        </div>
        {/* Timeframe selector */}
        <div className="flex items-center gap-0.5 bg-zinc-950/60 rounded-lg p-0.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150",
                tf === t
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="noGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "#52525b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#52525b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}¢`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="yes"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#yesGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="no"
              stroke="#f43f5e"
              strokeWidth={1.5}
              fill="url(#noGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 pb-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" /> YES</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 inline-block rounded" /> NO</span>
      </div>
    </div>
  );
}
