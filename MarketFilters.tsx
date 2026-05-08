"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, TrendingUp, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "volume" | "newest" | "trending" | "endingSoon";
export type CategoryFilter = "all" | "crypto" | "politics" | "sports" | "tech" | "finance" | "economy";

interface MarketFiltersProps {
  onSearch: (q: string) => void;
  onSort: (s: SortOption) => void;
  onCategory: (c: CategoryFilter) => void;
  activeCategory: CategoryFilter;
  activeSort: SortOption;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "crypto", label: "Crypto" },
  { value: "politics", label: "Politics" },
  { value: "sports", label: "Sports" },
  { value: "tech", label: "Tech" },
  { value: "finance", label: "Finance" },
  { value: "economy", label: "Economy" },
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "volume", label: "Volume", icon: <DollarSign className="w-3.5 h-3.5" /> },
  { value: "trending", label: "Trending", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: "newest", label: "Newest", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "endingSoon", label: "Ending Soon", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
];

export function MarketFilters({
  onSearch,
  onSort,
  onCategory,
  activeCategory,
  activeSort,
}: MarketFiltersProps) {
  const [query, setQuery] = useState("");

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search markets..."
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl",
            "bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600",
            "focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Category pills + sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                activeCategory === cat.value
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 shrink-0">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSort(opt.value)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                activeSort === opt.value
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
