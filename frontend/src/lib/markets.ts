export type PreStock = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  contract_address: string;
  markPrice: number;
  markValuation: number;
  tokenPrice: number;
  impliedValuation: number;
  supply: number;
};

export type PythFeed = {
  id: string;
  symbol: string;
  description: string;
  isOpen: boolean;
  price: number | null;
  confidence: number | null;
  publishTime: number | null;
};

export async function getPreStocks(): Promise<PreStock[]> {
  try {
    const response = await fetch("https://prestocks.com/api/prestocks", {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`PreStocks returned ${response.status}`);
    const rows = (await response.json()) as PreStock[];
    return rows.filter((row) => row.symbol && row.contract_address && Number.isFinite(row.tokenPrice));
  } catch {
    return [];
  }
}

type HermesFeed = {
  id: string;
  market_hours?: { is_open?: boolean };
  attributes?: { symbol?: string; description?: string };
};

type HermesPrice = {
  parsed?: Array<{
    price?: { price?: string; conf?: string; expo?: number; publish_time?: number };
  }>;
};

async function getPythFeed(symbol: string): Promise<PythFeed | null> {
  try {
    const query = new URLSearchParams({ query: symbol });
    const metadataResponse = await fetch(`https://hermes.pyth.network/v2/price_feeds?${query}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!metadataResponse.ok) return null;
    const feeds = (await metadataResponse.json()) as HermesFeed[];
    const feed = feeds.find((candidate) => candidate.attributes?.symbol === symbol);
    if (!feed) return null;

    let price: number | null = null;
    let confidence: number | null = null;
    let publishTime: number | null = null;
    const apiKey = process.env.PYTH_API_KEY ?? process.env.PYTH_PRO_API_KEY;
    if (apiKey) {
      const params = new URLSearchParams({ "ids[]": feed.id, parsed: "true" });
      const priceResponse = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params}`, {
        cache: "no-store",
        headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      });
      if (priceResponse.ok) {
        const body = (await priceResponse.json()) as HermesPrice;
        const value = body.parsed?.[0]?.price;
        if (value?.price && typeof value.expo === "number") {
          price = Number(value.price) * 10 ** value.expo;
          confidence = Number(value.conf ?? 0) * 10 ** value.expo;
          publishTime = value.publish_time ?? null;
        }
      }
    }

    return {
      id: feed.id,
      symbol,
      description: feed.attributes?.description ?? symbol,
      isOpen: feed.market_hours?.is_open ?? false,
      price,
      confidence,
      publishTime,
    };
  } catch {
    return null;
  }
}

export async function getPythParity(): Promise<{ underlying: PythFeed | null; token: PythFeed | null }> {
  const [underlying, token] = await Promise.all([
    getPythFeed("Equity.US.AAPL/USD"),
    getPythFeed("Crypto.AAPLX/USD"),
  ]);
  return { underlying, token };
}

export function premium(markPrice: number, tokenPrice: number): number {
  if (!markPrice) return 0;
  return ((tokenPrice - markPrice) / markPrice) * 100;
}

export function compactUsd(value: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
