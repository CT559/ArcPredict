// ─── Market Types ──────────────────────────────────────────────────────────────

export type MarketCategory =
  | "crypto"
  | "commodities"
  | "energy"
  | "macro"
  | "equities";

export type MarketStatus = "active" | "resolved" | "pending" | "paused";

export type MarketOutcome = "YES" | "NO";

export interface PricePoint {
  timestamp: number; // Unix ms
  yes: number; // 0–1
  no: number;
  volume: number; // USDC
}

export interface MarketOutcomeStats {
  label: MarketOutcome;
  probability: number; // 0–1
  totalShares: number;
  priceUSDC: number; // cost per share
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  status: MarketStatus;
  imageUrl?: string;
  icon: string; // emoji fallback
  createdAt: number; // Unix ms
  expiresAt: number; // Unix ms
  resolvedAt?: number;
  resolutionSource: string;

  // Financials
  totalVolume: number; // USDC
  liquidity: number; // USDC
  openInterest: number; // USDC

  // Outcomes
  outcomes: {
    yes: MarketOutcomeStats;
    no: MarketOutcomeStats;
  };

  // 24h snapshot
  change24h: number; // percentage points change in YES prob
  volume24h: number;

  // History (hourly for last 24h, daily for last 30d)
  priceHistory24h: PricePoint[];
  priceHistory30d: PricePoint[];

  // Tags
  tags: string[];
  featured: boolean;
}

// ─── Store Types ───────────────────────────────────────────────────────────────

export interface UIState {
  sidebarOpen: boolean;
  activeCategory: MarketCategory | "all";
  searchQuery: string;
  sortBy: "volume" | "newest" | "expiring" | "trending";
  markets: Market[];
  featuredMarkets: Market[];
  isMarketsLoading: boolean;
}

// ─── Wallet / Web3 Types ───────────────────────────────────────────────────────

export interface WalletState {
  address: string | null;
  usdcBalance: string; // formatted string e.g. "1,234.56"
  isConnected: boolean;
  chainId: number | null;
}

// ─── Position Types ────────────────────────────────────────────────────────────

export interface Position {
  marketId: string;
  outcome: MarketOutcome;
  shares: number;
  avgPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}
