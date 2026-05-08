"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi-config";

// NOTE: @circle-fin/app-kit initialization is done here.
// Import `createAppKit` from @circle-fin/app-kit when the package is installed.
// For now we scaffold the provider shell.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* 
          Circle App-Kit Provider:
          Wrap children with <AppKitProvider config={appKitConfig}> 
          once @circle-fin/app-kit is installed.
        */}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
