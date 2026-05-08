import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind Class Merger ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Number Formatters ─────────────────────────────────────────────────────────

export function formatUSDC(value: number, decimals = 2): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatProbability(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatProbabilityInt(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}pp`;
}

export function formatShares(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── Date / Time Formatters ────────────────────────────────────────────────────

export function formatExpiry(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);

  if (days > 30) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor(diff / 60_000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

// ─── Color Helpers ─────────────────────────────────────────────────────────────

export function getProbabilityColor(probability: number): string {
  if (probability >= 0.6) return "text-arc-yes";
  if (probability <= 0.4) return "text-arc-no";
  return "text-arc-warn";
}

export function getChangeColor(change: number): string {
  if (change > 0) return "text-arc-yes";
  if (change < 0) return "text-arc-no";
  return "text-arc-text-secondary";
}

// ─── Price History Generator ───────────────────────────────────────────────────

export function generatePriceHistory(
  startProb: number,
  currentProb: number,
  points: number,
  volatility = 0.04,
  baseVolume = 50_000
): import("../types").PricePoint[] {
  const history: import("../types").PricePoint[] = [];
  const now = Date.now();
  const intervalMs = (24 * 60 * 60 * 1000) / points; // spread over 24h

  let prob = startProb;
  const step = (currentProb - startProb) / points;

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * volatility;
    prob = Math.max(0.02, Math.min(0.98, prob + step + noise));
    history.push({
      timestamp: now - (points - i) * intervalMs,
      yes: parseFloat(prob.toFixed(4)),
      no: parseFloat((1 - prob).toFixed(4)),
      volume: baseVolume * (0.6 + Math.random() * 0.8),
    });
  }

  return history;
}

export function generateMonthlyHistory(
  startProb: number,
  currentProb: number,
  volatility = 0.06,
  baseVolume = 200_000
): import("../types").PricePoint[] {
  return generatePriceHistory(startProb, currentProb, 30, volatility, baseVolume);
}
