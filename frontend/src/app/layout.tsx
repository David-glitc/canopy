import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://xcanopy.vercel.app"),
  title: {
    default: "Canopy: Tokenized stock collectibles on Solana",
    template: "%s · Canopy",
  },
  description: "Explore tokenized public stocks and PreStocks, then create company-linked Digital Matter on Solana.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Canopy" },
  openGraph: {
    title: "Canopy: Tokenized stock collectibles on Solana",
    description: "Choose a public stock or PreStock and assemble verifiable Digital Matter from on-chain DNA.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17151b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
