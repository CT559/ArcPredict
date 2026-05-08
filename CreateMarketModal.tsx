"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useBettingStore } from "@/store/bettingStore";
import { useCreateMarket } from "@/hooks/useBetting";
import { arcTestnet } from "@/lib/chain/config";

export function CreateMarketModal() {
  const { isCreateModalOpen, closeCreateModal, addTx, updateTxStatus } =
    useBettingStore();

  const [question, setQuestion] = useState("");
  const [daysFromNow, setDaysFromNow] = useState("7");
  const [feeBps, setFeeBps] = useState("200");

  const {
    createMarket,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = useCreateMarket();

  const handleCreate = async () => {
    if (!question.trim()) return;
    const resolutionTime =
      BigInt(Math.floor(Date.now() / 1000)) +
      BigInt(Number(daysFromNow) * 86400);
    const fee = BigInt(Number(feeBps));

    const hash = await createMarket(question.trim(), resolutionTime, fee);
    if (hash) {
      addTx({
        hash,
        type: "create",
        timestamp: Date.now(),
        status: "pending",
      });
    }
  };

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      reset();
      setQuestion("");
      setDaysFromNow("7");
      closeCreateModal();
    }
  };

  const explorerUrl = txHash
    ? `${arcTestnet.blockExplorers.default.url}/tx/${txHash}`
    : null;

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0d0f1a] border border-white/10 text-white max-w-md shadow-2xl shadow-black/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <PlusCircle size={18} className="text-indigo-400" />
            Create Market
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Question</Label>
            <Textarea
              placeholder="Will ETH reach $5,000 before end of Q2?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isPending || isConfirming || isConfirmed}
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Resolution Time */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">
              Resolves in (days)
            </Label>
            <Input
              type="number"
              min="1"
              max="365"
              value={daysFromNow}
              onChange={(e) => setDaysFromNow(e.target.value)}
              disabled={isPending || isConfirming || isConfirmed}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Fee */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">
              Protocol fee (basis points — 200 = 2%)
            </Label>
            <Input
              type="number"
              min="0"
              max="1000"
              value={feeBps}
              onChange={(e) => setFeeBps(e.target.value)}
              disabled={isPending || isConfirming || isConfirmed}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Success */}
          {isConfirmed && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
              <div className="text-sm">
                <p className="text-emerald-300 font-semibold">
                  Market created on-chain!
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
              <p className="text-rose-300 text-sm line-clamp-2">
                {(error as any)?.shortMessage ?? error.message}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isPending || isConfirming}
              className="flex-1 text-white/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !question.trim() ||
                isPending ||
                isConfirming ||
                isConfirmed
              }
              className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold flex items-center gap-2"
            >
              {isPending || isConfirming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PlusCircle size={16} />
              )}
              {isPending
                ? "Submitting…"
                : isConfirming
                ? "Confirming…"
                : isConfirmed
                ? "Created!"
                : "Create Market"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
