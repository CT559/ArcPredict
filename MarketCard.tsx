"use client";

import { formatUnits } from "viem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import {
  useMarket,
  useUserPosition,
  usePotentialWinnings,
  useHasClaimed,
} from "@/hooks/useBetting";
import { Outcome } from "@/lib/chain/config";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  marketId: number;
}

function timeUntil(ts: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(ts) - now;
  if (diff <= 0) return "Resolved";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600) / 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function MarketCard({ marketId }: MarketCardProps) {
  const { openBetModal, openClaimModal } = useBettingStore();

  const { market, yesProb, noProb, totalPool, isLoading } = useMarket(
    BigInt(marketId)
  );
  const { position } = useUserPosition(BigInt(marketId));
  const { formatted: potentialWinnings } = usePotentialWinnings(
    BigInt(marketId)
  );
  const hasClaimed = useHasClaimed(BigInt(marketId));

  if (isLoading || !market) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 animate-pulse h-44" />
    );
  }

  const hasPosition =
    position &&
    (position.yesShares > 0n || position.noShares > 0n);

  const isResolved = market.resolved;
  const isExpired = Number(market.resolutionTime) < Date.now() / 1000;

  const canClaim =
    isResolved &&
    hasPosition &&
    !hasClaimed &&
    Number(potentialWinnings) > 0;

  const winnerOutcome =
    isResolved && market.winningOutcome === Outcome.YES
      ? "YES"
      : isResolved
      ? "NO"
      : null;

  return (
    <div
      className={cn(
        "group rounded-2xl border bg-gradient-to-b from-white/4 to-transparent p-5 space-y-4 transition-all duration-200",
        isResolved
          ? "border-white/8 opacity-75"
          : "border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-white/90 leading-snug flex-1">
          {market.question}
        </p>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {isResolved ? (
            <Badge className="bg-white/10 text-white/60 text-[10px] border-0">
              Resolved · {winnerOutcome}
            </Badge>
          ) : (
            <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-[10px]">
              <Clock size={9} className="mr-1" />
              {timeUntil(market.resolutionTime)}
            </Badge>
          )}
        </div>
      </div>

      {/* Probability Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-emerald-400">YES {yesProb.toFixed(1)}%</span>
          <span className="text-rose-400">NO {noProb.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${yesProb}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Users size={11} />
          Pool: ${Number(formatUnits(totalPool, 6)).toFixed(0)}
        </span>
        {hasPosition && (
          <span className="text-indigo-400 flex items-center gap-1">
            <Trophy size={11} />
            Your position: {position.yesShares > 0n ? "YES" : "NO"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canClaim ? (
          <Button
            onClick={() => openClaimModal(marketId)}
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-2"
          >
            <Trophy size={14} />
            Claim ${Number(potentialWinnings).toFixed(2)}
          </Button>
        ) : !isResolved ? (
          <>
            <Button
              onClick={() => {
                openBetModal(marketId);
                // Pre-select YES
              }}
              size="sm"
              variant="outline"
              className="flex-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5"
            >
              <TrendingUp size={13} />
              YES
            </Button>
            <Button
              onClick={() => {
                openBetModal(marketId);
              }}
              size="sm"
              variant="outline"
              className="flex-1 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
            >
              <TrendingDown size={13} />
              NO
            </Button>
          </>
        ) : (
          <p className="text-xs text-white/30 text-center w-full py-1">
            {hasClaimed ? "Winnings claimed" : "Market resolved"}
          </p>
        )}
      </div>
    </div>
  );
}
