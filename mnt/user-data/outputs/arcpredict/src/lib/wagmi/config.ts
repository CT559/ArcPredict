"use client";

import { createConfig, http } from "wagmi";
import { arcTestnet } from "@/lib/chain/config";

// ─── Wagmi Config ──────────────────────────────────────────────────────────────
// App Kit handles the connector layer; wagmi just needs transport + chain.
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
