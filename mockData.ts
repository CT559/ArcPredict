// lib/mockData.ts
// Rich mock data for ArcPredict - 18 prediction markets

export type Category = "Kim loại" | "Năng lượng" | "Lương thực" | "Crypto";

export type MarketStatus = "active" | "resolved" | "pending";

export interface Market {
  id: string;
  title: string;
  description: string;
  category: Category;
  icon: string; // emoji
  status: MarketStatus;
  probability: number; // 0-100, probability of YES
  volume: number; // USDC
  liquidity: number; // USDC
  totalBets: number;
  resolveDate: string; // ISO string
  createdAt: string;
  resolvedAt?: string;
  outcome?: "yes" | "no";
  yesPrice: number; // cents per share (0-100)
  noPrice: number;
  tags: string[];
  priceHistory: PricePoint[];
  stats: MarketStats;
}

export interface PricePoint {
  timestamp: number;
  yes: number;
  no: number;
  volume: number;
}

export interface MarketStats {
  uniqueTraders: number;
  avgBetSize: number;
  largestBet: number;
  lastTradeTime: string;
}

export interface Bet {
  id: string;
  marketId: string;
  marketTitle: string;
  position: "yes" | "no";
  amount: number; // USDC
  shares: number;
  priceAtBet: number;
  timestamp: string;
  walletAddress: string;
  status: "open" | "won" | "lost" | "claimed";
  potentialWinnings: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  totalProfit: number;
  winRate: number;
  totalBets: number;
  totalVolume: number;
  streak: number;
}

// Generate realistic price history for a market
function generatePriceHistory(
  baseProb: number,
  hoursBack: number = 48
): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();
  const interval = (hoursBack * 60 * 60 * 1000) / 60; // 60 data points
  let currentProb = baseProb + (Math.random() - 0.5) * 20;

  for (let i = 60; i >= 0; i--) {
    const drift = (Math.random() - 0.45) * 3;
    currentProb = Math.max(5, Math.min(95, currentProb + drift));
    const timestamp = now - i * interval;
    const vol = Math.floor(Math.random() * 5000) + 500;

    points.push({
      timestamp,
      yes: Math.round(currentProb),
      no: Math.round(100 - currentProb),
      volume: vol,
    });
  }

  // Smooth toward final probability
  const last = points[points.length - 1];
  last.yes = baseProb;
  last.no = 100 - baseProb;

  return points;
}

const now = new Date();
const addDays = (d: number) =>
  new Date(now.getTime() + d * 86400000).toISOString();
const subDays = (d: number) =>
  new Date(now.getTime() - d * 86400000).toISOString();

