"use client";

import { createConfig, http } from "wagmi";
import { APP_KIT_PROJECT_ID, ARC_TESTNET } from "@/lib/constants";

// ─── Wagmi Config ──────────────────────────────────────────────────────────────
// NOTE: @circle-fin/app-kit wraps wagmi internally.
// We define the base wagmi config here and pass it to the AppKit provider.

export const wagmiConfig = createConfig({
  chains: [ARC_TESTNET as any],
  transports: {
    [ARC_TESTNET.id]: http(ARC_TESTNET.rpcUrls.default.http[0]),
  },
  ssr: true,
});

// ─── App-Kit Config ────────────────────────────────────────────────────────────
// Circle App-Kit initialisation is done in the Provider component to avoid
// SSR issues. The key is pulled from the environment.

export const appKitConfig = {
  projectId: APP_KIT_PROJECT_ID,
  chains: [ARC_TESTNET],
  metadata: {
    name: "ArcPredict",
    description: "Decentralized prediction markets on Arc Testnet",
    url: "https://arcpredict.xyz",
    icons: ["/logo.svg"],
  },
};
