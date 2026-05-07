"use client";
// components/Header.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Wallet, Sun, Moon, ChevronDown, Trophy,
  LayoutDashboard, TrendingUp, X, Zap
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatUSDC, formatAddress } from "@/lib/mockData";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/", label: "Thị trường", icon: TrendingUp },
  { href: "/leaderboard", label: "Bảng xếp hạng", icon: Trophy },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme, isConnected, address, usdcBalance, connectWallet, disconnectWallet } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectWallet();
      toast.success("🔗 Ví đã kết nối thành công!", {
        description: "Bạn đang dùng Arc Testnet • USDC sẵn sàng",
      });
    } catch {
      toast.error("Kết nối thất bại");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletOpen(false);
    toast.info("Đã ngắt kết nối ví");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#050B18]/90 backdrop-blur-xl border-b border-[#1A2F52]/80 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gold-gradient opacity-90" />
                <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-arc-bg font-bold" strokeWidth={3} />
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                <span className="gold-text">Arc</span>
                <span className="text-[var(--text-primary)]">Predict</span>
              </span>
            </Link>

            {/* Nav links - desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === href
                      ? "bg-[#1A2F52] text-gold-300"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#1A2F52]/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#1A2F52] transition-all text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Tìm thị trường...</span>
                <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">⌘K</kbd>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-gold-300 hover:border-gold-400/30 transition-all"
                title="Đổi giao diện"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Wallet */}
              {!isConnected ? (
                <motion.button
                  onClick={handleConnect}
                  disabled={connecting}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-60"
                >
                  <Wallet className="w-4 h-4" />
                  {connecting ? (
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-arc-bg/40 border-t-arc-bg rounded-full animate-spin" />
                      Đang kết nối...
                    </span>
                  ) : (
                    "Kết nối ví"
                  )}
                </motion.button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setWalletOpen(!walletOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-gold-400/30 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-mono text-[var(--text-secondary)]">
                        {formatAddress(address!)}
                      </div>
                      <div className="text-xs font-bold text-gold-300">
                        {formatUSDC(usdcBalance)} USDC
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
                  </button>

                  <AnimatePresence>
                    {walletOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 glass-card p-4 z-50"
                      >
                        <div className="text-xs text-[var(--text-muted)] mb-1">Ví đang kết nối</div>
                        <div className="font-mono text-sm text-[var(--text-secondary)] mb-3 break-all">
                          {address}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] mb-3">
                          <span className="text-sm text-[var(--text-secondary)]">USDC Balance</span>
                          <span className="font-bold text-gold-300">{formatUSDC(usdcBalance)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] mb-3">
                          <span className="text-sm text-[var(--text-secondary)]">Network</span>
                          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Arc Testnet
                          </span>
                        </div>
                        <button
                          onClick={handleDisconnect}
                          className="w-full py-2 rounded-xl text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all"
                        >
                          Ngắt kết nối
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative w-full max-w-2xl glass-card p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[var(--text-muted)]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thị trường: vàng, dầu, bitcoin..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-lg"
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
                </button>
              </div>
              {!searchQuery && (
                <div className="mt-4 text-sm text-[var(--text-muted)] text-center py-4">
                  Nhấn <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] text-xs">ESC</kbd> để đóng
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close wallet dropdown */}
      {walletOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setWalletOpen(false)}
        />
      )}
    </>
  );
}