// ═══════════════════════════════════════════════════════════
// 18 ACTIVE MARKETS - HIGH QUALITY MOCK DATA
// ═══════════════════════════════════════════════════════════
export const MARKETS: Market[] = [
  // ── KIM LOẠI (Metals) ──────────────────────────────────
  {
    id: "gold-2700-jan",
    title: "Vàng (XAU) vượt $2,700/oz trong 3 ngày tới?",
    description:
      "Giá vàng spot sẽ chạm mức $2,700 USD/oz hoặc cao hơn ít nhất một lần trong vòng 72 giờ tới. Resolve dựa trên giá TradingView XAU/USD lúc 00:00 UTC.",
    category: "Kim loại",
    icon: "🥇",
    status: "active",
    probability: 68,
    volume: 245800,
    liquidity: 89200,
    totalBets: 1247,
    resolveDate: addDays(2),
    createdAt: subDays(1),
    yesPrice: 68,
    noPrice: 32,
    tags: ["XAU", "Gold", "Precious Metal"],
    priceHistory: generatePriceHistory(68, 48),
    stats: {
      uniqueTraders: 342,
      avgBetSize: 197,
      largestBet: 15000,
      lastTradeTime: new Date(Date.now() - 120000).toISOString(),
    },
  },
  {
    id: "silver-32-jan",
    title: "Bạc (XAG) giữ trên $32/oz cuối tuần này?",
    description:
      "Giá bạc spot sẽ đóng cửa trên $32 USD/oz vào cuối phiên giao dịch ngày thứ Sáu tuần này theo giá COMEX.",
    category: "Kim loại",
    icon: "🥈",
    status: "active",
    probability: 54,
    volume: 128400,
    liquidity: 45600,
    totalBets: 678,
    resolveDate: addDays(3),
    createdAt: subDays(2),
    yesPrice: 54,
    noPrice: 46,
    tags: ["XAG", "Silver", "Industrial Metal"],
    priceHistory: generatePriceHistory(54, 48),
    stats: {
      uniqueTraders: 198,
      avgBetSize: 189,
      largestBet: 8500,
      lastTradeTime: new Date(Date.now() - 300000).toISOString(),
    },
  },
  {
    id: "copper-430-jan",
    title: "Đồng (HG) tăng lên $4.30/lb trong 2 ngày?",
    description:
      "Hợp đồng tương lai đồng COMEX sẽ giao dịch ở mức $4.30/lb hoặc cao hơn trong vòng 48 giờ tới. Nhu cầu từ Trung Quốc và chuyển đổi năng lượng xanh là yếu tố chính.",
    category: "Kim loại",
    icon: "🟤",
    status: "active",
    probability: 41,
    volume: 89300,
    liquidity: 32100,
    totalBets: 445,
    resolveDate: addDays(2),
    createdAt: subDays(1),
    yesPrice: 41,
    noPrice: 59,
    tags: ["Copper", "HG", "Industrial"],
    priceHistory: generatePriceHistory(41, 48),
    stats: {
      uniqueTraders: 156,
      avgBetSize: 200,
      largestBet: 6000,
      lastTradeTime: new Date(Date.now() - 450000).toISOString(),
    },
  },
  {
    id: "platinum-980-jan",
    title: "Platinum vượt $980/oz trước ngày resolve?",
    description:
      "Giá platinum spot (XPT/USD) sẽ đạt $980 hoặc cao hơn. Nhu cầu từ ngành sản xuất xe điện và catalysts đang tạo áp lực tăng mạnh.",
    category: "Kim loại",
    icon: "⚪",
    status: "active",
    probability: 35,
    volume: 67200,
    liquidity: 24800,
    totalBets: 312,
    resolveDate: addDays(3),
    createdAt: subDays(3),
    yesPrice: 35,
    noPrice: 65,
    tags: ["XPT", "Platinum", "Automotive"],
    priceHistory: generatePriceHistory(35, 72),
    stats: {
      uniqueTraders: 124,
      avgBetSize: 215,
      largestBet: 12000,
      lastTradeTime: new Date(Date.now() - 900000).toISOString(),
    },
  },

  // ── NĂNG LƯỢNG (Energy) ────────────────────────────────
  {
    id: "wti-85-jan",
    title: "Dầu WTI vượt $85/thùng trong 48 giờ?",
    description:
      "Giá dầu thô WTI (NYMEX CL) sẽ chạm $85 USD/thùng hoặc cao hơn trong vòng 48 giờ tới. Căng thẳng địa chính trị tại Trung Đông và quyết định cắt giảm sản lượng OPEC+ là yếu tố chính.",
    category: "Năng lượng",
    icon: "🛢️",
    status: "active",
    probability: 72,
    volume: 389500,
    liquidity: 142300,
    totalBets: 1876,
    resolveDate: addDays(2),
    createdAt: subDays(1),
    yesPrice: 72,
    noPrice: 28,
    tags: ["WTI", "Crude Oil", "OPEC"],
    priceHistory: generatePriceHistory(72, 48),
    stats: {
      uniqueTraders: 567,
      avgBetSize: 207,
      largestBet: 25000,
      lastTradeTime: new Date(Date.now() - 60000).toISOString(),
    },
  },
  {
    id: "brent-88-jan",
    title: "Brent Crude đóng cửa trên $88 cuối ngày mai?",
    description:
      "Giá dầu Brent (ICE) sẽ đóng cửa trên $88 USD/thùng vào cuối phiên giao dịch ngày mai. Nguồn cung từ Biển Bắc và tồn kho EIA sẽ là yếu tố quyết định.",
    category: "Năng lượng",
    icon: "⛽",
    status: "active",
    probability: 61,
    volume: 267800,
    liquidity: 98400,
    totalBets: 1234,
    resolveDate: addDays(1),
    createdAt: subDays(2),
    yesPrice: 61,
    noPrice: 39,
    tags: ["Brent", "ICE", "North Sea"],
    priceHistory: generatePriceHistory(61, 36),
    stats: {
      uniqueTraders: 423,
      avgBetSize: 217,
      largestBet: 18000,
      lastTradeTime: new Date(Date.now() - 90000).toISOString(),
    },
  },
  {
    id: "natgas-3-jan",
    title: "Khí tự nhiên (NG) vượt $3.00/MMBtu?",
    description:
      "Giá khí tự nhiên NYMEX sẽ giao dịch trên $3.00/MMBtu trong vòng 72 giờ tới. Dự báo thời tiết lạnh tại Đông Bắc Mỹ và nhu cầu sưởi ấm mùa đông là yếu tố chính.",
    category: "Năng lượng",
    icon: "🔥",
    status: "active",
    probability: 48,
    volume: 156700,
    liquidity: 56200,
    totalBets: 789,
    resolveDate: addDays(3),
    createdAt: subDays(1),
    yesPrice: 48,
    noPrice: 52,
    tags: ["Natural Gas", "NG", "Heating"],
    priceHistory: generatePriceHistory(48, 48),
    stats: {
      uniqueTraders: 287,
      avgBetSize: 198,
      largestBet: 9500,
      lastTradeTime: new Date(Date.now() - 180000).toISOString(),
    },
  },
  {
    id: "gasoline-rbob-jan",
    title: "RBOB Gasoline tăng lên $2.50/gallon?",
    description:
      "Hợp đồng xăng RBOB NYMEX sẽ đạt $2.50/gallon trong phiên giao dịch tiếp theo. Nhu cầu mùa hè và tồn kho thấp là yếu tố hỗ trợ.",
    category: "Năng lượng",
    icon: "⚡",
    status: "active",
    probability: 57,
    volume: 98400,
    liquidity: 36700,
    totalBets: 523,
    resolveDate: addDays(2),
    createdAt: subDays(2),
    yesPrice: 57,
    noPrice: 43,
    tags: ["RBOB", "Gasoline", "Refinery"],
    priceHistory: generatePriceHistory(57, 48),
    stats: {
      uniqueTraders: 189,
      avgBetSize: 188,
      largestBet: 7200,
      lastTradeTime: new Date(Date.now() - 360000).toISOString(),
    },
  },

  // ── LƯƠNG THỰC (Agricultural) ──────────────────────────
  {
    id: "wheat-600-jan",
    title: "Lúa mì CBOT vượt $600/bushel trong 3 ngày?",
    description:
      "Hợp đồng lúa mì CBOT sẽ giao dịch trên 600 cents/bushel ($6.00/bu) trong vòng 72 giờ tới. Tình trạng hạn hán tại vùng Plains và căng thẳng Biển Đen là yếu tố quan trọng.",
    category: "Lương thực",
    icon: "🌾",
    status: "active",
    probability: 43,
    volume: 134500,
    liquidity: 49800,
    totalBets: 678,
    resolveDate: addDays(3),
    createdAt: subDays(2),
    yesPrice: 43,
    noPrice: 57,
    tags: ["Wheat", "CBOT", "Grains"],
    priceHistory: generatePriceHistory(43, 72),
    stats: {
      uniqueTraders: 234,
      avgBetSize: 198,
      largestBet: 8900,
      lastTradeTime: new Date(Date.now() - 420000).toISOString(),
    },
  },
  {
    id: "corn-480-jan",
    title: "Ngô (ZC) giữ trên $4.80/bushel cuối tuần?",
    description:
      "Hợp đồng ngô CBOT đóng cửa trên $4.80/bushel vào cuối tuần này. Báo cáo USDA Crop Progress và điều kiện thời tiết tại Corn Belt là yếu tố quyết định.",
    category: "Lương thực",
    icon: "🌽",
    status: "active",
    probability: 66,
    volume: 178900,
    liquidity: 65400,
    totalBets: 934,
    resolveDate: addDays(3),
    createdAt: subDays(1),
    yesPrice: 66,
    noPrice: 34,
    tags: ["Corn", "ZC", "USDA"],
    priceHistory: generatePriceHistory(66, 48),
    stats: {
      uniqueTraders: 312,
      avgBetSize: 191,
      largestBet: 11000,
      lastTradeTime: new Date(Date.now() - 150000).toISOString(),
    },
  },
  {
    id: "soybean-1200-jan",
    title: "Đậu tương vượt $12.00/bushel trong 48h?",
    description:
      "Hợp đồng đậu tương CBOT (ZS) sẽ đạt 1200 cents/bushel hoặc cao hơn. Nhu cầu xuất khẩu từ Trung Quốc và nguồn cung Nam Mỹ đang ảnh hưởng mạnh đến giá.",
    category: "Lương thực",
    icon: "🫘",
    status: "active",
    probability: 52,
    volume: 112300,
    liquidity: 41200,
    totalBets: 587,
    resolveDate: addDays(2),
    createdAt: subDays(3),
    yesPrice: 52,
    noPrice: 48,
    tags: ["Soybean", "ZS", "China Demand"],
    priceHistory: generatePriceHistory(52, 72),
    stats: {
      uniqueTraders: 198,
      avgBetSize: 191,
      largestBet: 9800,
      lastTradeTime: new Date(Date.now() - 240000).toISOString(),
    },
  },
  {
    id: "sugar-22-jan",
    title: "Đường thô (SB) vượt 22 cents/lb?",
    description:
      "Hợp đồng đường thô ICE (SB) sẽ giao dịch trên 22 cents/pound trong phiên tới. Ảnh hưởng của El Niño đến mùa vụ mía Brazil và Ấn Độ là yếu tố then chốt.",
    category: "Lương thực",
    icon: "🍬",
    status: "active",
    probability: 38,
    volume: 78600,
    liquidity: 28900,
    totalBets: 412,
    resolveDate: addDays(1),
    createdAt: subDays(2),
    yesPrice: 38,
    noPrice: 62,
    tags: ["Sugar", "SB", "Brazil"],
    priceHistory: generatePriceHistory(38, 36),
    stats: {
      uniqueTraders: 167,
      avgBetSize: 190,
      largestBet: 6500,
      lastTradeTime: new Date(Date.now() - 600000).toISOString(),
    },
  },
  {
    id: "coffee-220-jan",
    title: "Cà phê Arabica vượt $220/lb tuần này?",
    description:
      "Hợp đồng cà phê Arabica ICE (KC) sẽ vượt 220 cents/lb trong tuần này. Thời tiết khắc nghiệt tại Brazil và Colombia đang đe dọa nguồn cung.",
    category: "Lương thực",
    icon: "☕",
    status: "active",
    probability: 74,
    volume: 156800,
    liquidity: 57200,
    totalBets: 823,
    resolveDate: addDays(2),
    createdAt: subDays(1),
    yesPrice: 74,
    noPrice: 26,
    tags: ["Coffee", "KC", "Arabica", "Brazil"],
    priceHistory: generatePriceHistory(74, 48),
    stats: {
      uniqueTraders: 278,
      avgBetSize: 190,
      largestBet: 13500,
      lastTradeTime: new Date(Date.now() - 75000).toISOString(),
    },
  },

  // ── CRYPTO ─────────────────────────────────────────────
  {
    id: "btc-100k-jan",
    title: "Bitcoin vượt $100,000 trong 3 ngày tới?",
    description:
      "Giá Bitcoin (BTC/USD) sẽ chạm mốc $100,000 hoặc cao hơn trong vòng 72 giờ. ETF Bitcoin Spot đang thu hút dòng tiền lớn và halving sắp diễn ra là yếu tố chính.",
    category: "Crypto",
    icon: "₿",
    status: "active",
    probability: 62,
    volume: 567800,
    liquidity: 212400,
    totalBets: 3456,
    resolveDate: addDays(3),
    createdAt: subDays(1),
    yesPrice: 62,
    noPrice: 38,
    tags: ["BTC", "Bitcoin", "ETF", "Halving"],
    priceHistory: generatePriceHistory(62, 72),
    stats: {
      uniqueTraders: 1234,
      avgBetSize: 164,
      largestBet: 50000,
      lastTradeTime: new Date(Date.now() - 30000).toISOString(),
    },
  },
  {
    id: "eth-4000-jan",
    title: "Ethereum chạm $4,000 trước khi resolve?",
    description:
      "Giá ETH/USD sẽ đạt $4,000 trong vòng 48 giờ. Nhu cầu staking, EIP upgrade sắp tới và dòng tiền ETF Ethereum là yếu tố hỗ trợ mạnh.",
    category: "Crypto",
    icon: "Ξ",
    status: "active",
    probability: 55,
    volume: 345600,
    liquidity: 128900,
    totalBets: 2134,
    resolveDate: addDays(2),
    createdAt: subDays(2),
    yesPrice: 55,
    noPrice: 45,
    tags: ["ETH", "Ethereum", "Staking", "DeFi"],
    priceHistory: generatePriceHistory(55, 48),
    stats: {
      uniqueTraders: 789,
      avgBetSize: 162,
      largestBet: 35000,
      lastTradeTime: new Date(Date.now() - 45000).toISOString(),
    },
  },
  {
    id: "sol-200-jan",
    title: "Solana (SOL) giữ trên $200 trong 48h?",
    description:
      "Giá SOL/USD sẽ duy trì trên $200 trong suốt 48 giờ tới. Hệ sinh thái DeFi và NFT trên Solana đang phát triển mạnh, cùng với tin tức về ETF SOL.",
    category: "Crypto",
    icon: "◎",
    status: "active",
    probability: 71,
    volume: 234500,
    liquidity: 87600,
    totalBets: 1567,
    resolveDate: addDays(2),
    createdAt: subDays(1),
    yesPrice: 71,
    noPrice: 29,
    tags: ["SOL", "Solana", "DeFi", "ETF"],
    priceHistory: generatePriceHistory(71, 48),
    stats: {
      uniqueTraders: 567,
      avgBetSize: 149,
      largestBet: 22000,
      lastTradeTime: new Date(Date.now() - 90000).toISOString(),
    },
  },
  {
    id: "bnb-700-jan",
    title: "BNB vượt $700 trong phiên tiếp theo?",
    description:
      "Binance Coin (BNB) sẽ giao dịch trên $700 trong phiên giao dịch tiếp theo. Quyết định của SEC về Binance và hoạt động của BNB Chain DeFi là yếu tố quyết định.",
    category: "Crypto",
    icon: "🔶",
    status: "active",
    probability: 44,
    volume: 145600,
    liquidity: 54300,
    totalBets: 876,
    resolveDate: addDays(1),
    createdAt: subDays(2),
    yesPrice: 44,
    noPrice: 56,
    tags: ["BNB", "Binance", "BSC"],
    priceHistory: generatePriceHistory(44, 36),
    stats: {
      uniqueTraders: 345,
      avgBetSize: 166,
      largestBet: 18000,
      lastTradeTime: new Date(Date.now() - 120000).toISOString(),
    },
  },
  {
    id: "xrp-1-jan",
    title: "XRP duy trì trên $1.00 sau phán quyết SEC?",
    description:
      "Giá XRP/USD sẽ đóng cửa trên $1.00 sau quyết định tiếp theo trong vụ kiện Ripple vs SEC. Kết quả tích cực có thể đẩy giá lên mạnh.",
    category: "Crypto",
    icon: "✕",
    status: "active",
    probability: 83,
    volume: 198700,
    liquidity: 73400,
    totalBets: 1234,
    resolveDate: addDays(3),
    createdAt: subDays(1),
    yesPrice: 83,
    noPrice: 17,
    tags: ["XRP", "Ripple", "SEC", "Lawsuit"],
    priceHistory: generatePriceHistory(83, 72),
    stats: {
      uniqueTraders: 456,
      avgBetSize: 161,
      largestBet: 28000,
      lastTradeTime: new Date(Date.now() - 60000).toISOString(),
    },
  },
];

