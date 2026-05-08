import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Markets", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Docs", href: "https://docs.arcpredict.xyz", external: true },
  ],
  Resources: [
    { label: "Arc Testnet", href: "https://arc.xyz", external: true },
    { label: "Faucet", href: "https://faucet.testnet.arc.xyz", external: true },
    { label: "Explorer", href: "https://explorer.testnet.arc.xyz", external: true },
    { label: "API", href: "/api-docs" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-arc-border bg-arc-surface mt-24">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-arc-primary to-arc-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="font-display font-bold text-arc-text-primary">
                Arc<span className="text-arc-primary">Predict</span>
              </span>
            </div>
            <p className="text-sm text-arc-text-muted leading-relaxed mb-4 max-w-[200px]">
              Decentralized prediction markets on Arc Testnet. Trade your beliefs.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: MessageCircle, href: "https://discord.gg", label: "Discord" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg bg-arc-elevated hover:bg-arc-muted text-arc-text-muted hover:text-arc-text-primary transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-arc-text-muted uppercase tracking-wider mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-arc-text-secondary hover:text-arc-primary transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-arc-text-secondary hover:text-arc-primary transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-arc-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-arc-text-muted">
            © {new Date().getFullYear()} ArcPredict. Deployed on Arc Testnet.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-arc-yes animate-pulse" />
            <span className="text-xs text-arc-text-muted">Arc Testnet Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
