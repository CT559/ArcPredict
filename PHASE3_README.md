# ArcPredict — Phase 3: Web3 Betting System

Full on-chain prediction market on **Arc Testnet** using USDC, Wagmi, Viem, and App Kit.

---

## File Map

```
src/
├── lib/
│   ├── abis/
│   │   └── ArcPredict.abi.ts      # Full ABI for contract + ERC20
│   ├── chain/
│   │   └── config.ts              # Arc Testnet chain def, contract addresses, constants
│   └── wagmi/
│       └── config.ts              # Wagmi createConfig for Arc Testnet
│
├── hooks/
│   ├── useUSDC.ts                 # balance, allowance, approve, ensureAllowance
│   └── useBetting.ts             # placeBet, claimWinnings, createMarket, market reads
│
├── store/
│   └── bettingStore.ts           # Zustand: bet draft, tx history, modal flags
│
├── providers/
│   └── Web3Provider.tsx          # WagmiProvider + QueryClient + AppKitProvider
│
├── components/
│   ├── betting/
│   │   ├── BetModal.tsx          # Multi-step bet flow (approve → bet → confirm)
│   │   ├── ClaimModal.tsx        # Claim winnings from resolved markets
│   │   └── CreateMarketModal.tsx # Admin: create new markets on-chain
│   ├── markets/
│   │   └── MarketCard.tsx        # Market card wired to on-chain data
│   └── wallet/
│       ├── WalletBar.tsx         # Connect wallet + USDC balance display
│       └── TxHistory.tsx         # Persisted tx history with explorer links
│
└── app/
    └── markets/
        └── page.tsx              # Example markets page

contracts/
└── ArcPredict.sol                # Solidity contract (deploy to Arc Testnet)

scripts/
└── deploy.ts                     # Hardhat deploy script

hardhat.config.ts
.env.local.example
```

---

## Setup

### 1. Install dependencies

```bash
npm install wagmi viem @tanstack/react-query zustand
npm install @circle-fin/app-kit         # or @reown/appkit — check your version

# For contract deployment
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` — from https://cloud.walletconnect.com
- `DEPLOYER_PRIVATE_KEY` — testnet wallet private key (never commit!)

### 3. Deploy the contract

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network arcTestnet
```

Copy the printed address into `.env.local`:
```
NEXT_PUBLIC_ARC_PREDICT_ADDRESS=0x...
```

### 4. Wrap your layout

```tsx
// src/app/layout.tsx
import { Web3Provider } from "@/providers/Web3Provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
```

### 5. Add the markets page

The file at `src/app/markets/page.tsx` is a fully working drop-in.  
Import `BetModal`, `ClaimModal`, `CreateMarketModal` into your existing layout if you prefer.

---

## Key Flows

### Placing a Bet (BetModal)

```
User enters amount
  → useEnsureAllowance() checks USDC allowance
  → if insufficient → approve(spender, maxUint256)
  → wait for approval confirmation
  → placeBet(marketId, outcome, amount, minShares)
  → wait for bet confirmation
  → update TxHistory in Zustand
```

### Claiming Winnings (ClaimModal)

```
Market resolved + user on winning side
  → getPotentialWinnings() shows payout
  → claimWinnings(marketId)
  → USDC transferred on-chain
```

### AMM Share Model

Shares use a simplified constant-product formula:

```
shares = netIn * totalSupply / (pool + netIn)
```

On first bet (bootstrap): `shares = netIn` (1 share per USDC unit).

Payout on resolution:
```
payout = (userShares / totalWinningSideShares) * totalPool
```

---

## App Kit Provider Note

The `Web3Provider` imports from `@circle-fin/app-kit/react`. If your project uses a different package name or version, update the import and `AppKitProvider` props accordingly. The wagmi config is package-agnostic.
