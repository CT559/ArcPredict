"use client";
// app/page.tsx - ArcPredict Homepage

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Sparkles, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import TickerTape from "@/components/TickerTape";
import StatsBar from "@/components/StatsBar";
import MarketCard from "@/components/MarketCard";
import { MARKETS, Category } from "@/lib/mockData";

const CATEGORIES: { label: string; value: "all" | Category }[] = [
  { label: "Tất cả", value: "all" },
  { label: "🥇 Kim loại", value: "Kim loại" },
  { label: "⛽ Năng lượng", value: "Năng lượng" },
  { label: "🌾 Lương thực", value: "Lương thực" },
  { label: "₿ Crypto", value: "Crypto" },
];

const SORT_OPTIONS = [
  { label: "Volume (cao nhất)", value: "volume" },
  { label: "Xác suất (cao nhất)", value: "probability" },
  { label: "Sắp đóng cửa", value: "closing" },
  { label: "Mới nhất", value: "newest" },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
  const [sortBy, setSortBy] = useState("volume");
  const [sortOpen, setSortOpen] = useState(false);

  // Filter + sort markets
  const filteredMarkets = useMemo(() => {
    let list = MARKETS.filter((m) => m.status === "active");

    if (activeCategory !== "all") {
      list = list.filter((m) => m.category === activeCategory);
    }

    switch (sortBy) {
      case "volume":
        return [...list].sort((a, b) => b.volume - a.volume);
      case "probability":
        return [...list].sort((a, b) => b.probability - a.probability);
      case "closing":
        return [...list].sort(
          (a, b) =>
            new Date(a.resolveDate).getTime() -
            new Date(b.resolveDate).getTime()
        );
      case "newest":
        return [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return list;
    }
  }, [activeCategory, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-grid">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 bg-gold-400 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-8 bg-cyan-500 pointer-events-none" />

      <Header />
      <TickerTape />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">

        {/* Hero Section */}
        <section className="py-12 lg:py-16 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/25 text-gold-300 text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Arc Testnet · USDC
            <span className="live-dot" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            Dự đoán giá{" "}
            <span className="gold-text">Kim loại</span>
            {" · "}
            <span className="cyan-text">Dầu</span>
            {" · "}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Lương thực
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto"
          >
            Nền tảng thị trường dự đoán phi tập trung. Dùng USDC để dự đoán
            biến động giá hàng hóa thực tế — Resolve trong 1-3 ngày.
          </motion.p>
        </section>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <StatsBar />
        </motion.div>

        <div className="section-divider mb-8" />

        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.value
                    ? "bg-gold-400/20 text-gold-300 border border-gold-400/40 shadow-gold-sm"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              {activeSortLabel}
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-52 glass-card py-1 z-10"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === opt.value
                          ? "text-gold-300 bg-gold-400/10"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--text-muted)]">
            Hiển thị{" "}
            <span className="text-[var(--text-primary)] font-medium">
              {filteredMarkets.length}
            </span>{" "}
            thị trường
            {activeCategory !== "all" && (
              <> trong <span className="text-gold-300">{activeCategory}</span></>
            )}
          </p>
        </div>

        {/* Market Grid */}
        <AnimatePresence mode="popLayout">
          {filteredMarkets.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredMarkets.map((market, i) => (
                <MarketCard key={market.id} market={market} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="text-5xl mb-4">📭</div>
              <div className="text-[var(--text-muted)] text-lg">
                Không có thị trường nào trong danh mục này
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2025 ArcPredict. Built on Arc Testnet.</span>
          <span className="flex items-center gap-1.5">
            <span className="live-dot" />
            Tất cả thị trường đang live
          </span>
        </div>
      </footer>

      {/* Close sort dropdown */}
      {sortOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setSortOpen(false)} />
      )}
    </div>
  );
}
