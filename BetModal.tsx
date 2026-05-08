"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import {
  usePlaceBet,
  useMarket,
  useCalculateShares,
  BetStep,
} from "@/hooks/useBetting";
import { useUSDCBalance } from "@/hooks/useUSDC";
import { Outcome } from "@/lib/chain/config";
import { arcTestnet } from "@/lib/chain/config";
import { cn } from "@/lib/utils";

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS: { key: BetStep; label: string }[] = [
  { key: "approving", label: "Approve USDC" },
  { key: "approval-confirming", label: "Confirming approval" },
  { key: "betting", label: "Submit bet" },
  { key: "bet-confirming", label: "Confirming bet" },
  { key: "success", label: "Done!" },
];

const ACTIVE_STEPS: BetStep[] = [
  "approving",
  "approval-confirming",
  "betting",
  "bet-confirming",
  "success",
];

function StepTracker({ step }: { step: BetStep }) {
  const currentIdx = ACTIVE_STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-1 w-full mt-2">
      {STEPS.map((s, i) => {
        const done = currentIdx > i;
        const active = currentIdx === i;
        return (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full flex-1 transition-all duration-500",
                done
                  ? "bg-emerald-400"
                  : active
                  ? "bg-amber-400 animate-pulse"
                  : "bg-white/10"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Amount preset buttons ────────────────────────────────────────────────────
const PRESETS = ["10", "25", "50", "100"];

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function BetModal() {
  const { address, isConnected } = useAccount();
  const {
    isBetModalOpen,
    closeBetModal,
    draft,
    setDraft,
    resetDraft,
    addTx,
    updateTxStatus,
  } = useBettingStore();

  const marketId =
    draft.marketId !== null ? BigInt(draft.marketId) : undefined;

  const { market, yesProb, noProb, totalPool, refetch: refetchMarket } =
    useMarket(marketId);
  const { formatted: usdcBalance } = useUSDCBalance();
  const { shares, formatted: sharesFormatted } = useCalculateShares(
    marketId,
    draft.outcome,
    draft.amountStr
  );

  const { placeBet, step, txHash, isBetConfirmed, errorMsg, reset } =
    usePlaceBet(marketId);

  // Track tx in store
  useEffect(() => {
    if (txHash && step === "bet-confirming") {
      addTx({
        hash: txHash,
        type: "bet",
        marketId: draft.marketId ?? undefined,
        outcome: draft.outcome,
        amount: draft.amountStr,
        timestamp: Date.now(),
        status: "pending",
      });
    }
    if (txHash && isBetConfirmed) {
      updateTxStatus(txHash, "confirmed");
      refetchMarket();
    }
  }, [txHash, step, isBetConfirmed]);

  const isProcessing =
    step === "approving" ||
    step === "approval-confirming" ||
    step === "betting" ||
    step === "bet-confirming";

  const handleClose = () => {
    if (!isProcessing) {
      reset();
      resetDraft();
      closeBetModal();
    }
  };

  const handlePlaceBet = async () => {
    if (!draft.amountStr || Number(draft.amountStr) <= 0) return;
    await placeBet(draft.outcome, draft.amountStr);
  };

  const explorerUrl = txHash
    ? `${arcTestnet.blockExplorers.default.url}/tx/${txHash}`
    : null;

  if (!isBetModalOpen) return null;

  return (
    <Dialog open={isBetModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0d0f1a] border border-white/10 text-white max-w-md shadow-2xl shadow-black/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Place Prediction
          </DialogTitle>
        </DialogHeader>

        {/* Market Question */}
        {market && (
          <p className="text-sm text-white/60 leading-snug -mt-1 mb-1">
            {market.question}
          </p>
        )}

        {/* Outcome Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDraft({ outcome: Outcome.YES })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 border transition-all font-semibold text-sm",
              draft.outcome === Outcome.YES
                ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                : "border-white/10 text-white/50 hover:border-white/20"
            )}
          >
            <TrendingUp size={16} />
            YES · {yesProb.toFixed(1)}%
          </button>
          <button
            onClick={() => setDraft({ outcome: Outcome.NO })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 border transition-all font-semibold text-sm",
              draft.outcome === Outcome.NO
                ? "bg-rose-500/20 border-rose-500/60 text-rose-300"
                : "border-white/10 text-white/50 hover:border-white/20"
            )}
          >
            <TrendingDown size={16} />
            NO · {noProb.toFixed(1)}%
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Amount (USDC)</span>
            <span>Balance: {Number(usdcBalance).toFixed(2)} USDC</span>
          </div>
          <div className="relative">
            <Input
              type="number"
              min="1"
              placeholder="0.00"
              value={draft.amountStr}
              onChange={(e) => setDraft({ amountStr: e.target.value })}
              disabled={isProcessing || step === "success"}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pr-16 h-12 text-base"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 font-medium">
              USDC
            </span>
          </div>

          {/* Presets */}
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setDraft({ amountStr: p })}
                disabled={isProcessing || step === "success"}
                className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/50 hover:border-white/25 hover:text-white/75 transition-all"
              >
                ${p}
              </button>
            ))}
            <button
              onClick={() => setDraft({ amountStr: usdcBalance })}
              disabled={isProcessing || step === "success"}
              className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/50 hover:border-white/25 hover:text-white/75 transition-all ml-auto"
            >
              Max
            </button>
          </div>
        </div>

        {/* Order Summary */}
        {draft.amountStr && Number(draft.amountStr) > 0 && (
          <div className="rounded-xl bg-white/5 border border-white/8 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-white/50">
              <span>Shares to receive</span>
              <span className="text-white font-medium">{sharesFormatted}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Outcome</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  draft.outcome === Outcome.YES
                    ? "border-emerald-500/50 text-emerald-400"
                    : "border-rose-500/50 text-rose-400"
                )}
              >
                {draft.outcome === Outcome.YES ? "YES" : "NO"}
              </Badge>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Total Pool</span>
              <span className="text-white/70">
                ${Number(formatUnits(totalPool, 6)).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Step Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <p className="text-xs text-amber-400 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              {STEPS.find((s) => s.key === step)?.label}…
            </p>
            <StepTracker step={step} />
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="text-emerald-300 font-semibold">Bet confirmed!</p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/70 flex items-center gap-1 mt-1 text-xs"
                >
                  View on explorer <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {step === "error" && errorMsg && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-3">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="text-rose-300 font-semibold">Transaction failed</p>
              <p className="text-white/40 text-xs mt-1 line-clamp-2">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          {step === "success" || step === "error" ? (
            <Button
              onClick={() => {
                reset();
                if (step === "success") {
                  resetDraft();
                  closeBetModal();
                }
              }}
              variant="outline"
              className="flex-1 border-white/15 text-white hover:bg-white/10"
            >
              {step === "success" ? "Close" : "Try Again"}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleClose}
                variant="ghost"
                disabled={isProcessing}
                className="flex-1 text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceBet}
                disabled={
                  isProcessing ||
                  !draft.amountStr ||
                  Number(draft.amountStr) <= 0 ||
                  !isConnected
                }
                className={cn(
                  "flex-1 font-semibold flex items-center gap-2",
                  draft.outcome === Outcome.YES
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                    : "bg-rose-500 hover:bg-rose-400 text-white"
                )}
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {isProcessing ? "Processing…" : "Place Bet"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
