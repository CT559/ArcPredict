"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface WalletContextType {
  address: string | null;
  balance: number;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: 0,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: () => {},
});

const MOCK_ADDRESSES = [
  "0x7f3a2e8b9c4d1f5a3b7e2f9c4d1b5a3e7f2c9d4b",
  "0x2e8b4d1f9c7a3b5e8f2c4d1b7a3e5f9c2d8b4f1e",
  "0x9c4d7e3a1b5f8c2e4d9b7a3f5e1c8d2b4f7a3e9c",
];

const WALLET_KEY = "arcpredict_wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load persisted wallet
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WALLET_KEY);
      if (stored) {
        const { address: storedAddr, balance: storedBal } = JSON.parse(stored);
        setAddress(storedAddr);
        setBalance(storedBal);
      }
    } catch {}
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    // Simulate Circle App Kit wallet connection
    // In production: use @circle-fin/app-kit AppKit.connect()
    await new Promise((r) => setTimeout(r, 1200));

    const mockAddress = MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)];
    const mockBalance = 1000 + Math.random() * 4000; // $1000-$5000 USDC

    setAddress(mockAddress);
    setBalance(Math.round(mockBalance * 100) / 100);

    localStorage.setItem(
      WALLET_KEY,
      JSON.stringify({ address: mockAddress, balance: Math.round(mockBalance * 100) / 100 })
    );

    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(0);
    localStorage.removeItem(WALLET_KEY);
  }, []);

  const refreshBalance = useCallback(() => {
    if (!address) return;
    // Simulate balance refresh from Circle App Kit
    const stored = localStorage.getItem(WALLET_KEY);
    if (stored) {
      try {
        const { balance: storedBal } = JSON.parse(stored);
        setBalance(storedBal);
      } catch {}
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
