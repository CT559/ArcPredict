"use client";

import { useMarkets } from "@/hooks/use-markets";
import { formatUSDC } from "@/lib/utils";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const STAT_ITEMS = [
  { label: "Total Volume", key: "totalVolume", prefix: "" },
  { label: "Active Markets", key: "activeMarkets", prefix: "" },
  { label: "Total Traders", key: "totalTraders", prefix: "" },
  { label: "Total Liquidity", key: "totalLiquidity", prefix: "" },
] as const;

function StatBox({
  label,
  value,
  isVolume,
}: {
  label: string;
  value: number;
  isVolume?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl md:text-3xl font-bold font-display text-arc-text-primary tabular-nums">
        {isVolume
          ? formatUSDC(value)
          : value.toLocaleString()}
      </span>
      <span className="text-xs text-arc-text-muted mt-0.5">{label}</span>
    </div>
  );
}

export function HeroSection() {
  const { platformStats, isMarketsLoading } = useMarkets();

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-arc-grid bg-grid opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-arc-glow pointer-events-none" />

      {/* Radial center glow */}
      <div className="
        absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
        bg-arc-primary/8 rounded-full blur-3xl pointer-events-none
      " />

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="
            inline-flex items-center gap-2 px-3 py-1.5
            bg-arc-primary/10 border border-arc-primary/30 rounded-full
            text-xs text-arc-primary font-medium
          ">
            <Zap size={11} className="fill-arc-primary" />
            Live on Arc Testnet
          </div>
        </div>

        {/* Headline */}
        <h1 className="
          text-center font-display font-bold
          text-4xl sm:text-5xl md:text-6xl
          text-arc-text-primary leading-[1.1] tracking-tight
          mb-5
        ">
          Predict. Trade.{" "}
          <span className="
            bg-gradient-to-r from-arc-primary via-arc-secondary to-arc-primary
            bg-clip-text text-transparent bg-[length:200%_auto]
            animate-pulse-slow
          ">
            Win.
          </span>
        </h1>

        <p className="
          text-center text-arc-text-secondary text-base sm:text-lg
          max-w-xl mx-auto mb-8
        ">
          Trade on the outcomes of real-world events across crypto, commodities,
          energy & macro markets — powered by Arc Testnet.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <Link
            href="#markets"
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-arc-primary hover:bg-arc-primary-hover
              text-white text-sm font-semibold
              shadow-arc-glow transition-all duration-200
              hover:shadow-[0_0_32px_rgba(59,130,246,0.4)]
            "
          >
            Explore Markets
            <ArrowRight size={15} />
          </Link>
          <Link
            href="https://docs.arcpredict.xyz"
            target="_blank"
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg
              border border-arc-border bg-arc-surface
              text-arc-text-secondary hover:text-arc-text-primary
              text-sm font-semibold transition-all duration-200
              hover:border-arc-primary/40
            "
          >
            How it works
          </Link>
        </div>

        {/* Stats Row */}
        {!isMarketsLoading && platformStats && (
          <div className="
            grid grid-cols-2 sm:grid-cols-4 gap-px
            bg-arc-border rounded-xl overflow-hidden
            border border-arc-border
          ">
            {[
              { label: "Total Volume", value: platformStats.totalVolume, isVolume: true },
              { label: "Active Markets", value: platformStats.activeMarkets },
              { label: "Traders", value: platformStats.totalTraders },
              { label: "Liquidity", value: platformStats.totalLiquidity, isVolume: true },
            ].map(({ label, value, isVolume }) => (
              <div
                key={label}
                className="bg-arc-surface px-6 py-5 hover:bg-arc-elevated transition-colors"
              >
                <StatBox label={label} value={value} isVolume={isVolume} />
              </div>
            ))}
          </div>
        )}

        {isMarketsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-arc-border rounded-xl overflow-hidden border border-arc-border animate-pulse">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-arc-surface px-6 py-5">
                <div className="w-24 h-7 bg-arc-muted rounded mb-1" />
                <div className="w-16 h-3 bg-arc-muted rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
