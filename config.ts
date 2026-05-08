import { defineChain } from "viem";

// ─── Arc Testnet Chain Definition ─────────────────────────────────────────────
export const arcTestnet = defineChain({
  id: 11124,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.arc.testnet.abstract.money"],
      webSocket: ["wss://rpc.arc.testnet.abstract.money/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.testnet.abstract.money",
    },
  },
  testnet: true,
});

// ─── Contract Addresses ────────────────────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
    "0x3600000000000000000000000000000000000000") as `0x${string}`,
  ARC_PREDICT: (process.env.NEXT_PUBLIC_ARC_PREDICT_ADDRESS ??
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
} as const;

// ─── USDC has 6 decimals ───────────────────────────────────────────────────────
export const USDC_DECIMALS = 6;

// ─── Outcome enum (mirrors Solidity) ─────────────────────────────────────────
export const Outcome = {
  YES: 0,
  NO: 1,
} as const;
export type OutcomeType = (typeof Outcome)[keyof typeof Outcome];

// ─── Protocol fee (basis points) default ─────────────────────────────────────
export const DEFAULT_FEE_BPS = 200n; // 2%
