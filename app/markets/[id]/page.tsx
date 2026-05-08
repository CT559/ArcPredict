"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { getStoredMarkets, placeBet, getUserBetsForMarket, claimReward } from "@/lib/store";
import {
  Market, Bet, getOdds, formatCurrency, getPotentialPayout,
  timeUntilResolution, LEADERBOARD
} from "@/lib/data";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Clock, TrendingUp, TrendingDown, ArrowLeft, Wallet, Trophy,
  CheckCircle2, AlertCircle, Zap, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  Metals: "text-yellow-500",
  Energy: "text-orange-500",
  Agriculture: "text-green-500",
  Crypto: "text-blue-500",
  Indices: "text-purple-500",
};

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, balance, isConnected, connect } = useWallet();
  const { toast } = useToast();

  const [market, setMarket] = useState<Market | null>(null);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [betAmount, setBetAmount] = useState<string>("100");
  const [isPlacing, setIsPlacing] = useState(false);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [showBetHistory, setShowBetHistory] = useState(false);

  const loadMarket = useCallback(() => {
    const markets = getStoredMarkets();
    const found = markets.find((m) => m.id === params.id);
    if (!found) { router.push("/"); return; }
    setMarket(found);
    if (address) {
      setUserBets(getUserBetsForMarket(found.id, address));
    }
  }, [params.id, address, router]);

  useEffect(() => { loadMarket(); }, [loadMarket]);

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-arc-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const odds = getOdds(market.yesPool, market.noPool);
  const amount = parseFloat(betAmount) || 0;
  const potentialPayout = getPotentialPayout(amount, selectedSide, market.yesPool, market.noPool);
  const timeLeft = timeUntilResolution(market.resolutionDate, market.resolutionTime);
  const isResolved = market.status === "resolved";
  const chartData = market.priceHistory.map((p) => ({
    time: format(new Date(p.time), "HH:mm"),
    price: p.price,
  }));
  const priceMin = Math.min(...market.priceHistory.map((p) => p.price)) * 0.999;
  const priceMax = Math.max(...market.priceHistory.map((p) => p.price)) * 1.001;
  const currentChange = market.priceHistory.length > 1
    ? market.currentPrice - market.priceHistory[0].price
    : 0;
  const changePercent = ((currentChange / market.priceHistory[0]?.price) * 100) || 0;

  const handlePlaceBet = async () => {
    if (!isConnected) { connect(); return; }
    if (amount <= 0) {
      toast({ title: "Invalid amount", description: "Enter a valid bet amount.", variant: "destructive" });
      return;
    }
    if (amount > balance) {
      toast({ title: "Insufficient balance", description: `You have $${balance.toFixed(2)} USDC available.`, variant: "destructive" });
      return;
    }
    setIsPlacing(true);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      placeBet(market.id, selectedSide, amount, address!);
      toast({
        title: "Bet placed! 🎯",
        description: `$${amount} USDC on ${selectedSide.toUpperCase()} — potential payout: ${formatCurrency(potentialPayout)}`,
      });
      loadMarket();
      setBetAmount("100");
    } finally {
      setIsPlacing(false);
    }
  };

  const handleClaim = async (betId: string, payout: number) => {
    setIsClaiming(betId);
    await new Promise((r) => setTimeout(r, 1000));
    claimReward(betId, payout);
    toast({
      title: "Reward claimed! 🏆",
      description: `${formatCurrency(payout)} USDC sent to your wallet.`,
    });
    loadMarket();
    setIsClaiming(null);
  };

  const claimableBets = userBets.filter((b) => {
    if (!isResolved || b.claimed) return false;
    return b.side === market.resolvedOutcome;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        All Markets
      </Link>

      {/* Resolved Banner */}
      {isResolved && (
        <div className={cn(
          "mb-6 rounded-xl p-4 flex items-center gap-3 border",
          market.resolvedOutcome === "yes"
            ? "bg-arc-green/10 border-arc-green/30 text-arc-green"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Market Resolved — Outcome: {market.resolvedOutcome?.toUpperCase()}</div>
            <div className="text-sm opacity-80">
              {claimableBets.length > 0
                ? `You have ${claimableBets.length} winning bet(s) to claim!`
                : "Check your positions below."}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Chart + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{market.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-medium", CATEGORY_COLORS[market.category])}>
                      {market.category}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs font-mono text-muted-foreground">{market.symbol}</span>
                  </div>
                  <h1 className="font-display text-xl md:text-2xl font-bold">{market.title}</h1>
                </div>
              </div>
              {!isResolved && (
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Closes in</span>
                  </div>
                  <div className="font-mono font-bold text-arc-green text-lg">{timeLeft}</div>
                </div>
              )}
            </div>

            {/* Price Display */}
            <div className="flex items-end gap-4 mb-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                <div className="text-3xl font-mono font-bold">
                  {market.currentPrice > 1000
                    ? `$${market.currentPrice.toLocaleString()}`
                    : `$${market.currentPrice.toFixed(2)}`}
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 pb-1 font-mono text-sm",
                currentChange >= 0 ? "text-arc-green" : "text-red-400"
              )}>
                {currentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{currentChange >= 0 ? "+" : ""}{currentChange.toFixed(2)}</span>
                <span>({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)</span>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-muted-foreground mb-1">Target</div>
                <div className="font-mono font-semibold text-arc-amber">
                  {market.targetPrice > 1000
                    ? `$${market.targetPrice.toLocaleString()}`
                    : `$${market.targetPrice.toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4A0" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00D4A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                    axisLine={false}
                    interval={7}
                  />
                  <YAxis
                    domain={[priceMin, priceMax]}
                    tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v > 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(1)}`}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "JetBrains Mono",
                    }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#00D4A0"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#00D4A0" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display font-semibold text-sm">Market Details</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{market.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Resolution Date", value: market.resolutionDate },
                { label: "Resolution Time", value: market.resolutionTime },
                { label: "Total Volume", value: formatCurrency(market.totalVolume) },
                { label: "Status", value: market.status.charAt(0).toUpperCase() + market.status.slice(1) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className="text-sm font-mono font-medium">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {market.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pool Stats */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-display font-semibold text-sm mb-4">Market Pools</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-arc-green/10 border border-arc-green/20 p-4">
                <div className="text-xs text-arc-green mb-1 font-medium">YES Pool</div>
                <div className="text-xl font-mono font-bold">{formatCurrency(market.yesPool)}</div>
                <div className="text-xs text-muted-foreground mt-1">{odds.yes}% of total</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <div className="text-xs text-red-400 mb-1 font-medium">NO Pool</div>
                <div className="text-xl font-mono font-bold">{formatCurrency(market.noPool)}</div>
                <div className="text-xs text-muted-foreground mt-1">{odds.no}% of total</div>
              </div>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full gradient-arc transition-all duration-700"
                style={{ width: `${odds.yes}%` }}
              />
            </div>
          </div>

          {/* User Bets */}
          {userBets.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <button
                onClick={() => setShowBetHistory((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <h2 className="font-display font-semibold text-sm">Your Positions ({userBets.length})</h2>
                {showBetHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showBetHistory && (
                <div className="mt-4 space-y-2">
                  {userBets.map((bet) => {
                    const won = isResolved && bet.side === market.resolvedOutcome;
                    const lost = isResolved && bet.side !== market.resolvedOutcome;
                    const canClaim = won && !bet.claimed;
                    const payout = getPotentialPayout(bet.amount, bet.side, market.yesPool, market.noPool);
                    return (
                      <div key={bet.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg border text-sm",
                        won && !bet.claimed ? "border-arc-green/30 bg-arc-green/5" :
                          lost ? "border-red-500/20 bg-red-500/5 opacity-60" :
                            bet.claimed ? "border-border bg-secondary/50" : "border-border bg-secondary/30"
                      )}>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "font-mono text-xs px-2 py-0.5 rounded-full font-bold",
                            bet.side === "yes" ? "bg-arc-green/20 text-arc-green" : "bg-red-500/20 text-red-400"
                          )}>
                            {bet.side.toUpperCase()}
                          </span>
                          <div>
                            <div className="font-mono font-medium">${bet.amount} USDC</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(bet.timestamp), "MMM d, HH:mm")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canClaim && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-arc-green hover:bg-arc-green/90 text-white"
                              onClick={() => handleClaim(bet.id, payout)}
                              disabled={isClaiming === bet.id}
                            >
                              {isClaiming === bet.id ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>Claim {formatCurrency(payout)}</>
                              )}
                            </Button>
                          )}
                          {bet.claimed && (
                            <span className="text-xs text-arc-green flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Claimed
                            </span>
                          )}
                          {lost && <span className="text-xs text-red-400">Lost</span>}
                          {!isResolved && (
                            <span className="text-xs text-muted-foreground font-mono">
                              ≈{formatCurrency(payout)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Bet Panel */}
        <div className="space-y-4">
          {/* Bet Interface */}
          <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
            <h2 className="font-display font-bold text-lg mb-5">
              {isResolved ? "Market Closed" : "Place Your Bet"}
            </h2>

            {!isResolved ? (
              <>
                {/* Side Selection */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button
                    onClick={() => setSelectedSide("yes")}
                    className={cn(
                      "py-3 rounded-xl border-2 font-display font-bold text-sm transition-all",
                      selectedSide === "yes"
                        ? "border-arc-green bg-arc-green/10 text-arc-green glow-green"
                        : "border-border text-muted-foreground hover:border-arc-green/50"
                    )}
                  >
                    YES
                    <div className="text-xs font-mono font-normal mt-0.5">{odds.yes}%</div>
                  </button>
                  <button
                    onClick={() => setSelectedSide("no")}
                    className={cn(
                      "py-3 rounded-xl border-2 font-display font-bold text-sm transition-all",
                      selectedSide === "no"
                        ? "border-red-500 bg-red-500/10 text-red-400 glow-red"
                        : "border-border text-muted-foreground hover:border-red-500/50"
                    )}
                  >
                    NO
                    <div className="text-xs font-mono font-normal mt-0.5">{odds.no}%</div>
                  </button>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Amount (USDC)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">$</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg pl-7 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-arc-green/50 focus:border-arc-green transition-all"
                      placeholder="0.00"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 500, 1000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setBetAmount(String(v))}
                        className="flex-1 py-1 text-xs rounded-lg bg-secondary border border-border hover:border-arc-green/50 font-mono transition-colors"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout Preview */}
                <div className="bg-secondary rounded-lg p-3 mb-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bet Amount</span>
                    <span className="font-mono">${amount.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Win Probability</span>
                    <span className="font-mono">{selectedSide === "yes" ? odds.yes : odds.no}%</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Potential Payout</span>
                    <span className="font-mono text-arc-green">{formatCurrency(potentialPayout)}</span>
                  </div>
                </div>

                {/* Wallet Balance */}
                {isConnected && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Balance: <span className="text-foreground font-mono">${balance.toFixed(2)} USDC</span></span>
                  </div>
                )}

                {/* CTA */}
                <Button
                  className={cn(
                    "w-full h-12 font-display font-bold text-base transition-all",
                    isConnected
                      ? selectedSide === "yes"
                        ? "bg-arc-green hover:bg-arc-green/90 text-white glow-green"
                        : "bg-red-500 hover:bg-red-600 text-white glow-red"
                      : "bg-arc-blue hover:bg-arc-blue/90 text-white"
                  )}
                  onClick={handlePlaceBet}
                  disabled={isPlacing}
                >
                  {isPlacing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Bet...
                    </div>
                  ) : !isConnected ? (
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Bet {selectedSide.toUpperCase()} — ${amount.toFixed(0)} USDC
                    </div>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Settled in USDC via Circle App Kit
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  market.resolvedOutcome === "yes" ? "bg-arc-green/20" : "bg-red-500/20"
                )}>
                  {market.resolvedOutcome === "yes"
                    ? <CheckCircle2 className="w-8 h-8 text-arc-green" />
                    : <AlertCircle className="w-8 h-8 text-red-400" />}
                </div>
                <div className="font-display font-bold text-xl mb-2">
                  Outcome: {market.resolvedOutcome?.toUpperCase()}
                </div>
                <p className="text-sm text-muted-foreground">
                  This market has been resolved. Check your positions above to claim rewards.
                </p>
              </div>
            )}
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-arc-amber" />
              <h2 className="font-display font-semibold text-sm">Top Traders</h2>
            </div>
            <div className="space-y-2">
              {LEADERBOARD.slice(0, 5).map((entry) => (
                <div key={entry.rank} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]",
                    entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                      entry.rank === 2 ? "bg-zinc-400/20 text-zinc-400" :
                        entry.rank === 3 ? "bg-orange-600/20 text-orange-600" :
                          "bg-secondary text-muted-foreground"
                  )}>
                    {entry.rank}
                  </span>
                  <span className="flex-1 font-medium truncate">{entry.displayName}</span>
                  <span className="font-mono text-arc-green">{formatCurrency(entry.totalWon)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
