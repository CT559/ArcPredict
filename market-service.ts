/**
 * market-service.ts — ArcPredict
 * 
 * Mock market engine with 18+ markets.
 * Replace the mock fetch functions with real on-chain / API calls for production.
 */

export interface Market {
  id: string;
  title: string;
  description?: string;
  category: string;
  yesPrice: number;   // 0–1 (e.g. 0.67 = 67¢)
  noPrice: number;    // 1 - yesPrice
  priceChange24h: number; // e.g. 0.05 = +5%
  volume24h: number;      // in USDC
  liquidity?: number;
  traderCount?: number;
  priceHistory: number[]; // array of yesPrice snapshots
  endDate?: string;       // ISO date string
  createdAt?: string;
  resolutionRules?: string;
  tags?: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function makeHistory(start: number, len = 24, volatility = 0.04): number[] {
  let p = Math.min(0.95, Math.max(0.05, start));
  return Array.from({ length: len }, () => {
    p = Math.min(0.95, Math.max(0.05, p + (Math.random() - 0.5) * volatility));
    return parseFloat(p.toFixed(3));
  });
}

const MOCK_MARKETS: Market[] = [
  {
    id: "btc-100k-2025",
    title: "Will Bitcoin reach $100,000 before end of 2025?",
    description: "Resolves YES if BTC/USD closes above $100,000 on any major exchange before December 31, 2025.",
    category: "crypto",
    yesPrice: 0.72,
    noPrice: 0.28,
    priceChange24h: 0.034,
    volume24h: 284_500,
    liquidity: 920_000,
    traderCount: 3412,
    priceHistory: makeHistory(0.72),
    endDate: "2025-12-31",
    createdAt: "2024-11-01",
    resolutionRules: "Resolves YES if BTC/USD closing price exceeds $100,000 on Coinbase, Binance, or Kraken on any calendar day before December 31, 2025 UTC. Uses CoinGecko daily close.",
    tags: ["bitcoin", "crypto", "2025"],
  },
  {
    id: "eth-merge-staking",
    title: "Will Ethereum staking withdrawals exceed 5M ETH by Q2 2025?",
    category: "crypto",
    yesPrice: 0.58,
    noPrice: 0.42,
    priceChange24h: -0.021,
    volume24h: 134_200,
    liquidity: 410_000,
    traderCount: 1870,
    priceHistory: makeHistory(0.58),
    endDate: "2025-06-30",
    createdAt: "2025-01-15",
    resolutionRules: "Resolves YES if total ETH staking withdrawals (partial + full) exceed 5,000,000 ETH before June 30, 2025 per Beaconcha.in data.",
  },
  {
    id: "fed-rate-cut-q1",
    title: "Will the Federal Reserve cut rates in Q1 2025?",
    category: "economy",
    yesPrice: 0.44,
    noPrice: 0.56,
    priceChange24h: 0.018,
    volume24h: 521_000,
    liquidity: 1_450_000,
    traderCount: 5234,
    priceHistory: makeHistory(0.44, 24, 0.05),
    endDate: "2025-03-31",
    createdAt: "2025-01-03",
    resolutionRules: "Resolves YES if the FOMC votes to reduce the federal funds rate target at the January or March 2025 meeting.",
  },
  {
    id: "trump-100-days",
    title: "Will Trump's approval rating exceed 50% within his first 100 days?",
    category: "politics",
    yesPrice: 0.31,
    noPrice: 0.69,
    priceChange24h: -0.045,
    volume24h: 389_000,
    liquidity: 1_100_000,
    traderCount: 6701,
    priceHistory: makeHistory(0.31, 24, 0.06),
    endDate: "2025-04-30",
    createdAt: "2025-01-20",
    resolutionRules: "Resolves YES if any major polling aggregator (FiveThirtyEight, RealClearPolitics) shows a 50%+ approval rating for President Trump within 100 days of inauguration.",
  },
  {
    id: "nfl-super-bowl-2025",
    title: "Will the Kansas City Chiefs win Super Bowl LX?",
    category: "sports",
    yesPrice: 0.19,
    noPrice: 0.81,
    priceChange24h: 0.012,
    volume24h: 212_000,
    liquidity: 680_000,
    traderCount: 2890,
    priceHistory: makeHistory(0.19, 24, 0.03),
    endDate: "2026-02-08",
    createdAt: "2025-09-01",
    resolutionRules: "Resolves YES if the Kansas City Chiefs are announced as the Super Bowl LX champion.",
  },
  {
    id: "openai-gpt5",
    title: "Will OpenAI release GPT-5 before July 2025?",
    category: "tech",
    yesPrice: 0.63,
    noPrice: 0.37,
    priceChange24h: 0.055,
    volume24h: 445_000,
    liquidity: 1_230_000,
    traderCount: 7812,
    priceHistory: makeHistory(0.63, 24, 0.07),
    endDate: "2025-07-01",
    createdAt: "2025-01-10",
    resolutionRules: "Resolves YES if OpenAI publicly releases a model officially designated as GPT-5 (via blog post or API) before July 1, 2025.",
  },
  {
    id: "apple-vision-sales",
    title: "Will Apple Vision Pro sell 1M units by end of 2025?",
    category: "tech",
    yesPrice: 0.27,
    noPrice: 0.73,
    priceChange24h: -0.015,
    volume24h: 98_000,
    liquidity: 320_000,
    traderCount: 1230,
    priceHistory: makeHistory(0.27),
    endDate: "2025-12-31",
    createdAt: "2025-02-01",
    resolutionRules: "Resolves YES if Apple reports or credible analyst estimates confirm Apple Vision Pro cumulative sales exceeding 1,000,000 units by December 31, 2025.",
  },
  {
    id: "sol-price-200",
    title: "Will Solana (SOL) exceed $200 before April 2025?",
    category: "crypto",
    yesPrice: 0.51,
    noPrice: 0.49,
    priceChange24h: 0.028,
    volume24h: 178_000,
    liquidity: 560_000,
    traderCount: 2145,
    priceHistory: makeHistory(0.51, 24, 0.06),
    endDate: "2025-04-01",
    createdAt: "2025-01-18",
    resolutionRules: "Resolves YES if SOL/USD trades above $200.00 on any major exchange (CoinGecko) before April 1, 2025.",
  },
  {
    id: "eu-recession-2025",
    title: "Will the EU enter a technical recession in 2025?",
    category: "economy",
    yesPrice: 0.38,
    noPrice: 0.62,
    priceChange24h: 0.009,
    volume24h: 67_000,
    liquidity: 210_000,
    traderCount: 891,
    priceHistory: makeHistory(0.38),
    endDate: "2026-01-31",
    createdAt: "2025-01-05",
    resolutionRules: "Resolves YES if Eurostat officially reports two consecutive quarters of negative GDP growth in 2025.",
  },
  {
    id: "nvidia-1t-revenue",
    title: "Will Nvidia achieve $1T in annual revenue before 2027?",
    category: "finance",
    yesPrice: 0.47,
    noPrice: 0.53,
    priceChange24h: 0.022,
    volume24h: 301_000,
    liquidity: 890_000,
    traderCount: 4210,
    priceHistory: makeHistory(0.47, 24, 0.04),
    endDate: "2026-12-31",
    createdAt: "2025-01-20",
    resolutionRules: "Resolves YES if Nvidia's GAAP annual revenue exceeds $1,000,000,000,000 USD in any fiscal year ending before January 1, 2027.",
  },
  {
    id: "doge-price-1",
    title: "Will Dogecoin reach $1 in 2025?",
    category: "crypto",
    yesPrice: 0.22,
    noPrice: 0.78,
    priceChange24h: 0.041,
    volume24h: 155_000,
    liquidity: 490_000,
    traderCount: 3780,
    priceHistory: makeHistory(0.22, 24, 0.06),
    endDate: "2025-12-31",
    createdAt: "2025-01-01",
    resolutionRules: "Resolves YES if DOGE/USD price closes above $1.00 on CoinGecko on any day in 2025.",
  },
  {
    id: "tesla-robotaxi",
    title: "Will Tesla launch a commercial robotaxi service before 2026?",
    category: "tech",
    yesPrice: 0.34,
    noPrice: 0.66,
    priceChange24h: -0.033,
    volume24h: 203_000,
    liquidity: 640_000,
    traderCount: 2950,
    priceHistory: makeHistory(0.34, 24, 0.05),
    endDate: "2025-12-31",
    createdAt: "2025-01-12",
    resolutionRules: "Resolves YES if Tesla announces and launches a commercial (paid) robotaxi service available to the public in at least one US city before December 31, 2025.",
  },
  {
    id: "s-and-p-6500",
    title: "Will the S&P 500 close above 6,500 in Q1 2025?",
    category: "finance",
    yesPrice: 0.69,
    noPrice: 0.31,
    priceChange24h: 0.019,
    volume24h: 412_000,
    liquidity: 1_340_000,
    traderCount: 6120,
    priceHistory: makeHistory(0.69, 24, 0.04),
    endDate: "2025-03-31",
    createdAt: "2025-01-02",
    resolutionRules: "Resolves YES if the S&P 500 index closes above 6,500 on any trading day before March 31, 2025.",
  },
  {
    id: "ukraine-ceasefire",
    title: "Will there be a ceasefire agreement in Ukraine before July 2025?",
    category: "politics",
    yesPrice: 0.28,
    noPrice: 0.72,
    priceChange24h: 0.014,
    volume24h: 287_000,
    liquidity: 880_000,
    traderCount: 5432,
    priceHistory: makeHistory(0.28, 24, 0.05),
    endDate: "2025-07-01",
    createdAt: "2025-01-01",
    resolutionRules: "Resolves YES if a formal ceasefire agreement between Ukraine and Russia is publicly announced and takes effect before July 1, 2025.",
  },
  {
    id: "lebron-retire",
    title: "Will LeBron James retire before the 2025-26 NBA season?",
    category: "sports",
    yesPrice: 0.12,
    noPrice: 0.88,
    priceChange24h: -0.008,
    volume24h: 89_000,
    liquidity: 280_000,
    traderCount: 1560,
    priceHistory: makeHistory(0.12, 24, 0.02),
    endDate: "2025-10-01",
    createdAt: "2025-02-10",
    resolutionRules: "Resolves YES if LeBron James officially announces his retirement from the NBA before October 1, 2025.",
  },
  {
    id: "arc-mainnet",
    title: "Will Arc Chain launch mainnet before Q3 2025?",
    category: "crypto",
    yesPrice: 0.55,
    noPrice: 0.45,
    priceChange24h: 0.038,
    volume24h: 198_000,
    liquidity: 620_000,
    traderCount: 2310,
    priceHistory: makeHistory(0.55, 24, 0.06),
    endDate: "2025-09-30",
    createdAt: "2025-01-25",
    resolutionRules: "Resolves YES if Arc Chain officially launches its mainnet (publicly accessible, non-test) before September 30, 2025.",
  },
  {
    id: "inflation-us-2",
    title: "Will US CPI inflation fall below 2% in 2025?",
    category: "economy",
    yesPrice: 0.41,
    noPrice: 0.59,
    priceChange24h: 0.007,
    volume24h: 143_000,
    liquidity: 450_000,
    traderCount: 1980,
    priceHistory: makeHistory(0.41),
    endDate: "2025-12-31",
    createdAt: "2025-01-08",
    resolutionRules: "Resolves YES if the US Bureau of Labor Statistics reports a CPI year-over-year figure below 2.0% at any point in 2025.",
  },
  {
    id: "x-rebrand",
    title: "Will X (formerly Twitter) rebrand back to Twitter by end of 2025?",
    category: "tech",
    yesPrice: 0.08,
    noPrice: 0.92,
    priceChange24h: 0.003,
    volume24h: 54_000,
    liquidity: 170_000,
    traderCount: 720,
    priceHistory: makeHistory(0.08, 24, 0.02),
    endDate: "2025-12-31",
    createdAt: "2025-01-15",
    resolutionRules: "Resolves YES if Elon Musk or X Corp officially announces and implements a rebrand back to the Twitter name before December 31, 2025.",
  },
];

// ─── Service functions ─────────────────────────────────────────────────────────

export async function getAllMarkets(): Promise<Market[]> {
  // Simulate async fetch (replace with API/contract call)
  return MOCK_MARKETS;
}

export async function getMarketById(id: string): Promise<Market | null> {
  const market = MOCK_MARKETS.find((m) => m.id === id);
  return market ?? null;
}

export async function getMarketsByCategory(category: string): Promise<Market[]> {
  return MOCK_MARKETS.filter(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getTrendingMarkets(limit = 6): Promise<Market[]> {
  return [...MOCK_MARKETS]
    .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
    .slice(0, limit);
}
