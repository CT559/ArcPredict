"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu, X, Wallet, ChevronDown, AlertTriangle, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useArcStore } from "@/store";
import { cn } from "@/lib/utils";

// ─── Wallet Button ─────────────────────────────────────────────────────────────

function WalletButton() {
  const { address, shortAddress, usdcBalance, isConnected, isWrongChain, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isConnected) {
    return (
      <button
        // In production: onClick={() => open AppKit modal}
        onClick={() => console.log("Open AppKit wallet modal")}
        className="
          group flex items-center gap-2 px-4 py-2 rounded-lg
          bg-arc-primary hover:bg-arc-primary-hover
          text-white text-sm font-semibold
          transition-all duration-200
          shadow-arc-glow hover:shadow-[0_0_32px_rgba(59,130,246,0.4)]
        "
      >
        <Wallet size={15} className="group-hover:scale-110 transition-transform" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200",
          isWrongChain
            ? "border-arc-no/50 bg-arc-no/10 text-arc-no hover:bg-arc-no/20"
            : "border-arc-border bg-arc-elevated hover:border-arc-primary/50 text-arc-text-primary"
        )}
      >
        {isWrongChain ? (
          <AlertTriangle size={14} className="text-arc-no" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-arc-yes animate-pulse" />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs text-arc-text-secondary font-normal">{shortAddress}</span>
          {!isWrongChain && (
            <span className="text-arc-primary font-semibold">${usdcBalance} USDC</span>
          )}
          {isWrongChain && <span className="text-arc-no text-xs">Wrong Network</span>}
        </div>
        <ChevronDown size={13} className={cn("text-arc-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="
          absolute right-0 top-full mt-2 w-64
          bg-arc-elevated border border-arc-border rounded-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.6)]
          z-50 overflow-hidden animate-fade-up
        ">
          {/* Balance */}
          <div className="px-4 py-3 border-b border-arc-border">
            <p className="text-xs text-arc-text-muted mb-1">USDC Balance (Arc Testnet)</p>
            <p className="text-xl font-bold text-arc-text-primary">${usdcBalance}</p>
          </div>

          {/* Actions */}
          <div className="p-2">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-arc-muted text-arc-text-secondary hover:text-arc-text-primary text-sm transition-colors"
              onClick={() => setOpen(false)}
            >
              <Wallet size={14} />
              My Portfolio
            </Link>
            <a
              href={`https://explorer.testnet.arc.xyz/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-arc-muted text-arc-text-secondary hover:text-arc-text-primary text-sm transition-colors"
            >
              <ExternalLink size={14} />
              View on Explorer
            </a>
          </div>

          <div className="p-2 border-t border-arc-border">
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-arc-no/10 text-arc-no text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Search Bar ────────────────────────────────────────────────────────────────

function SearchBar() {
  const { searchQuery, setSearchQuery } = useArcStore();
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn(
      "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
      focused
        ? "border-arc-primary/60 bg-arc-elevated w-72"
        : "border-arc-border bg-arc-surface w-56"
    )}>
      <Search size={14} className={cn("shrink-0 transition-colors", focused ? "text-arc-primary" : "text-arc-text-muted")} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search markets…"
        className="bg-transparent text-sm text-arc-text-primary placeholder:text-arc-text-muted outline-none w-full"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery("")} className="text-arc-text-muted hover:text-arc-text-primary">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useArcStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      scrolled
        ? "bg-arc-bg/90 backdrop-blur-xl border-b border-arc-border shadow-[0_1px_0_rgba(30,45,74,0.6)]"
        : "bg-transparent"
    )}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="
              w-8 h-8 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-arc-primary to-arc-secondary
              shadow-arc-glow
            ">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-bold text-lg text-arc-text-primary tracking-tight">
              Arc<span className="text-arc-primary">Predict</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Markets" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/leaderboard", label: "Leaderboard" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-sm text-arc-text-secondary hover:text-arc-text-primary hover:bg-arc-elevated transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <SearchBar />
            <button className="relative p-2 rounded-lg hover:bg-arc-elevated text-arc-text-muted hover:text-arc-text-primary transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-arc-primary rounded-full" />
            </button>
            <WalletButton />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-arc-elevated text-arc-text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-arc-border bg-arc-bg/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <SearchBar />
            {[
              { href: "/", label: "Markets" },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/leaderboard", label: "Leaderboard" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded-lg text-arc-text-secondary hover:text-arc-text-primary hover:bg-arc-elevated transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
