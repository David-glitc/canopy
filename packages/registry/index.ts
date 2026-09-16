import devnet from "./devnet.json" with { type: "json" };
import mainnet from "./mainnet.json" with { type: "json" };

export type RegistryAsset = {
  symbol: string;
  underlying: string;
  mint: string;
  decimals: number;
};

export type Registry = {
  network: string;
  tokenProgram: string;
  quote: RegistryAsset;
  assets: RegistryAsset[];
};

export function getRegistry(network: "devnet" | "mainnet-beta" = "devnet"): Registry {
  return (network === "mainnet-beta" ? mainnet : devnet) as Registry;
}

export function assetMint(registry: Registry, symbol: string): string {
  if (registry.quote.symbol === symbol) return registry.quote.mint;
  const found = registry.assets.find((a) => a.symbol === symbol);
  if (!found) throw new Error(`unknown asset ${symbol} on ${registry.network}`);
  return found.mint;
}
