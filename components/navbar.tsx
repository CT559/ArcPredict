"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useWallet } from "./wallet-provider";
import { cn } from "@/lib/utils";
import {
  Sun, Moon, Wallet, ChevronDown, LogOut, Copy, ExternalLink,
  BarChart3, Trophy, ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { address, balance, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => setMounted(true), []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Address copied!", description: address.slice(0, 20) + "..." });
    }
    setShowWalletMenu(false);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const navLinks = [
    { href: "/", label: "Markets", icon: BarChart3 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 glass bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl gradient-arc flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">
              Arc<span className="gradient-arc-text">Predict</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-arc-green/10 text-arc-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Wallet */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletMenu((v) => !v)}
                  className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 hover:border-arc-green/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-arc-green animate-pulse" />
                  <div className="text-left">
                    <div className="text-xs font-mono text-muted-foreground">{shortAddress}</div>
                    <div className="text-xs font-mono font-semibold text-arc-green">${balance.toFixed(2)} USDC</div>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showWalletMenu && "rotate-180")} />
                </button>

                {showWalletMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowWalletMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-border bg-secondary/50">
                        <div className="text-xs text-muted-foreground mb-0.5">Connected Wallet</div>
                        <div className="font-mono text-xs truncate">{address}</div>
                        <div className="text-sm font-bold text-arc-green mt-1">${balance.toFixed(2)} USDC</div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={copyAddress}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Address
                        </button>
                        <button
                          onClick={() => { disconnect(); setShowWalletMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left text-red-400"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={isConnecting}
                className="bg-arc-green hover:bg-arc-green/90 text-white font-medium h-9"
                size="sm"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Connect Wallet
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
