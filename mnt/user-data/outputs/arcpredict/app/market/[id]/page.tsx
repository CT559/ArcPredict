// app/market/[id]/page.tsx
// ─────────────────────────
// Shell for individual market detail page — will be fully built in Phase 2.

import { notFound } from "next/navigation";
import { MarketService } from "@/services/market-service";

interface Props {
  params: { id: string };
}

export default async function MarketPage({ params }: Props) {
  const market = await MarketService.getMarket(params.id);

  if (!market) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Phase 2: Full market detail UI goes here */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{market.icon}</span>
          <div>
            <p className="text-xs text-arc-text-muted uppercase tracking-wide">{market.category}</p>
            <h1 className="text-2xl font-bold font-display text-arc-text-primary leading-tight">
              {market.title}
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-arc-border bg-arc-surface p-6">
          <p className="text-arc-text-secondary text-sm mb-4">{market.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-arc-text-muted">YES Probability</p>
              <p className="text-xl font-bold text-arc-yes">
                {Math.round(market.outcomes.yes.probability * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-arc-text-muted">NO Probability</p>
              <p className="text-xl font-bold text-arc-no">
                {Math.round(market.outcomes.no.probability * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-arc-text-muted">Total Volume</p>
              <p className="text-xl font-bold text-arc-text-primary">
                ${(market.totalVolume / 1_000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-xs text-arc-text-muted">Liquidity</p>
              <p className="text-xl font-bold text-arc-text-primary">
                ${(market.liquidity / 1_000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-arc-text-muted text-sm mt-12">
          Full trading interface coming in Phase 2 →
        </p>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const markets = await MarketService.getMarkets();
  return markets.map((m) => ({ id: m.id }));
}
