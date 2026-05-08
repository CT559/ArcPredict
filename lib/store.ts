"use client";

import { Market, Bet, BetSide, MARKETS } from "./data";

const BETS_KEY = "arcpredict_bets";
const MARKETS_KEY = "arcpredict_markets";

export function getStoredBets(): Bet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BETS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function storeBet(bet: Bet): void {
  const bets = getStoredBets();
  bets.push(bet);
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));
}

export function getStoredMarkets(): Market[] {
  if (typeof window === "undefined") return MARKETS;
  try {
    const stored = localStorage.getItem(MARKETS_KEY);
    return stored ? JSON.parse(stored) : MARKETS;
  } catch {
    return MARKETS;
  }
}

export function updateMarket(updated: Market): void {
  const markets = getStoredMarkets();
  const idx = markets.findIndex((m) => m.id === updated.id);
  if (idx !== -1) markets[idx] = updated;
  else markets.push(updated);
  localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
}

export function placeBet(
  marketId: string,
  side: BetSide,
  amount: number,
  address: string
): Bet {
  const bet: Bet = {
    id: `bet_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    marketId,
    side,
    amount,
    timestamp: new Date().toISOString(),
    address,
    claimed: false,
  };

  // Update market pools
  const markets = getStoredMarkets();
  const market = markets.find((m) => m.id === marketId);
  if (market) {
    if (side === "yes") market.yesPool += amount;
    else market.noPool += amount;
    market.totalVolume += amount;
    localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
  }

  storeBet(bet);
  return bet;
}

export function getUserBetsForMarket(marketId: string, address: string): Bet[] {
  return getStoredBets().filter(
    (b) => b.marketId === marketId && b.address === address
  );
}

export function getAllUserBets(address: string): Bet[] {
  return getStoredBets().filter((b) => b.address === address);
}

export function claimReward(betId: string, payout: number): void {
  const bets = getStoredBets();
  const bet = bets.find((b) => b.id === betId);
  if (bet) {
    bet.claimed = true;
    bet.payout = payout;
    localStorage.setItem(BETS_KEY, JSON.stringify(bets));
  }
}

export function resolveMarket(
  marketId: string,
  outcome: "yes" | "no"
): void {
  const markets = getStoredMarkets();
  const market = markets.find((m) => m.id === marketId);
  if (market) {
    market.status = "resolved";
    market.resolvedOutcome = outcome;
    localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
  }
}
