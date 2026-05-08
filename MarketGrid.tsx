"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingUp, DollarSign, Layers } from "lucide-react";
import { MarketCard } from "@/components/markets/MarketCard";
import { MarketFilters, SortOption, CategoryFilter } from "@/components/markets/MarketFilters";
import { useMarkets } from "@/hooks/use-markets";
import type { Market } from "@/services/market-service";

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3">
      <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      <div>
        <div className="text-xs text-zinc-500 font-medium">{label}</div>
        <div className="text-sm font-bold text-zinc-100">{value}</div>
      </div>
    </div>
  );
}

function formatVolume(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function MarketGrid() {
  const { markets, isLoading } = useMarkets();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("volume");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    let list: Market[] = [...(markets ?? [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      list = list.filter((m) => m.category?.toLowerCase() === category);
    }

    switch (sort) {
      case "volume":
        list.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case "trending":
        list.sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      case "endingSoon":
        list.sort((a, b) => new Date(a.endDate ?? 0).getTime() - new Date(b.endDate ?? 0).getTime());
        break;
    }

    return list;
  }, [markets, search, sort, category]);

  const totalVolume = useMemo(
    () => (markets ?? []).reduce((s, m) => s + m.volume24h, 0),
    [markets]
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            <Activity className="w-3.5 h-3.5" /> Live Markets
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Predict the Future.{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Earn USDC.
          </span>
        </h1>
        <p className="mt-2 text-zinc-400 text-sm max-w-xl">
          Trade outcome shares on real-world events. Powered by Arc Testnet.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={<Layers className="w-4 h-4 text-indigo-400" />}
          label="Active Markets"
          value={(markets?.length ?? 0).toString()}
          accent="bg-indigo-500/10"
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
          label="24h Volume"
          value={formatVolume(totalVolume)}
          accent="bg-emerald-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
          label="Chain"
          value="Arc Testnet"
          accent="bg-blue-500/10"
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-amber-400" />}
          label="Currency"
          value="USDC"
          accent="bg-amber-500/10"
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MarketFilters
          onSearch={setSearch}
          onSort={setSort}
          onCategory={setCategory}
          activeCategory={category}
          activeSort={sort}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <Layers className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No markets match your filters.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((market, i) => (
              <MarketCard key={market.id} market={market} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Result count */}
      {!isLoading && filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-xs text-zinc-600"
        >
          Showing {filtered.length} of {markets?.length ?? 0} markets
        </motion.p>
      )}
    </section>
  );
}
