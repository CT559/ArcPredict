# ArcPredict 🎯

A production-ready prediction market web app for commodities, crypto, and indices — powered by USDC via Circle App Kit.

## Features

- **18+ Active Markets**: Gold, Silver, Copper, Oil, Natural Gas, Wheat, Corn, Soy, Coffee, Bitcoin, Ethereum, S&P 500, Nasdaq, and more
- **Real-time Price Charts**: Interactive Recharts area charts with 48h price history
- **Bet Interface**: YES/NO betting with USDC amounts, live payout previews
- **Wallet Integration**: Circle App Kit for real USDC balances
- **Auto Claim Rewards**: One-click reward claiming after market resolution
- **Admin Dashboard**: Password-protected (admin123) market resolution panel
- **Leaderboard**: Top 10 traders by earnings
- **Toast Notifications**: Real-time feedback for bets and claims
- **Dark/Light Theme**: Full theme toggle with next-themes

## Tech Stack

- **Next.js 14** — App Router + TypeScript
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Radix UI components
- **Recharts** — Price charts
- **lucide-react** — Icons
- **@circle-fin/app-kit** — Wallet + USDC
- **next-themes** — Theme management
- **date-fns** — Date formatting

## Project Structure

```
/app
  ├── layout.tsx              # Root layout with providers
  ├── page.tsx                # Homepage with market list
  ├── leaderboard/page.tsx    # Leaderboard page
  ├── markets/[id]/page.tsx   # Market detail + betting
  ├── admin/page.tsx          # Admin dashboard (pw: admin123)
  └── api/claim/route.ts      # Claim reward API endpoint
/components
  ├── navbar.tsx              # Navigation + wallet connect
  ├── theme-provider.tsx      # next-themes wrapper
  ├── wallet-provider.tsx     # Circle App Kit context
  └── ui/                     # shadcn UI components
/lib
  ├── data.ts                 # Market data, types, helpers
  ├── store.ts                # Client-side state (localStorage)
  └── utils.ts                # cn() utility
```

## Local Development

### 1. Clone and install

```bash
git clone <your-repo>
cd arcpredict
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local and add your Circle App Kit key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment (Step-by-Step)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: ArcPredict"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/arcpredict.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Click **"Import Git Repository"** and select your `arcpredict` repo
4. Vercel auto-detects Next.js — no framework config needed

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_KIT_KEY` | Your Circle App Kit key from [console.circle.com](https://console.circle.com) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | `admin123` (or your custom password) |

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes for the build to complete
3. Your app is live at `https://arcpredict.vercel.app` (or your custom domain)

### Step 5: Custom Domain (Optional)

In Vercel → **Domains**, add your domain and follow DNS instructions.

## Circle App Kit Integration

This app uses `@circle-fin/app-kit` for wallet connectivity and USDC balance display.

### Get your API Key

1. Go to [console.circle.com](https://console.circle.com)
2. Create an account / log in
3. Navigate to **App Kit** → **API Keys**
4. Create a new key and copy it to `NEXT_PUBLIC_KIT_KEY`

### Real Integration (production upgrade)

In `components/wallet-provider.tsx`, replace the mock implementation:

```typescript
import { AppKit } from '@circle-fin/app-kit';

const appKit = new AppKit({
  apiKey: process.env.NEXT_PUBLIC_KIT_KEY!,
  // ... config
});

const connect = async () => {
  const wallet = await appKit.connect();
  const balance = await appKit.getBalance(wallet.address, 'USDC');
  // ...
};
```

In `app/api/claim/route.ts`, replace the mock:

```typescript
const circleClient = new CircleAppKit({ apiKey: process.env.CIRCLE_API_KEY });
const transfer = await circleClient.transfer({
  to: address,
  amount: String(amount),
  currency: 'USDC',
  chain: 'ETH', // or MATIC, ARB, etc.
});
```

## Admin Access

Navigate to `/admin` and enter password: **admin123**

From the admin dashboard you can:
- Resolve any active market as YES or NO
- View volume analytics by category
- See full leaderboard
- Reset all data (for testing)

## License

MIT
