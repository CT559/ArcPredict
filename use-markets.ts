"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/store/market-store";
import { getAllMarkets, getMarketById } from "@/services/market-service";
import type { Market } from "@/services/market-service";

/**
 * useMarkets — fetches all markets and syncs to Zustand store.
 */
export function useMarkets() {
  const { markets, setMarkets, isLoading, setLoading } = useMarketStore();

  useEffect(() => {
    if (markets.length > 0) return; // already loaded
    setLoading(true);
    getAllMarkets()
      .then(setMarkets)
      .finally(() => setLoading(false));
  }, []);

  return { markets, isLoading };
}

/**
 * useMarket — fetches a single market by ID.
 */
export function useMarket(id: string) {
  const { markets, setMarkets, isLoading, setLoading } = useMarketStore();
  const market = markets.find((m) => m.id === id) ?? null;

  useEffect(() => {
    if (market) return;
    setLoading(true);
    getMarketById(id)
      .then((m) => {
        if (m) setMarkets([...markets, m]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { market, isLoading };
}
