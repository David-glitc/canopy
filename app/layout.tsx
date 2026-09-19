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
      <body className="bg-[#111]">
        <div className="scanlines" aria-hidden />
        <div className="noise" aria-hidden />
        <Providers>
          <Header />
          <main className="lg:ml-0">{children}</main>
          <footer className="border-t border-[var(--canopy-line)] bg-[#111]">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 sm:px-6 lg:px-8 py-8 text-sm text-[var(--canopy-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src="/mark.svg" alt="Canopy" width={28} height={28} />
                <span className="font-display font-bold tracking-widest text-[var(--canopy-text)]">CANOPY</span>
                <span className="v2-pill !h-6">devnet</span>
              </div>
              <p className="font-mono2 text-sm">Devnet demo · Not investment advice · Capital at risk</p>
              <a className="font-mono2 text-sm text-[var(--canopy-lime)] no-underline hover:text-white" href="https://github.com/David-glitc/canopy" target="_blank" rel="noreferrer">github.com/David-glitc/canopy</a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
