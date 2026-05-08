"use client";

import { LEADERBOARD, formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Zap, Medal } from "lucide-react";

export default function LeaderboardPage() {
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-arc-amber/20 border border-arc-amber/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-7 h-7 text-arc-amber" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Top traders by total USDC earned</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          const actualRank = entry.rank;
          const heights = ["h-28", "h-36", "h-24"];
          const podiumColors = [
            "bg-zinc-400/20 border-zinc-400/30",
            "bg-yellow-500/20 border-yellow-500/30",
            "bg-orange-600/20 border-orange-600/30",
          ];
          return (
            <div key={entry.rank} className="flex flex-col items-center">
              <div className="text-2xl mb-1">{actualRank === 1 ? "🥇" : actualRank === 2 ? "🥈" : "🥉"}</div>
              <div className="font-display font-bold text-sm text-center mb-1 truncate max-w-full px-1">{entry.displayName}</div>
              <div className="text-xs font-mono text-arc-green mb-2">{formatCurrency(entry.totalWon)}</div>
              <div className={cn(
                "w-full rounded-t-xl border-2 flex items-end justify-center pb-3",
                heights[i], podiumColors[i]
              )}>
                <span className={cn(
                  "text-3xl font-display font-black",
                  actualRank === 1 ? "text-yellow-500" : actualRank === 2 ? "text-zinc-400" : "text-orange-600"
                )}>
                  {actualRank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2 bg-secondary/50 text-xs text-muted-foreground font-medium border-b border-border">
          <span>#</span>
          <span className="col-span-2">Trader</span>
          <span className="text-right">Total Won</span>
          <span className="text-right">Win Rate</span>
        </div>
        {LEADERBOARD.map((entry, i) => (
          <div
            key={entry.rank}
            className={cn(
              "grid grid-cols-5 px-4 py-3.5 items-center border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors",
              i < 3 && "bg-arc-green/5"
            )}
          >
            <div>
              <span className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                  entry.rank === 2 ? "bg-zinc-400/20 text-zinc-400" :
                    entry.rank === 3 ? "bg-orange-600/20 text-orange-600" :
                      "bg-secondary text-muted-foreground"
              )}>
                {entry.rank}
              </span>
            </div>
            <div className="col-span-2">
              <div className="font-medium text-sm">{entry.displayName}</div>
              <div className="text-xs font-mono text-muted-foreground">{entry.address}</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold text-sm text-arc-green">{formatCurrency(entry.totalWon)}</div>
              <div className="text-xs text-muted-foreground">{entry.totalBets} bets</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">{entry.winRate}%</div>
              <div className="text-xs text-muted-foreground">best: {formatCurrency(entry.bestWin)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Place bets and win to climb the leaderboard!
      </div>
    </div>
  );
}
