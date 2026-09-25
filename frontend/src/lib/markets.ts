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
  isFallback?: boolean;
};

const PRESTOCKS_SNAPSHOT: PreStock[] = [
  { name: "Anduril", symbol: "ANDURIL", description: "", image: "", external_url: "", contract_address: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB", markPrice: 156.53, markValuation: 0, tokenPrice: 162.82, impliedValuation: 144e9, supply: 0, isFallback: true },
  { name: "Anthropic", symbol: "ANTHROPIC", description: "", image: "", external_url: "", contract_address: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw", markPrice: 1056.59, markValuation: 0, tokenPrice: 1081.92, impliedValuation: 1.8e12, supply: 0, isFallback: true },
  { name: "Figure AI", symbol: "FIGUREAI", description: "", image: "", external_url: "", contract_address: "PreZad18qfPtbxNpMtMuAuX2zVpvkEU8DnJx56faCWd", markPrice: 180.2, markValuation: 0, tokenPrice: 175.28, impliedValuation: 38.2e9, supply: 0, isFallback: true },
  { name: "Kalshi", symbol: "KALSHI", description: "", image: "", external_url: "", contract_address: "PreLWGkkeqG1s4HEfFZSy9moCrJ7btsHuUtfcCeoRua", markPrice: 884.72, markValuation: 0, tokenPrice: 879.97, impliedValuation: 32e9, supply: 0, isFallback: true },
  { name: "Neuralink", symbol: "NEURALINK", description: "", image: "", external_url: "", contract_address: "PrekqLJvJ3qVdXmBGDiexvwUTF4rLFDa6HWS4HJbw9S", markPrice: 336.99, markValuation: 0, tokenPrice: 430.72, impliedValuation: 82.1e9, supply: 0, isFallback: true },
  { name: "OpenAI", symbol: "OPENAI", description: "", image: "", external_url: "", contract_address: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF", markPrice: 1024.58, markValuation: 0, tokenPrice: 1318.87, impliedValuation: 1.6e12, supply: 0, isFallback: true },
  { name: "Polymarket", symbol: "POLYMARKET", description: "", image: "", external_url: "", contract_address: "Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP", markPrice: 145.51, markValuation: 0, tokenPrice: 150.69, impliedValuation: 15.7e9, supply: 0, isFallback: true },
  { name: "SpaceX", symbol: "SPACEX", description: "", image: "", external_url: "", contract_address: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh", markPrice: 149.18, markValuation: 0, tokenPrice: 117.94, impliedValuation: 1.5e12, supply: 0, isFallback: true },
];

export type PythFeed = {
  id: string;
  symbol: string;
  description: string;
  isOpen: boolean;
  price: number | null;
  confidence: number | null;
  publishTime: number | null;
  source: "pyth-pro" | "solana-receiver" | "metadata";
  updateAccount: string | null;
  stale: boolean;
};

const PYTH_RECEIVER = "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ";
const SOLANA_MAINNET_RPC = process.env.SOLANA_MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const PRICE_UPDATE_DISCRIMINATOR = "22f123639d7ef4cd";
const FRESH_PRICE_SECONDS = 15 * 60;

// Feed IDs encoded as Solana memcmp values. PriceUpdateV2 stores fully verified
// feed IDs at byte 41: discriminator (8) + authority (32) + enum tag (1).
const RECEIVER_FEED_KEYS: Record<string, string> = {
  "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688":
    "5yixRcKtcs5BZ1K2FsLFwmES1MyA92d6efvijjVevQCw",
  "978e6cc68a119ce066aa830017318563a9ed04ec3a0a6439010fc11296a58675":
    "BCcXNdCSBrdui5TjfYtaJemXQmHxoqP3NBjpd8ncFsd6",
};

export async function getPreStocks(): Promise<PreStock[]> {
  try {
    const response = await fetch("https://prestocks.com/api/prestocks", {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`PreStocks returned ${response.status}`);
    const rows = (await response.json()) as PreStock[];
    return rows
      .filter((row) => row.symbol && row.contract_address && Number.isFinite(row.tokenPrice))
      .map((row) => ({ ...row, isFallback: false }));
  } catch {
    return PRESTOCKS_SNAPSHOT;
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

type ReceiverAccount = {
  pubkey: string;
  account?: { data?: [string, string] };
};

type ReceiverResponse = {
  result?: ReceiverAccount[];
};

type OnchainPrice = {
  price: number;
  confidence: number;
  publishTime: number;
  updateAccount: string;
};

async function getReceiverPrice(feedId: string): Promise<OnchainPrice | null> {
  const encodedFeedId = RECEIVER_FEED_KEYS[feedId];
  if (!encodedFeedId) return null;

  try {
    const response = await fetch(SOLANA_MAINNET_RPC, {
      method: "POST",
      next: { revalidate: 30 },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getProgramAccounts",
        params: [
          PYTH_RECEIVER,
          {
            encoding: "base64",
            filters: [
              { dataSize: 134 },
              { memcmp: { offset: 41, bytes: encodedFeedId } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ReceiverResponse;

    const updates = (body.result ?? []).flatMap((entry) => {
      const encoded = entry.account?.data?.[0];
      if (!encoded) return [];
      const data = Buffer.from(encoded, "base64");
      if (
        data.length !== 134 ||
        data.subarray(0, 8).toString("hex") !== PRICE_UPDATE_DISCRIMINATOR ||
        data[40] !== 1
      ) {
        return [];
      }

      const exponent = data.readInt32LE(89);
      const scale = 10 ** exponent;
      return [{
        price: Number(data.readBigInt64LE(73)) * scale,
        confidence: Number(data.readBigUInt64LE(81)) * scale,
        publishTime: Number(data.readBigInt64LE(93)),
        updateAccount: entry.pubkey,
      }];
    });

    return updates.sort((a, b) => b.publishTime - a.publishTime)[0] ?? null;
  } catch {
    return null;
  }
}

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
    let source: PythFeed["source"] = "metadata";
    let updateAccount: string | null = null;
    const apiKey = process.env.PYTH_API_KEY ?? process.env.PYTH_PRO_API_KEY;
    if (apiKey) {
      const params = new URLSearchParams({ "ids[]": feed.id, parsed: "true" });
      const priceResponse = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params}`, {
        next: { revalidate: 10 },
        headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      });
      if (priceResponse.ok) {
        const body = (await priceResponse.json()) as HermesPrice;
        const value = body.parsed?.[0]?.price;
        if (value?.price && typeof value.expo === "number") {
          price = Number(value.price) * 10 ** value.expo;
          confidence = Number(value.conf ?? 0) * 10 ** value.expo;
          publishTime = value.publish_time ?? null;
          source = "pyth-pro";
        }
      }
    }

    if (price === null) {
      const onchain = await getReceiverPrice(feed.id);
      if (onchain) {
        price = onchain.price;
        confidence = onchain.confidence;
        publishTime = onchain.publishTime;
        updateAccount = onchain.updateAccount;
        source = "solana-receiver";
      }
    }

    const stale = publishTime === null || Date.now() / 1000 - publishTime > FRESH_PRICE_SECONDS;

    return {
      id: feed.id,
      symbol,
      description: feed.attributes?.description ?? symbol,
      isOpen: feed.market_hours?.is_open ?? false,
      price,
      confidence,
      publishTime,
      source,
      updateAccount,
      stale,
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
