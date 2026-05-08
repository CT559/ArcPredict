"use client";

import { useMarkets } from "@/hooks/use-markets";
import { useArcStore } from "@/store";
import { MarketCard, MarketCardSkeleton } from "@/components/markets/market-card";
import { CategoryFilter, SortBar } from "@/components/markets/category-filter";
import { AlertCircle, RefreshCw } from "lucide-react";

export function MarketsSection() {
  const { filteredMarkets, isMarketsLoading, marketsError, refresh } = useMarkets();
  const { searchQuery, activeCategory } = useArcStore();

  const emptyMessage =
    searchQuery
      ? `No markets found for "${searchQuery}"`
      : activeCategory !== "all"
      ? `No ${activeCategory} markets found`
      : "No markets available";

  return (
    <section id="markets" className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-20">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-arc-text-primary">
            Prediction Markets
          </h2>
          {!isMarketsLoading && (
            <p className="text-sm text-arc-text-muted mt-0.5">
              {filteredMarkets.length} market{filteredMarkets.length !== 1 ? "s" : ""} available
            </p>
          )}
        </div>
        <SortBar />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter />
      </div>

      {/* Error State */}
      {marketsError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle size={32} className="text-arc-no" />
          <p className="text-arc-text-secondary">{marketsError}</p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-arc-elevated border border-arc-border text-arc-text-secondary hover:text-arc-text-primary text-sm transition-colors"
          >
            <RefreshCw size={13} />
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isMarketsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <MarketCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Markets Grid */}
      {!isMarketsLoading && !marketsError && (
        <>
          {filteredMarkets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-arc-text-secondary font-medium">{emptyMessage}</p>
              <p className="text-arc-text-muted text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMarkets.map((market, idx) => (
                <div
                  key={market.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
                >
                  <MarketCard market={market} featured={market.featured} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
