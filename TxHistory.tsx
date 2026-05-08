"use client";

import { ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useBettingStore, TxRecord } from "@/store/bettingStore";
import { arcTestnet } from "@/lib/chain/config";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<TxRecord["type"], string> = {
  approve: "Approve USDC",
  bet: "Place Bet",
  claim: "Claim Winnings",
  create: "Create Market",
};

const STATUS_ICON = {
  pending: <Clock size={13} className="text-amber-400 animate-pulse" />,
  confirmed: <CheckCircle2 size={13} className="text-emerald-400" />,
  failed: <XCircle size={13} className="text-rose-400" />,
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function TxHistory() {
  const { txHistory } = useBettingStore();

  if (txHistory.length === 0) {
    return (
      <p className="text-xs text-white/30 text-center py-4">
        No transactions yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {txHistory.map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5"
        >
          {STATUS_ICON[tx.status]}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 font-medium">
              {TYPE_LABEL[tx.type]}
              {tx.outcome !== undefined && (
                <span
                  className={cn(
                    "ml-1.5 text-[10px] font-semibold",
                    tx.outcome === 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {tx.outcome === 0 ? "YES" : "NO"}
                </span>
              )}
              {tx.amount && (
                <span className="ml-1 text-white/40">${tx.amount}</span>
              )}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">
              {timeAgo(tx.timestamp)}
            </p>
          </div>
          <a
            href={`${arcTestnet.blockExplorers.default.url}/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 hover:text-white/60 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  );
}
