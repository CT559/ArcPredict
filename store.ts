// lib/store.ts
// Global state management with Zustand + localStorage persistence

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Bet, Market, RESOLVED_MARKETS } from "./mockData";

// ── Wallet State ────────────────────────────────────────
interface WalletState {
  isConnected: boolean;
  address: string | null;
  usdcBalance: number;
  network: string | null;
  isCorrectNetwork: boolean;
}

// ── App State ────────────────────────────────────────────
interface AppState extends WalletState {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Bets
  bets: Bet[];
  placeBet: (bet: Omit<Bet, "id" | "timestamp" | "status">) => boolean;
  claimWinnings: (betId: string) => boolean;
  getMarketBets: (marketId: string) => Bet[];

  // Market management (admin)
  resolvedMarkets: Map<string, "yes" | "no">;
  resolveMarket: (marketId: string, outcome: "yes" | "no") => void;

  // Statistics
  getTotalProfit: () => number;
  getWinRate: () => number;
}

const MOCK_WALLET_ADDRESS = "0xArc1234567890abcdef1234567890abcdef123456";
const ARC_TESTNET_CHAIN_ID = "0x499602D2"; // 1234567890 in hex

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State ─────────────────────────────────
      theme: "dark",
      isConnected: false,
      address: null,
      usdcBalance: 0,
      network: null,
      isCorrectNetwork: false,
      bets: [],
      resolvedMarkets: new Map(),

      // ── Theme ─────────────────────────────────────────
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // ── Wallet ────────────────────────────────────────
      connectWallet: async () => {
        // Simulate MetaMask connection with mock data
        await new Promise((r) => setTimeout(r, 800));

        // In production: use window.ethereum.request({ method: 'eth_requestAccounts' })
        set({
          isConnected: true,
          address: MOCK_WALLET_ADDRESS,
          usdcBalance: 10000 + Math.floor(Math.random() * 5000), // Mock balance
          network: "Arc Testnet",
          isCorrectNetwork: true,
        });
      },

      disconnectWallet: () =>
        set({
          isConnected: false,
          address: null,
          usdcBalance: 0,
          network: null,
          isCorrectNetwork: false,
        }),

      // ── Betting ───────────────────────────────────────
      placeBet: (betData) => {
        const { usdcBalance, address, isConnected } = get();
        if (!isConnected || !address) return false;
        if (betData.amount > usdcBalance) return false;

        const newBet: Bet = {
          ...betData,
          id: `bet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
          walletAddress: address,
          status: "open",
        };

        set((s) => ({
          bets: [...s.bets, newBet],
          usdcBalance: s.usdcBalance - betData.amount,
        }));

        return true;
      },

      claimWinnings: (betId) => {
        const { bets, resolvedMarkets } = get();
        const bet = bets.find((b) => b.id === betId);
        if (!bet || bet.status !== "open") return false;

        // Check if market is resolved
        const outcome = resolvedMarkets.get(bet.marketId);

        // Also check pre-resolved markets
        const preResolved = RESOLVED_MARKETS.find(
          (m) => m.id === bet.marketId
        );
        const finalOutcome = outcome || preResolved?.outcome;

        if (!finalOutcome) return false;

        const won = bet.position === finalOutcome;

        set((s) => ({
          bets: s.bets.map((b) =>
            b.id === betId
              ? { ...b, status: won ? "won" : "lost" }
              : b
          ),
          usdcBalance: won
            ? s.usdcBalance + bet.potentialWinnings
            : s.usdcBalance,
        }));

        return won;
      },

      getMarketBets: (marketId) => {
        return get().bets.filter((b) => b.marketId === marketId);
      },

      // ── Admin ─────────────────────────────────────────
      resolveMarket: (marketId, outcome) => {
        set((s) => {
          const updated = new Map(s.resolvedMarkets);
          updated.set(marketId, outcome);
          return { resolvedMarkets: updated };
        });
      },

      // ── Statistics ────────────────────────────────────
      getTotalProfit: () => {
        const { bets } = get();
        return bets.reduce((acc, bet) => {
          if (bet.status === "won") return acc + (bet.potentialWinnings - bet.amount);
          if (bet.status === "lost") return acc - bet.amount;
          return acc;
        }, 0);
      },

      getWinRate: () => {
        const { bets } = get();
        const settled = bets.filter(
          (b) => b.status === "won" || b.status === "lost"
        );
        if (settled.length === 0) return 0;
        const wins = settled.filter((b) => b.status === "won").length;
        return Math.round((wins / settled.length) * 100);
      },
    }),
    {
      name: "arcpredict-storage",
      storage: createJSONStorage(() => localStorage),
      // Serialize Map properly
      partialize: (state) => ({
        ...state,
        resolvedMarkets: Array.from(state.resolvedMarkets.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.resolvedMarkets)) {
          state.resolvedMarkets = new Map(
            state.resolvedMarkets as unknown as [string, "yes" | "no"][]
          );
        }
      },
    }
  )
);