// ═══════════════════════════════════════════════════════════
// RESOLVED MARKETS (for Admin Dashboard)
// ═══════════════════════════════════════════════════════════
export const RESOLVED_MARKETS: Market[] = [
  {
    id: "gold-2650-resolved",
    title: "Vàng vượt $2,650/oz vào ngày 5/1?",
    description: "Resolved market - Gold exceeded $2,650 on Jan 5.",
    category: "Kim loại",
    icon: "🥇",
    status: "resolved",
    probability: 100,
    volume: 189400,
    liquidity: 0,
    totalBets: 934,
    resolveDate: subDays(2),
    createdAt: subDays(5),
    resolvedAt: subDays(2),
    outcome: "yes",
    yesPrice: 100,
    noPrice: 0,
    tags: ["XAU"],
    priceHistory: generatePriceHistory(78, 72),
    stats: {
      uniqueTraders: 289,
      avgBetSize: 202,
      largestBet: 12000,
      lastTradeTime: subDays(2),
    },
  },
  {
    id: "oil-80-resolved",
    title: "Dầu WTI xuống dưới $80/thùng?",
    description: "Resolved market - WTI fell below $80.",
    category: "Năng lượng",
    icon: "🛢️",
    status: "resolved",
    probability: 0,
    volume: 234600,
    liquidity: 0,
    totalBets: 1123,
    resolveDate: subDays(1),
    createdAt: subDays(4),
    resolvedAt: subDays(1),
    outcome: "no",
    yesPrice: 0,
    noPrice: 100,
    tags: ["WTI"],
    priceHistory: generatePriceHistory(35, 72),
    stats: {
      uniqueTraders: 367,
      avgBetSize: 208,
      largestBet: 19000,
      lastTradeTime: subDays(1),
    },
  },
  {
    id: "btc-95k-resolved",
    title: "Bitcoin vượt $95,000 trong ngày 3/1?",
    description: "Resolved market - BTC exceeded $95K.",
    category: "Crypto",
    icon: "₿",
    status: "resolved",
    probability: 100,
    volume: 456700,
    liquidity: 0,
    totalBets: 2789,
    resolveDate: subDays(3),
    createdAt: subDays(6),
    resolvedAt: subDays(3),
    outcome: "yes",
    yesPrice: 100,
    noPrice: 0,
    tags: ["BTC", "Bitcoin"],
    priceHistory: generatePriceHistory(65, 72),
    stats: {
      uniqueTraders: 987,
      avgBetSize: 163,
      largestBet: 45000,
      lastTradeTime: subDays(3),
    },
  },
];

