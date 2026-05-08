export type MarketCategory = "Metals" | "Energy" | "Agriculture" | "Crypto" | "Indices";
export type MarketStatus = "active" | "resolved" | "pending";
export type BetSide = "yes" | "no";

export interface PricePoint {
  time: string;
  price: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  symbol: string;
  emoji: string;
  currentPrice: number;
  targetPrice: number;
  direction: "above" | "below";
  resolutionDate: string;
  resolutionTime: string;
  status: MarketStatus;
  yesPool: number;
  noPool: number;
  totalVolume: number;
  resolvedOutcome?: "yes" | "no";
  priceHistory: PricePoint[];
  createdAt: string;
  tags: string[];
}

export interface Bet {
  id: string;
  marketId: string;
  side: BetSide;
  amount: number;
  timestamp: string;
  address: string;
  claimed: boolean;
  payout?: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  totalWon: number;
  totalBets: number;
  winRate: number;
  bestWin: number;
}

function generatePriceHistory(basePrice: number, points: number = 48): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * (0.92 + Math.random() * 0.08);
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 30 * 60 * 1000);
    const change = (Math.random() - 0.48) * (basePrice * 0.008);
    price = Math.max(price + change, basePrice * 0.85);
    history.push({
      time: time.toISOString(),
      price: Math.round(price * 100) / 100,
    });
  }
  return history;
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const MARKETS: Market[] = [
  {
    id: "gold-2400",
    title: "Gold above $2,400 by EOD?",
    description: "Will XAUUSD close above $2,400 per troy ounce at market close today? Gold has been testing resistance at this key psychological level amid dollar weakness.",
    category: "Metals",
    symbol: "XAUUSD",
    emoji: "🥇",
    currentPrice: 2387.50,
    targetPrice: 2400,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "16:00 EST",
    status: "active",
    yesPool: 48200,
    noPool: 31800,
    totalVolume: 80000,
    priceHistory: generatePriceHistory(2387.50),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ["metals", "safe-haven", "forex"],
  },
  {
    id: "silver-29",
    title: "Silver breaks $29 resistance?",
    description: "Will XAGUSD trade above $29.00 in the next 48 hours? Silver has been lagging gold's rally and a breakout could signal industrial demand surge.",
    category: "Metals",
    symbol: "XAGUSD",
    emoji: "🥈",
    currentPrice: 28.42,
    targetPrice: 29.00,
    direction: "above",
    resolutionDate: daysFromNow(2),
    resolutionTime: "16:00 EST",
    status: "active",
    yesPool: 22100,
    noPool: 28900,
    totalVolume: 51000,
    priceHistory: generatePriceHistory(28.42),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    tags: ["metals", "industrial"],
  },
  {
    id: "copper-4-50",
    title: "Copper holds above $4.50/lb?",
    description: "Will HG Copper futures remain above $4.50 per pound through end of week? China demand signals have been mixed following recent PMI data.",
    category: "Metals",
    symbol: "HGK24",
    emoji: "🔶",
    currentPrice: 4.56,
    targetPrice: 4.50,
    direction: "above",
    resolutionDate: daysFromNow(2),
    resolutionTime: "13:00 EST",
    status: "active",
    yesPool: 35700,
    noPool: 19300,
    totalVolume: 55000,
    priceHistory: generatePriceHistory(4.56),
    createdAt: new Date(Date.now() - 72000000).toISOString(),
    tags: ["metals", "industrial", "china"],
  },
  {
    id: "wti-80",
    title: "WTI Crude stays above $80?",
    description: "Will WTI Crude Oil futures close above $80/barrel today? OPEC+ supply cuts vs weak demand outlook from IEA creates uncertainty.",
    category: "Energy",
    symbol: "CLMAIN",
    emoji: "🛢️",
    currentPrice: 81.34,
    targetPrice: 80.00,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "14:30 EST",
    status: "active",
    yesPool: 61200,
    noPool: 38800,
    totalVolume: 100000,
    priceHistory: generatePriceHistory(81.34),
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    tags: ["energy", "opec", "macro"],
  },
  {
    id: "natgas-2",
    title: "Natural Gas above $2.00 MMBtu?",
    description: "Will Henry Hub Natural Gas futures exceed $2.00 per MMBtu by end of week? Storage draws and weather forecasts point to possible upside.",
    category: "Energy",
    symbol: "NGMAIN",
    emoji: "🔥",
    currentPrice: 1.87,
    targetPrice: 2.00,
    direction: "above",
    resolutionDate: daysFromNow(3),
    resolutionTime: "14:30 EST",
    status: "active",
    yesPool: 18400,
    noPool: 41600,
    totalVolume: 60000,
    priceHistory: generatePriceHistory(1.87),
    createdAt: new Date(Date.now() - 54000000).toISOString(),
    tags: ["energy", "weather", "utilities"],
  },
  {
    id: "wheat-550",
    title: "Wheat futures drop below $5.50?",
    description: "Will CBOT Wheat futures fall below $5.50 per bushel? Strong Black Sea supply and improving US crop conditions weigh on prices.",
    category: "Agriculture",
    symbol: "ZWMAIN",
    emoji: "🌾",
    currentPrice: 5.68,
    targetPrice: 5.50,
    direction: "below",
    resolutionDate: daysFromNow(2),
    resolutionTime: "13:15 EST",
    status: "active",
    yesPool: 24800,
    noPool: 35200,
    totalVolume: 60000,
    priceHistory: generatePriceHistory(5.68),
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    tags: ["agriculture", "grains", "ukraine"],
  },
  {
    id: "corn-430",
    title: "Corn above $4.30 by Friday?",
    description: "Will CBOT Corn futures trade above $4.30 per bushel by end of week? Ethanol demand and export pace will be key drivers.",
    category: "Agriculture",
    symbol: "ZCMAIN",
    emoji: "🌽",
    currentPrice: 4.21,
    targetPrice: 4.30,
    direction: "above",
    resolutionDate: daysFromNow(3),
    resolutionTime: "13:15 EST",
    status: "active",
    yesPool: 19600,
    noPool: 30400,
    totalVolume: 50000,
    priceHistory: generatePriceHistory(4.21),
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    tags: ["agriculture", "grains", "ethanol"],
  },
  {
    id: "soy-1150",
    title: "Soybeans hold $11.50?",
    description: "Will CBOT Soybean futures close above $11.50 per bushel? South American harvest pressure vs strong Chinese import demand.",
    category: "Agriculture",
    symbol: "ZSMAIN",
    emoji: "🫘",
    currentPrice: 11.62,
    targetPrice: 11.50,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "13:15 EST",
    status: "active",
    yesPool: 27300,
    noPool: 22700,
    totalVolume: 50000,
    priceHistory: generatePriceHistory(11.62),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    tags: ["agriculture", "oilseeds", "china"],
  },
  {
    id: "coffee-180",
    title: "Coffee breaks $1.80/lb?",
    description: "Will Arabica Coffee futures (KC) break above $1.80 per pound? Brazilian weather concerns and Vietnamese crop forecasts are pivotal.",
    category: "Agriculture",
    symbol: "KCMAIN",
    emoji: "☕",
    currentPrice: 1.74,
    targetPrice: 1.80,
    direction: "above",
    resolutionDate: daysFromNow(2),
    resolutionTime: "12:30 EST",
    status: "active",
    yesPool: 15200,
    noPool: 24800,
    totalVolume: 40000,
    priceHistory: generatePriceHistory(1.74),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    tags: ["agriculture", "soft-commodities", "brazil"],
  },
  {
    id: "bitcoin-65k",
    title: "Bitcoin above $65,000 in 24h?",
    description: "Will BTC/USD close above $65,000 in the next 24 hours? ETF flows and macro risk sentiment are key catalysts to watch.",
    category: "Crypto",
    symbol: "BTCUSD",
    emoji: "₿",
    currentPrice: 63240,
    targetPrice: 65000,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "00:00 UTC",
    status: "active",
    yesPool: 94500,
    noPool: 55500,
    totalVolume: 150000,
    priceHistory: generatePriceHistory(63240),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ["crypto", "bitcoin", "etf"],
  },
  {
    id: "ethereum-3200",
    title: "ETH breaks $3,200?",
    description: "Will Ethereum trade above $3,200 within 48 hours? The ETF decision timeline and DeFi TVL trends could drive this move.",
    category: "Crypto",
    symbol: "ETHUSD",
    emoji: "Ξ",
    currentPrice: 3087,
    targetPrice: 3200,
    direction: "above",
    resolutionDate: daysFromNow(2),
    resolutionTime: "00:00 UTC",
    status: "active",
    yesPool: 41200,
    noPool: 58800,
    totalVolume: 100000,
    priceHistory: generatePriceHistory(3087),
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    tags: ["crypto", "ethereum", "defi"],
  },
  {
    id: "spx-5200",
    title: "S&P 500 closes above 5,200?",
    description: "Will the S&P 500 index close above 5,200 points today? Earnings season results and Fed commentary are the primary catalysts.",
    category: "Indices",
    symbol: "SPX",
    emoji: "📈",
    currentPrice: 5178,
    targetPrice: 5200,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "16:00 EST",
    status: "active",
    yesPool: 52800,
    noPool: 47200,
    totalVolume: 100000,
    priceHistory: generatePriceHistory(5178),
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    tags: ["indices", "equities", "fed"],
  },
  {
    id: "gold-resolved-yes",
    title: "Gold above $2,350 last week?",
    description: "Did XAUUSD close above $2,350 at last Friday's market close? This market has been resolved.",
    category: "Metals",
    symbol: "XAUUSD",
    emoji: "🥇",
    currentPrice: 2361,
    targetPrice: 2350,
    direction: "above",
    resolutionDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    resolutionTime: "16:00 EST",
    status: "resolved",
    resolvedOutcome: "yes",
    yesPool: 67000,
    noPool: 33000,
    totalVolume: 100000,
    priceHistory: generatePriceHistory(2361),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    tags: ["metals", "resolved"],
  },
  {
    id: "btc-resolved-no",
    title: "BTC above $70K last week?",
    description: "Did Bitcoin trade above $70,000 in the past week? Market has resolved — outcome: NO.",
    category: "Crypto",
    symbol: "BTCUSD",
    emoji: "₿",
    currentPrice: 68200,
    targetPrice: 70000,
    direction: "above",
    resolutionDate: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    resolutionTime: "00:00 UTC",
    status: "resolved",
    resolvedOutcome: "no",
    yesPool: 71000,
    noPool: 29000,
    totalVolume: 100000,
    priceHistory: generatePriceHistory(68200),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ["crypto", "resolved"],
  },
  {
    id: "oil-brent-85",
    title: "Brent Crude above $85/barrel?",
    description: "Will Brent Crude Oil futures exceed $85 per barrel by end of this week? Geopolitical tensions in the Middle East could be the trigger.",
    category: "Energy",
    symbol: "BZMAIN",
    emoji: "⛽",
    currentPrice: 83.72,
    targetPrice: 85.00,
    direction: "above",
    resolutionDate: daysFromNow(3),
    resolutionTime: "14:30 EST",
    status: "active",
    yesPool: 44100,
    noPool: 35900,
    totalVolume: 80000,
    priceHistory: generatePriceHistory(83.72),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    tags: ["energy", "geopolitics", "opec"],
  },
  {
    id: "sugar-20",
    title: "Sugar futures stay below $20?",
    description: "Will #11 Raw Sugar futures remain below $20 per pound? India export policy and Brazil production forecasts are key.",
    category: "Agriculture",
    symbol: "SBMAIN",
    emoji: "🍬",
    currentPrice: 19.42,
    targetPrice: 20.00,
    direction: "below",
    resolutionDate: daysFromNow(2),
    resolutionTime: "12:00 EST",
    status: "active",
    yesPool: 31400,
    noPool: 18600,
    totalVolume: 50000,
    priceHistory: generatePriceHistory(19.42),
    createdAt: new Date(Date.now() - 32400000).toISOString(),
    tags: ["agriculture", "soft-commodities", "india"],
  },
  {
    id: "platinum-950",
    title: "Platinum above $950/oz?",
    description: "Will Platinum futures trade above $950 per troy ounce? Auto-catalyst demand recovery vs EV transition headwinds.",
    category: "Metals",
    symbol: "PLMAIN",
    emoji: "💎",
    currentPrice: 932,
    targetPrice: 950,
    direction: "above",
    resolutionDate: daysFromNow(2),
    resolutionTime: "16:00 EST",
    status: "active",
    yesPool: 16700,
    noPool: 23300,
    totalVolume: 40000,
    priceHistory: generatePriceHistory(932),
    createdAt: new Date(Date.now() - 57600000).toISOString(),
    tags: ["metals", "auto", "ev"],
  },
  {
    id: "nasdaq-18000",
    title: "Nasdaq 100 above 18,000?",
    description: "Will the Nasdaq 100 index close above 18,000 points today? Big Tech earnings and AI sector momentum in focus.",
    category: "Indices",
    symbol: "NDX",
    emoji: "💻",
    currentPrice: 17842,
    targetPrice: 18000,
    direction: "above",
    resolutionDate: daysFromNow(1),
    resolutionTime: "16:00 EST",
    status: "active",
    yesPool: 38900,
    noPool: 41100,
    totalVolume: 80000,
    priceHistory: generatePriceHistory(17842),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    tags: ["indices", "tech", "ai"],
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: "0x7f3a...9b2c", displayName: "GoldFinger", totalWon: 48200, totalBets: 47, winRate: 74.5, bestWin: 12400 },
  { rank: 2, address: "0x2e8b...4d1f", displayName: "CryptoSage", totalWon: 41800, totalBets: 62, winRate: 69.4, bestWin: 9800 },
  { rank: 3, address: "0x9c4d...7e3a", displayName: "OilBaron", totalWon: 35600, totalBets: 38, winRate: 71.1, bestWin: 8200 },
  { rank: 4, address: "0x1b7e...2f9c", displayName: "WheatKing", totalWon: 28400, totalBets: 55, winRate: 65.5, bestWin: 6100 },
  { rank: 5, address: "0x5a2f...8c4b", displayName: "MetalTrader", totalWon: 24100, totalBets: 41, winRate: 63.4, bestWin: 5400 },
  { rank: 6, address: "0x3d9a...1e7f", displayName: "SilverFox", totalWon: 19800, totalBets: 33, winRate: 60.6, bestWin: 4800 },
  { rank: 7, address: "0x8c1b...5a2d", displayName: "ETHMaxi", totalWon: 16200, totalBets: 28, winRate: 57.1, bestWin: 3900 },
  { rank: 8, address: "0x4f6c...9b1e", displayName: "CommoQueen", totalWon: 12700, totalBets: 44, winRate: 54.5, bestWin: 2800 },
  { rank: 9, address: "0x6b3e...2c8f", displayName: "FuturesBull", totalWon: 9400, totalBets: 19, winRate: 52.6, bestWin: 2200 },
  { rank: 10, address: "0x2a9d...7f4c", displayName: "GrainGuru", totalWon: 7100, totalBets: 22, winRate: 50.0, bestWin: 1600 },
];

export function getMarketById(id: string): Market | undefined {
  return MARKETS.find((m) => m.id === id);
}

export function formatCurrency(amount: number, decimals: number = 2): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(decimals)}`;
}

export function getOdds(yesPool: number, noPool: number): { yes: number; no: number } {
  const total = yesPool + noPool;
  if (total === 0) return { yes: 50, no: 50 };
  return {
    yes: Math.round((yesPool / total) * 100),
    no: Math.round((noPool / total) * 100),
  };
}

export function getPotentialPayout(amount: number, side: BetSide, yesPool: number, noPool: number): number {
  const odds = getOdds(yesPool, noPool);
  const winProb = side === "yes" ? odds.yes / 100 : odds.no / 100;
  if (winProb === 0) return 0;
  return amount / winProb;
}

export function timeUntilResolution(resolutionDate: string, resolutionTime: string): string {
  const target = new Date(`${resolutionDate} ${resolutionTime.replace(" EST", "").replace(" UTC", "")}`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return "Resolved";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}
