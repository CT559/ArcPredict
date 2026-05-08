import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "ArcPredict — Commodity Prediction Markets",
  description:
    "Trade on the future prices of Gold, Oil, Bitcoin, Wheat, and more. Powered by USDC on-chain settlements.",
  keywords: "prediction market, commodities, gold, bitcoin, oil, USDC, defi",
  openGraph: {
    title: "ArcPredict",
    description: "Predict commodity prices. Earn USDC.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-border/50 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded gradient-arc flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="font-display font-semibold text-sm">ArcPredict</span>
                    </div>
                    <p className="text-muted-foreground text-xs text-center">
                      Not financial advice. Prediction markets for informational purposes only.
                      Settle in USDC via Circle App Kit.
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>v1.0.0</span>
                      <span>·</span>
                      <span>Built on Circle</span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
