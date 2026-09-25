export type VaultAssetChoice = {
  symbol: string;
  name: string;
  mint: string;
  source: "PreStocks" | "xStocks";
  logoSymbol: string;
};

export const VAULT_ASSETS: VaultAssetChoice[] = [
  { symbol: "AAPLx", name: "Apple", mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", source: "xStocks", logoSymbol: "AAPL" },
  { symbol: "NVDAx", name: "NVIDIA", mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", source: "xStocks", logoSymbol: "NVDA" },
  { symbol: "TSLAx", name: "Tesla", mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", source: "xStocks", logoSymbol: "TSLA" },
  { symbol: "MSFTx", name: "Microsoft", mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX", source: "xStocks", logoSymbol: "MSFT" },
  { symbol: "AMZNx", name: "Amazon", mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", source: "xStocks", logoSymbol: "AMZN" },
  { symbol: "OPENAI", name: "OpenAI", mint: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF", source: "PreStocks", logoSymbol: "OPENAI" },
  { symbol: "SPACEX", name: "SpaceX", mint: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh", source: "PreStocks", logoSymbol: "SPACEX" },
  { symbol: "ANTHROPIC", name: "Anthropic", mint: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw", source: "PreStocks", logoSymbol: "ANTHROPIC" },
  { symbol: "ANDURIL", name: "Anduril", mint: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB", source: "PreStocks", logoSymbol: "ANDURIL" },
  { symbol: "FIGUREAI", name: "Figure AI", mint: "PreZad18qfPtbxNpMtMuAuX2zVpvkEU8DnJx56faCWd", source: "PreStocks", logoSymbol: "FIGUREAI" },
];
