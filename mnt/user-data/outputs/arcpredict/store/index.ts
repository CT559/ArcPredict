/**
 * store/index.ts
 * ─────────────
 * Zustand global store — manages UI state, market cache, and wallet state.
 * Uses immer for immutable updates.
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import type { Market, MarketCategory, WalletState, Position } from "@/types";

// ─── UI Slice ──────────────────────────────────────────────────────────────────

interface UISlice {
  sidebarOpen: boolean;
  activeCategory: MarketCategory | "all";
  searchQuery: string;
  sortBy: "volume" | "newest" | "expiring" | "trending";
  mobileMenuOpen: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveCategory: (cat: MarketCategory | "all") => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: "volume" | "newest" | "expiring" | "trending") => void;
  setMobileMenuOpen: (open: boolean) => void;
}

// ─── Market Cache Slice ────────────────────────────────────────────────────────

interface MarketCacheSlice {
  markets: Market[];
  featuredMarkets: Market[];
  isMarketsLoading: boolean;
  marketsError: string | null;
  lastFetchedAt: number | null;

  platformStats: {
    totalVolume: number;
    activeMarkets: number;
    totalTraders: number;
    totalLiquidity: number;
  } | null;

  setMarkets: (markets: Market[]) => void;
  setFeaturedMarkets: (markets: Market[]) => void;
  setMarketsLoading: (loading: boolean) => void;
  setMarketsError: (error: string | null) => void;
  setPlatformStats: (stats: MarketCacheSlice["platformStats"]) => void;
  updateMarket: (id: string, patch: Partial<Market>) => void;
}

// ─── Wallet Slice ──────────────────────────────────────────────────────────────

interface WalletSlice {
  wallet: WalletState;
  positions: Position[];

  setWallet: (wallet: Partial<WalletState>) => void;
  resetWallet: () => void;
  setPositions: (positions: Position[]) => void;
}

// ─── Combined Store ────────────────────────────────────────────────────────────

type ArcStore = UISlice & MarketCacheSlice & WalletSlice;

const defaultWallet: WalletState = {
  address: null,
  usdcBalance: "0.00",
  isConnected: false,
  chainId: null,
};

export const useArcStore = create<ArcStore>()(
  devtools(
    immer((set) => ({
      // ── UI State ──────────────────────────────────────────────────────────

      sidebarOpen: false,
      activeCategory: "all",
      searchQuery: "",
      sortBy: "volume",
      mobileMenuOpen: false,

      setSidebarOpen: (open) =>
        set((state) => { state.sidebarOpen = open; }),

      toggleSidebar: () =>
        set((state) => { state.sidebarOpen = !state.sidebarOpen; }),

      setActiveCategory: (cat) =>
        set((state) => { state.activeCategory = cat; }),

      setSearchQuery: (q) =>
        set((state) => { state.searchQuery = q; }),

      setSortBy: (sort) =>
        set((state) => { state.sortBy = sort; }),

      setMobileMenuOpen: (open) =>
        set((state) => { state.mobileMenuOpen = open; }),

      // ── Market Cache ──────────────────────────────────────────────────────

      markets: [],
      featuredMarkets: [],
      isMarketsLoading: false,
      marketsError: null,
      lastFetchedAt: null,
      platformStats: null,

      setMarkets: (markets) =>
        set((state) => {
          state.markets = markets;
          state.lastFetchedAt = Date.now();
        }),

      setFeaturedMarkets: (markets) =>
        set((state) => { state.featuredMarkets = markets; }),

      setMarketsLoading: (loading) =>
        set((state) => { state.isMarketsLoading = loading; }),

      setMarketsError: (error) =>
        set((state) => { state.marketsError = error; }),

      setPlatformStats: (stats) =>
        set((state) => { state.platformStats = stats; }),

      updateMarket: (id, patch) =>
        set((state) => {
          const idx = state.markets.findIndex((m) => m.id === id);
          if (idx !== -1) {
            state.markets[idx] = { ...state.markets[idx], ...patch };
          }
        }),

      // ── Wallet ─────────────────────────────────────────────────────────────

      wallet: defaultWallet,
      positions: [],

      setWallet: (wallet) =>
        set((state) => {
          state.wallet = { ...state.wallet, ...wallet };
        }),

      resetWallet: () =>
        set((state) => { state.wallet = defaultWallet; }),

      setPositions: (positions) =>
        set((state) => { state.positions = positions; }),
    })),
    { name: "ArcPredict" }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectFilteredMarkets = (state: ArcStore) => {
  const { markets, activeCategory, searchQuery, sortBy } = state;
  let results = [...markets];

  if (activeCategory !== "all") {
    results = results.filter((m) => m.category === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q))
    );
  }

  switch (sortBy) {
    case "volume":    results.sort((a, b) => b.totalVolume - a.totalVolume); break;
    case "newest":    results.sort((a, b) => b.createdAt - a.createdAt); break;
    case "expiring":  results.sort((a, b) => a.expiresAt - b.expiresAt); break;
    case "trending":  results.sort((a, b) => b.volume24h - a.volume24h); break;
  }

  return results;
};
