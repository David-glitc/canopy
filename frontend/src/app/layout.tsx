import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://xcanopy.vercel.app"),
  title: {
    default: "Canopy — collectible claims on tokenized equity",
    template: "%s · Canopy",
  },
  description: "Choose a tokenized company, fund a Solana vault, and reveal a collectible claim weighted by your contribution.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Canopy — collectible claims on tokenized equity",
    description: "PreStocks discovery, Pyth market context, and verifiable claims on Solana.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#050505] text-[#F5F7F7]">
        <Providers>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <footer className="site-footer">
            <div className="shell footer-row">
              <div>
                <strong>Canopy</strong>
                <p>Collectible claims on tokenized equity.</p>
              </div>
              <div className="footer-links" aria-label="Protocol links">
                <a href="https://explorer.solana.com/address/9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf?cluster=devnet">Canopy program</a>
                <a href="https://explorer.solana.com/address/BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k?cluster=devnet">Futarchy program</a>
                <Link href="/markets">Market sources</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
