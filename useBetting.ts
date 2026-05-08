"use client";

import { useCallback, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { parseEventLogs } from "viem";
import { ARC_PREDICT_ABI } from "@/lib/abis/ArcPredict.abi";
import {
  CONTRACT_ADDRESSES,
  Outcome,
  OutcomeType,
} from "@/lib/chain/config";
import {
  toUSDC,
  fromUSDC,
  useEnsureAllowance,
} from "@/hooks/useUSDC";

const PREDICT_ADDR = CONTRACT_ADDRESSES.ARC_PREDICT;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OnChainMarket {
  question: string;
  creator: `0x${string}`;
  resolutionTime: bigint;
  resolved: boolean;
  winningOutcome: number;
  totalYesShares: bigint;
  totalNoShares: bigint;
  totalYesPool: bigint;
  totalNoPool: bigint;
  feeBps: bigint;
}

export interface UserPosition {
  yesShares: bigint;
  noShares: bigint;
  yesCost: bigint;
  noCost: bigint;
}

// ─── Market Count ─────────────────────────────────────────────────────────────
export function useMarketCount() {
  return useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "getMarketCount",
  });
}

// ─── Single Market ────────────────────────────────────────────────────────────
export function useMarket(marketId: bigint | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "getMarket",
    args: marketId !== undefined ? [marketId] : undefined,
    query: { enabled: marketId !== undefined },
  });

  const market = data as OnChainMarket | undefined;

  const yesPool = market?.totalYesPool ?? 0n;
  const noPool = market?.totalNoPool ?? 0n;
  const totalPool = yesPool + noPool;

  const yesProb =
    totalPool > 0n
      ? Number((yesPool * 10000n) / totalPool) / 100
      : 50;
  const noProb = 100 - yesProb;

  return { market, yesProb, noProb, totalPool, isLoading, refetch };
}

// ─── User Position ────────────────────────────────────────────────────────────
export function useUserPosition(marketId: bigint | undefined) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "getUserPosition",
    args:
      marketId !== undefined && address ? [marketId, address] : undefined,
    query: { enabled: marketId !== undefined && !!address },
  });

  const pos = data as
    | [bigint, bigint, bigint, bigint]
    | undefined;

  return {
    position: pos
      ? {
          yesShares: pos[0],
          noShares: pos[1],
          yesCost: pos[2],
          noCost: pos[3],
        }
      : null,
    isLoading,
    refetch,
  };
}

// ─── Potential Winnings ───────────────────────────────────────────────────────
export function usePotentialWinnings(marketId: bigint | undefined) {
  const { address } = useAccount();

  const { data, refetch } = useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "getPotentialWinnings",
    args:
      marketId !== undefined && address ? [marketId, address] : undefined,
    query: { enabled: marketId !== undefined && !!address },
  });

  return {
    raw: data ?? 0n,
    formatted: data ? fromUSDC(data) : "0.00",
    refetch,
  };
}

// ─── Calculate Shares Preview ─────────────────────────────────────────────────
export function useCalculateShares(
  marketId: bigint | undefined,
  outcome: OutcomeType,
  usdcAmountStr: string
) {
  const enabled =
    marketId !== undefined &&
    !!usdcAmountStr &&
    Number(usdcAmountStr) > 0;

  const { data } = useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "calculateShares",
    args: enabled
      ? [marketId!, outcome, toUSDC(usdcAmountStr)]
      : undefined,
    query: { enabled },
  });

  return {
    shares: data ?? 0n,
    formatted: data ? fromUSDC(data) : "0",
  };
}

// ─── Place Bet ────────────────────────────────────────────────────────────────
export type BetStep =
  | "idle"
  | "approving"
  | "approval-confirming"
  | "betting"
  | "bet-confirming"
  | "success"
  | "error";

export function usePlaceBet(marketId: bigint | undefined) {
  const [step, setStep] = useState<BetStep>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { ensureAllowance } = useEnsureAllowance(PREDICT_ADDR);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isBetConfirming, isSuccess: isBetConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const placeBet = useCallback(
    async (outcome: OutcomeType, usdcAmountStr: string) => {
      if (marketId === undefined) return;
      setErrorMsg(null);

      try {
        const amount = toUSDC(usdcAmountStr);

        // Step 1: Check / request USDC approval
        setStep("approving");
        const approvalHash = await ensureAllowance(amount);
        if (approvalHash) {
          setStep("approval-confirming");
          // Give node time to index approval tx before betting
          await new Promise((r) => setTimeout(r, 2000));
        }

        // Step 2: Place bet (1 % slippage → minShares)
        setStep("betting");
        const hash = await writeContractAsync({
          address: PREDICT_ADDR,
          abi: ARC_PREDICT_ABI,
          functionName: "placeBet",
          args: [marketId, outcome, amount, 0n], // minShares=0 for demo
        });
        setTxHash(hash);
        setStep("bet-confirming");
      } catch (err: any) {
        setErrorMsg(err?.shortMessage ?? err?.message ?? "Unknown error");
        setStep("error");
      }
    },
    [marketId, ensureAllowance, writeContractAsync]
  );

  // Bubble up success once tx confirmed
  if (isBetConfirmed && step === "bet-confirming") {
    setStep("success");
  }

  const reset = useCallback(() => {
    setStep("idle");
    setTxHash(undefined);
    setErrorMsg(null);
  }, []);

  return {
    placeBet,
    step,
    txHash,
    isBetConfirming,
    isBetConfirmed,
    errorMsg,
    reset,
  };
}

// ─── Claim Winnings ───────────────────────────────────────────────────────────
export function useClaimWinnings(marketId: bigint | undefined) {
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const claim = useCallback(async () => {
    if (marketId === undefined) return;
    return writeContractAsync({
      address: PREDICT_ADDR,
      abi: ARC_PREDICT_ABI,
      functionName: "claimWinnings",
      args: [marketId],
    });
  }, [marketId, writeContractAsync]);

  return {
    claim,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}

// ─── Create Market ────────────────────────────────────────────────────────────
export function useCreateMarket() {
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const createMarket = useCallback(
    async (
      question: string,
      resolutionTime: bigint,
      feeBps: bigint = 200n
    ) => {
      return writeContractAsync({
        address: PREDICT_ADDR,
        abi: ARC_PREDICT_ABI,
        functionName: "createMarket",
        args: [question, resolutionTime, feeBps],
      });
    },
    [writeContractAsync]
  );

  return {
    createMarket,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}

// ─── Resolve Market (admin/owner) ─────────────────────────────────────────────
export function useResolveMarket() {
  const { writeContractAsync, data: txHash, isPending, error } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const resolveMarket = useCallback(
    async (marketId: bigint, winningOutcome: OutcomeType) => {
      return writeContractAsync({
        address: PREDICT_ADDR,
        abi: ARC_PREDICT_ABI,
        functionName: "resolveMarket",
        args: [marketId, winningOutcome],
      });
    },
    [writeContractAsync]
  );

  return {
    resolveMarket,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// ─── Check if already claimed ─────────────────────────────────────────────────
export function useHasClaimed(marketId: bigint | undefined) {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: PREDICT_ADDR,
    abi: ARC_PREDICT_ABI,
    functionName: "hasClaimed",
    args:
      marketId !== undefined && address ? [marketId, address] : undefined,
    query: { enabled: marketId !== undefined && !!address },
  });

  return !!data;
}
