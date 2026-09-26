import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGOS: Record<string, string> = {
  AAPL: "/company-logos/AAPL.png",
  AMZN: "/company-logos/AMZN.png",
  MSFT: "/company-logos/MSFT.png",
  NVDA: "/company-logos/NVDA.png",
  TSLA: "/company-logos/TSLA.png",
  ANDURIL: "/company-logos/ANDURIL.png",
  ANTHROPIC: "/company-logos/ANTHROPIC.png",
  FIGUREAI: "/company-logos/FIGUREAI.png",
  KALSHI: "/company-logos/KALSHI.png",
  NEURALINK: "/company-logos/NEURALINK.png",
  OPENAI: "/company-logos/OPENAI.png",
  POLYMARKET: "/company-logos/POLYMARKET.png",
  SPACEX: "/company-logos/SPACEX.png",
  USDC: "/company-logos/USDC.svg",
};

export default function CompanyLogo({
  symbol,
  name,
  className,
}: {
  symbol: string;
  name: string;
  className?: string;
}) {
  const rawKey = symbol.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const key = LOGOS[rawKey] ? rawKey : rawKey.endsWith("X") ? rawKey.slice(0, -1) : rawKey;
  const src = LOGOS[key];

  if (!src) {
    return <span className={cn("company-logo company-logo-fallback", className)} aria-hidden="true">{key.slice(0, 2)}</span>;
  }

  return (
    <span className={cn("company-logo", className)}>
      <Image src={src} alt={`${name} logo`} width={64} height={64} />
    </span>
  );
}
