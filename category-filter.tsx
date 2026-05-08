"use client";

import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { useArcStore } from "@/store";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

export function CategoryFilter() {
  const { activeCategory, setActiveCategory } = useArcStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {CATEGORIES.map(({ id, label, emoji }) => (
        <button
          key={id}
          onClick={() => setActiveCategory(id as any)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
            activeCategory === id
              ? "bg-arc-primary text-white shadow-arc-glow"
              : "bg-arc-surface border border-arc-border text-arc-text-secondary hover:text-arc-text-primary hover:border-arc-primary/40"
          )}
        >
          <span className="text-base leading-none">{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function SortBar() {
  const { sortBy, setSortBy } = useArcStore();

  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal size={14} className="text-arc-text-muted shrink-0" />
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {SORT_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSortBy(id as any)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200",
              sortBy === id
                ? "bg-arc-elevated text-arc-primary border border-arc-primary/40"
                : "text-arc-text-muted hover:text-arc-text-secondary border border-transparent"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
