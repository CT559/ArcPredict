// app/layout.tsx
import type { Metadata } from "next";
import { Outfit, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeProvider from "@/components/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArcPredict — Dự đoán Kim loại • Dầu • Lương thực",
  description:
    "Nền tảng dự đoán giá hàng hóa phi tập trung. Dùng USDC trên Arc Testnet để dự đoán Kim loại, Năng lượng, Lương thực và Crypto.",
  keywords: [
    "prediction market",
    "defi",
    "arc testnet",
    "usdc",
    "commodities",
    "gold",
    "oil",
  ],
  openGraph: {
    title: "ArcPredict",
    description: "Dự đoán giá Kim loại - Dầu - Lương thực bằng USDC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${syne.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F1E38",
                border: "1px solid #1A2F52",
                color: "#E2E8F0",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
