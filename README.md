# ArcPredict 🔮

> Decentralized prediction markets on **Arc Testnet** — trade your beliefs on Crypto, Commodities, Energy & Macro outcomes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + Immer |
| Web3 | Wagmi v2 + Viem |
| Wallet | @circle-fin/app-kit |
| Charts | Recharts |
| Icons | Lucide React |
| Chain | Arc Testnet |
| USDC | `0x3600000000000000000000000000000000000000` |

---

## Project Structure

```
arcpredict/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Navbar + Footer + Providers)
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   └── market/[id]/        # Market detail page shell
│
├── components/
│   ├── layout/
│   │   ├── navbar.tsx      # Top navigation bar
│   │   └── footer.tsx      # Site footer
│   ├── home/
│   │   ├── hero-section.tsx    # Hero + platform stats
│   │   └── markets-section.tsx # Markets grid
│   ├── markets/
│   │   ├── market-card.tsx     # Individual market card
│   │   └── category-filter.tsx # Category + sort controls
│   └── providers.tsx       # Wagmi + QueryClient providers
│
├── hooks/
│   ├── use-markets.ts      # Market data hook
│   └── use-wallet.ts       # Wallet / USDC balance hook
│
├── lib/
│   ├── constants.ts        # Contract addresses, chain config
│   ├── utils.ts            # Formatters + helpers
│   └── wagmi-config.ts     # Wagmi + App-Kit configuration
│
├── services/
│   └── market-service.ts   # Mock data engine (18+ markets)
│
├── store/
│   └── index.ts            # Zustand global store
│
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in NEXT_PUBLIC_KIT_KEY

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_KIT_KEY` | ✅ | Circle App-Kit project key |
| `NEXT_PUBLIC_ARC_RPC_URL` | Optional | Arc Testnet RPC override |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL for OpenGraph |

---

## Contracts (Arc Testnet)

| Contract | Address |
|----------|---------|
| USDC | `0x3600000000000000000000000000000000000000` |
| Prediction Market Factory | TBD (Phase 3) |
| Conditional Token | TBD (Phase 3) |

---

## Roadmap

- **Phase 1** ✅ Architecture, UI Core, Mock Data Engine
- **Phase 2** 🔜 Market Detail Page, Trading Panel, Order Book
- **Phase 3** 🔜 On-chain Integration (deploy contracts, live reads)
- **Phase 4** 🔜 Portfolio Page, Position Management
- **Phase 5** 🔜 Admin Panel, Market Creation
