"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Market } from "@/services/market-service";

type Side = "YES" | "NO";
type TxState = "idle" | "loading" | "success" | "error";

interface TradingPanelProps {
  market: Market;
  isConnected: boolean;
  onConnect: () => void;
}

export function TradingPanel({ market, isConnected, onConnect }: TradingPanelProps) {
  const [side, setSide] = useState<Side>("YES");
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txError, setTxError] = useState("");

  const price = side === "YES" ? market.yesPrice : market.noPrice;
  const shares = amount && price > 0 ? parseFloat(amount) / price : 0;
  const potentialProfit = shares > 0 ? shares - parseFloat(amount || "0") : 0;

  async function handleTrade() {
    if (!isConnected) { onConnect(); return; }
    if (!amount || parseFloat(amount) <= 0) return;
    setTxState("loading");
    setTxError("");
    try {
      // Simulate tx — replace with real contract call
      await new Promise((r) => setTimeout(r, 1800));
      setTxState("success");
      setTimeout(() => setTxState("idle"), 3000);
    } catch (e: any) {
      setTxState("error");
      setTxError(e?.message ?? "Transaction failed");
    }
  }

  const PRESETS = ["10", "25", "50", "100"];

  return (
    <div className="sticky top-24 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Trade</h2>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Side toggle */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 rounded-xl p-1">
          {(["YES", "NO"] as Side[]).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={cn(
                "py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                side === s && s === "YES" && "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
                side === s && s === "NO" && "bg-rose-600 text-white shadow-lg shadow-rose-600/20",
                side !== s && "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s} &nbsp;
              <span className="font-normal opacity-80">
                {s === "YES"
                  ? `${(market.yesPrice * 100).toFixed(1)}¢`
                  : `${(market.noPrice * 100).toFixed(1)}¢`}
              </span>
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block font-medium">Amount (USDC)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">$</span>
            <input
              type="number"
              value={amount}
              min="0"
              step="1"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={cn(
                "w-full pl-7 pr-4 py-2.5 rounded-xl",
                "bg-zinc-950/60 border border-zinc-800 text-sm text-zinc-100",
                "focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30",
                "transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
          </div>
          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className="py-1 text-xs rounded-lg bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all duration-150 border border-zinc-800"
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        {shares > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-2 text-xs"
          >
            <div className="flex justify-between text-zinc-400">
              <span>Avg price</span>
              <span className="text-zinc-200 font-medium">{(price * 100).toFixed(1)}¢</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Shares</span>
              <span className="text-zinc-200 font-medium">{shares.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-2">
              <span>Max profit</span>
              <span className="text-emerald-400 font-semibold">+${potentialProfit.toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <AnimatePresence mode="wait">
          {txState === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" /> Order placed!
            </motion.div>
          ) : txState === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 py-3 px-4 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {txError || "Transaction failed"}
            </motion.div>
          ) : (
            <motion.button
              key="trade"
              onClick={handleTrade}
              disabled={txState === "loading"}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold transition-all duration-200",
                "flex items-center justify-center gap-2",
                !isConnected
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : side === "YES"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25",
                txState === "loading" && "opacity-70 cursor-not-allowed"
              )}
            >
              {txState === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !isConnected ? (
                <>
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </>
              ) : (
                `Buy ${side}`
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-zinc-600">
          Trading on Arc Testnet · Settled in USDC
        </p>
      </div>
    </div>
  );
}
