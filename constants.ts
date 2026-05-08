// ─── Chain Configuration ───────────────────────────────────────────────────────

export const ARC_TESTNET_CHAIN_ID = 4552; // Arc Testnet chain ID (verify with Arc docs)

export const ARC_TESTNET = {
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "ARC",
    symbol: "ARC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.xyz"], // Update with actual Arc RPC
    },
    public: {
      http: ["https://rpc.testnet.arc.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.testnet.arc.xyz",
    },
  },
  testnet: true,
} as const;

// ─── Contract Addresses ────────────────────────────────────────────────────────

export const CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  // Add prediction market contract addresses here in later phases
  PREDICTION_MARKET_FACTORY: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  CONDITIONAL_TOKEN: "0x0000000000000000000000000000000000000000" as `0x${string}`,
} as const;

// ─── App-Kit Configuration ─────────────────────────────────────────────────────

export const APP_KIT_PROJECT_ID = process.env.NEXT_PUBLIC_KIT_KEY ?? "";

// ─── App Metadata ──────────────────────────────────────────────────────────────

export const APP_META = {
  name: "ArcPredict",
  description: "Decentralized prediction markets on Arc Testnet",
  url: "https://arcpredict.xyz",
  icons: ["/logo.svg"],
} as const;

// ─── USDC Formatting ───────────────────────────────────────────────────────────

export const USDC_DECIMALS = 6;
export const USDC_SYMBOL = "USDC";

// ─── UI Constants ──────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "all", label: "All Markets", emoji: "🌐" },
  { id: "crypto", label: "Crypto", emoji: "₿" },
  { id: "commodities", label: "Commodities", emoji: "🥇" },
  { id: "energy", label: "Energy", emoji: "⚡" },
  { id: "macro", label: "Macro", emoji: "📊" },
  { id: "equities", label: "Equities", emoji: "📈" },
] as const;

export const SORT_OPTIONS = [
  { id: "volume", label: "Highest Volume" },
  { id: "newest", label: "Newest" },
  { id: "expiring", label: "Expiring Soon" },
  { id: "trending", label: "Trending" },
] as const;

export const MARKETS_PER_PAGE = 12;