// ═══════════════════════════════════════════════════════════
// LEADERBOARD DATA
// ═══════════════════════════════════════════════════════════
export const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    displayName: "GoldHunter.arc",
    totalProfit: 84500,
    winRate: 73.2,
    totalBets: 234,
    totalVolume: 456700,
    streak: 8,
  },
  {
    rank: 2,
    address: "0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C",
    displayName: "OilOracle.arc",
    totalProfit: 67200,
    winRate: 68.9,
    totalBets: 189,
    totalVolume: 378900,
    streak: 5,
  },
  {
    rank: 3,
    address: "0x3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D",
    displayName: "CryptoWhale.arc",
    totalProfit: 52800,
    winRate: 71.4,
    totalBets: 156,
    totalVolume: 312400,
    streak: 12,
  },
  {
    rank: 4,
    address: "0x4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E",
    displayName: "ArcTrader99",
    totalProfit: 41600,
    winRate: 65.3,
    totalBets: 312,
    totalVolume: 289700,
    streak: 3,
  },
  {
    rank: 5,
    address: "0x5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F",
    displayName: "SilverFox.arc",
    totalProfit: 38900,
    winRate: 62.8,
    totalBets: 278,
    totalVolume: 245600,
    streak: 0,
  },
  {
    rank: 6,
    address: "0x6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A",
    displayName: "GrainKing.arc",
    totalProfit: 29400,
    winRate: 59.7,
    totalBets: 198,
    totalVolume: 198400,
    streak: 7,
  },
  {
    rank: 7,
    address: "0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B",
    displayName: "EnergyBull.arc",
    totalProfit: 24800,
    winRate: 58.2,
    totalBets: 234,
    totalVolume: 178900,
    streak: 2,
  },
  {
    rank: 8,
    address: "0x8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C",
    displayName: "ArcNomad_X",
    totalProfit: 19600,
    winRate: 55.9,
    totalBets: 167,
    totalVolume: 156700,
    streak: 4,
  },
  {
    rank: 9,
    address: "0x9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D",
    displayName: "MetalDetector",
    totalProfit: 15200,
    winRate: 54.1,
    totalBets: 145,
    totalVolume: 134500,
    streak: 1,
  },
  {
    rank: 10,
    address: "0xA0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9",
    displayName: "NewArcPlayer",
    totalProfit: 8900,
    winRate: 51.3,
    totalBets: 89,
    totalVolume: 89400,
    streak: 0,
  },
];

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function formatUSDC(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function getTimeLeft(resolveDate: string): string {
  const diff = new Date(resolveDate).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function getCategoryColor(category: Category): string {
  switch (category) {
    case "Kim loại":
      return "gold";
    case "Năng lượng":
      return "orange";
    case "Lương thực":
      return "green";
    case "Crypto":
      return "cyan";
  }
}

export function getProbabilityLabel(prob: number): {
  label: string;
  color: string;
} {
  if (prob >= 70) return { label: "Rất có thể", color: "text-emerald-400" };
  if (prob >= 55) return { label: "Có thể", color: "text-teal-400" };
  if (prob >= 45) return { label: "Không chắc", color: "text-yellow-400" };
  if (prob >= 30) return { label: "Ít có thể", color: "text-orange-400" };
  return { label: "Khó xảy ra", color: "text-red-400" };
}

export const ALL_MARKETS = [...MARKETS, ...RESOLVED_MARKETS];

export const TICKER_ITEMS = [
  { label: "XAU/USD", value: "$2,681.40", change: "+1.2%" },
  { label: "WTI OIL", value: "$83.45", change: "+0.8%" },
  { label: "BTC/USD", value: "$97,234", change: "+2.1%" },
  { label: "ETH/USD", value: "$3,876", change: "+1.5%" },
  { label: "XAG/USD", value: "$31.82", change: "-0.3%" },
  { label: "CORN CBOT", value: "$4.91/bu", change: "+0.5%" },
  { label: "SOL/USD", value: "$203.45", change: "+3.2%" },
  { label: "NAT GAS", value: "$2.94/MMBtu", change: "-1.1%" },
  { label: "COFFEE KC", value: "$218.50¢", change: "+2.8%" },
  { label: "XRP/USD", value: "$1.12", change: "+4.5%" },
];
