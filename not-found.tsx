import Link from "next/link";

export default function MarketNotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-black text-zinc-800 mb-4">404</div>
        <h1 className="text-xl font-bold text-zinc-300 mb-2">Market Not Found</h1>
        <p className="text-sm text-zinc-500 mb-6">
          This market doesn't exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors duration-200"
        >
          ← Back to Markets
        </Link>
      </div>
    </main>
  );
}
