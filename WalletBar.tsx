"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@circle-fin/app-kit/react"; // adjust if using @reown/appkit
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ChevronDown, Loader2 } from "lucide-react";
import { useUSDCBalance } from "@/hooks/useUSDC";
import { cn } from "@/lib/utils";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletBar() {
  const { address, isConnected, isConnecting } = useAccount();
  const { open } = useAppKit();
  const { formatted: balance, isLoading } = useUSDCBalance();

  if (isConnecting) {
    return (
      <Button
        disabled
        variant="outline"
        size="sm"
        className="border-white/15 text-white/50 gap-2"
      >
        <Loader2 size={14} className="animate-spin" />
        Connecting…
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => open()}
        size="sm"
        className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold flex items-center gap-2"
      >
        <Wallet size={14} />
        Connect Wallet
      </Button>
    );
  }

  return (
    <button
      onClick={() => open({ view: "Account" })}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5",
        "hover:bg-white/8 hover:border-white/20 transition-all px-3 py-2 text-sm"
      )}
    >
      {/* USDC Balance */}
      <Badge
        variant="outline"
        className="border-emerald-500/40 text-emerald-400 text-xs bg-emerald-500/10"
      >
        {isLoading ? "…" : `$${Number(balance).toFixed(2)}`} USDC
      </Badge>

      {/* Address */}
      <span className="text-white/70 font-mono text-xs">
        {shortAddr(address)}
      </span>
      <ChevronDown size={13} className="text-white/30" />
    </button>
  );
}
