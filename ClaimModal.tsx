"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import {
  useClaimWinnings,
  useMarket,
  usePotentialWinnings,
  useHasClaimed,
} from "@/hooks/useBetting";
import { arcTestnet } from "@/lib/chain/config";

export function ClaimModal() {
  const { isClaimModalOpen, claimMarketId, closeClaimModal, addTx, updateTxStatus } =
    useBettingStore();

  const marketId =
    claimMarketId !== null ? BigInt(claimMarketId) : undefined;

  const { market } = useMarket(marketId);
  const { formatted: winnings } = usePotentialWinnings(marketId);
  const hasClaimed = useHasClaimed(marketId);

  const {
    claim,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = useClaimWinnings(marketId);

  useEffect(() => {
    if (txHash && isConfirming) {
      addTx({
        hash: txHash,
        type: "claim",
        marketId: claimMarketId ?? undefined,
        timestamp: Date.now(),
        status: "pending",
      });
    }
    if (txHash && isConfirmed) {
      updateTxStatus(txHash, "confirmed");
    }
  }, [txHash, isConfirming, isConfirmed]);

  const explorerUrl = txHash
    ? `${arcTestnet.blockExplorers.default.url}/tx/${txHash}`
    : null;

  if (!isClaimModalOpen) return null;

  return (
    <Dialog open={isClaimModalOpen} onOpenChange={closeClaimModal}>
      <DialogContent className="bg-[#0d0f1a] border border-white/10 text-white max-w-sm shadow-2xl shadow-black/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Claim Winnings
          </DialogTitle>
        </DialogHeader>

        {market && (
          <p className="text-sm text-white/50 -mt-1">{market.question}</p>
        )}

        {hasClaimed ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center text-white/50 text-sm">
            You have already claimed your winnings for this market.
          </div>
        ) : (
          <>
            {/* Winnings display */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-5 text-center space-y-1">
              <Trophy className="mx-auto text-emerald-400 mb-2" size={28} />
              <p className="text-3xl font-bold text-emerald-300">
                ${Number(winnings).toFixed(2)}
              </p>
              <p className="text-xs text-white/40">USDC to claim</p>
            </div>

            {/* Success */}
            {isConfirmed && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-start gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                <div className="text-sm">
                  <p className="text-emerald-300 font-semibold">
                    Winnings claimed!
                  </p>
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
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-3">
                <AlertCircle className="text-rose-400 shrink-0" size={18} />
                <p className="text-rose-300 text-sm">
                  {(error as any)?.shortMessage ?? error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={closeClaimModal}
                disabled={isPending || isConfirming}
                className="flex-1 text-white/50 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => claim()}
                disabled={isPending || isConfirming || isConfirmed}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-2"
              >
                {isPending || isConfirming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trophy size={16} />
                )}
                {isPending
                  ? "Submitting…"
                  : isConfirming
                  ? "Confirming…"
                  : isConfirmed
                  ? "Claimed!"
                  : "Claim"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
