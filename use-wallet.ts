"use client";

import { useEffect } from "react";
import { useAccount, useBalance, useChainId, useDisconnect } from "wagmi";
import { useArcStore } from "@/store";
import { CONTRACTS, USDC_DECIMALS, ARC_TESTNET_CHAIN_ID } from "@/lib/constants";
import { formatAddress } from "@/lib/utils";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { setWallet, resetWallet, wallet } = useArcStore();

  // Fetch USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACTS.USDC,
    query: { enabled: isConnected && !!address },
  });

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_CHAIN_ID;

  useEffect(() => {
    if (isConnected && address) {
      const formatted = usdcBalance
        ? parseFloat(usdcBalance.formatted).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00";

      setWallet({
        address,
        usdcBalance: formatted,
        isConnected: true,
        chainId,
      });
    } else {
      resetWallet();
    }
  }, [isConnected, address, usdcBalance, chainId, setWallet, resetWallet]);

  return {
    address: wallet.address,
    shortAddress: wallet.address ? formatAddress(wallet.address) : null,
    usdcBalance: wallet.usdcBalance,
    isConnected: wallet.isConnected,
    isWrongChain,
    chainId: wallet.chainId,
    disconnect,
  };
}
