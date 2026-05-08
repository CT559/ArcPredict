"use client";

import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { ERC20_ABI } from "@/lib/abis/ArcPredict.abi";
import { CONTRACT_ADDRESSES, USDC_DECIMALS } from "@/lib/chain/config";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const toUSDC = (amount: string | number) =>
  parseUnits(String(amount), USDC_DECIMALS);

export const fromUSDC = (raw: bigint) =>
  formatUnits(raw, USDC_DECIMALS);

// ─── USDC Balance ─────────────────────────────────────────────────────────────
export function useUSDCBalance() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    raw: data ?? 0n,
    formatted: data ? fromUSDC(data) : "0.00",
    isLoading,
    refetch,
  };
}

// ─── USDC Allowance ───────────────────────────────────────────────────────────
export function useUSDCAllowance(spender: `0x${string}`) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    query: { enabled: !!address },
  });

  return {
    raw: data ?? 0n,
    formatted: data ? fromUSDC(data) : "0.00",
    isLoading,
    refetch,
  };
}

// ─── USDC Approve ─────────────────────────────────────────────────────────────
export function useUSDCApprove() {
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const approve = useCallback(
    async (spender: `0x${string}`, amount?: bigint) => {
      return writeContractAsync({
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amount ?? maxUint256],
      });
    },
    [writeContractAsync]
  );

  return {
    approve,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}

// ─── Ensure sufficient allowance (approve if needed) ─────────────────────────
export function useEnsureAllowance(spender: `0x${string}`) {
  const { raw: allowance, refetch: refetchAllowance } =
    useUSDCAllowance(spender);
  const { approve, isPending, isConfirming, isConfirmed, error } =
    useUSDCApprove();

  const ensureAllowance = useCallback(
    async (requiredAmount: bigint) => {
      if (allowance >= requiredAmount) return null; // already enough
      const hash = await approve(spender, maxUint256);
      return hash;
    },
    [allowance, approve, spender]
  );

  return {
    ensureAllowance,
    refetchAllowance,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
