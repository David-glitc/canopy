import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Canopy — collectible claims on tokenized equity",
  description:
    "A technocratic cipher-society for tokenized stocks on Solana. Fund Sectors, pull cipher-keys, govern by market. Chrome, signal, math.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-[var(--canopy-line)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-[var(--canopy-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src="/mark.svg" alt="Canopy" width={28} height={28} />
                <span className="font-display font-bold tracking-widest text-[var(--canopy-text)]">
                  CANOPY
                </span>
              </div>
              <p className="font-mono2 text-xs">
                Devnet demo · Not investment advice · Capital at risk
              </p>
              <a
                className="font-mono2 text-xs text-[var(--canopy-green)] hover:underline"
                href="https://github.com/David-glitc/canopy"
                target="_blank"
                rel="noreferrer"
              >
                github.com/David-glitc/canopy
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
