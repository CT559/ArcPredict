"use client";
// components/TickerTape.tsx

import { TICKER_ITEMS } from "@/lib/mockData";

export default function TickerTape() {
  // Duplicate items for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-hidden py-2">
      <div className="flex animate-ticker gap-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-6 shrink-0 text-sm"
          >
            <span className="text-[var(--text-muted)] font-medium">{item.label}</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{item.value}</span>
            <span
              className={`font-mono text-xs font-bold ${
                item.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {item.change}
            </span>
            <span className="text-[var(--border)] select-none">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
