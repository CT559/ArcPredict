"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKitProvider } from "@circle-fin/app-kit/react"; // adjust import for your App Kit version
import { wagmiConfig } from "@/lib/wagmi/config";
import { arcTestnet } from "@/lib/chain/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15, // 15 s — revalidate on-chain data regularly
      retry: 2,
    },
  },
});

// Circle / Reown App Kit metadata
const APP_KIT_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
  metadata: {
    name: "ArcPredict",
    description: "On-chain prediction markets on Arc Testnet",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: ["/icon.png"],
  },
  chains: [arcTestnet],
  wagmiConfig,
};

interface Props {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* 
          Replace AppKitProvider with the exact provider export from your
          version of @circle-fin/app-kit or @reown/appkit.
          Pass wagmiConfig + chains so App Kit uses our Arc Testnet chain.
        */}
        <AppKitProvider config={APP_KIT_CONFIG}>
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
