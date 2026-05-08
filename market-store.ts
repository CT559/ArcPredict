import { create } from "zustand";
import type { Market } from "@/services/market-service";

interface MarketStore {
  markets: Market[];
  isLoading: boolean;
  setMarkets: (markets: Market[]) => void;
  setLoading: (loading: boolean) => void;
  updateMarket: (id: string, patch: Partial<Market>) => void;
  clearMarkets: () => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  markets: [],
  isLoading: false,

  setMarkets: (markets) => set({ markets }),

  setLoading: (isLoading) => set({ isLoading }),

  updateMarket: (id, patch) =>
    set((state) => ({
      markets: state.markets.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  clearMarkets: () => set({ markets: [], isLoading: false }),
}));
