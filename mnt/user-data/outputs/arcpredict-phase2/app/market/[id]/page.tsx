import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MarketDetailClient } from "./MarketDetailClient";
import { getMarketById, getAllMarkets } from "@/services/market-service";

interface Props {
  params: { id: string };
}

// Static params for SSG (optional — remove if using fully dynamic)
export async function generateStaticParams() {
  const markets = await getAllMarkets();
  return markets.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Props) {
  const market = await getMarketById(params.id);
  if (!market) return { title: "Market Not Found — ArcPredict" };
  return {
    title: `${market.title} — ArcPredict`,
    description: market.description ?? "Trade on this prediction market with USDC on Arc Testnet.",
  };
}

export default async function MarketDetailPage({ params }: Props) {
  const market = await getMarketById(params.id);
  if (!market) notFound();

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[400px] bg-indigo-900/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-900/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="text-zinc-500 text-sm animate-pulse">Loading market…</div></div>}>
          <MarketDetailClient market={market} />
        </Suspense>
      </div>
    </main>
  );
}
