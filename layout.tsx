import type { Metadata } from "next";
import { Crimson_Pro, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// ─── Fonts ─────────────────────────────────────────────────────────────────────

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "ArcPredict — Decentralized Prediction Markets",
    template: "%s | ArcPredict",
  },
  description:
    "Trade on real-world outcomes across Crypto, Commodities, Energy & Macro on Arc Testnet.",
  keywords: ["prediction market", "polymarket", "arc testnet", "defi", "crypto"],
  openGraph: {
    title: "ArcPredict",
    description: "Decentralized prediction markets on Arc Testnet",
    type: "website",
  },
};

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${crimsonPro.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-arc-bg text-arc-text-primary font-body antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
