// Canopy Asset Registry — massive structure, single source of truth
export const assets = {
  brand: {
    wordmark: "/assets/brand/wordmark.svg",
    markGlow: "/assets/brand/mark-glow.svg",
    mark: "/mark.svg",
    logo: "/logo.svg",
    favicon: "/favicon.svg",
  },
  hero: {
    terminal: "/assets/hero/terminal.svg",
    grid: "/assets/hero/grid.svg",
  },
  icons: {
    fund: "/assets/icons/fund.svg",
    reveal: "/assets/icons/reveal.svg",
    claim: "/assets/icons/claim.svg",
    govern: "/assets/icons/govern.svg",
    solana: "/assets/icons/solana.svg",
  },
  cards: {
    sealed: "/assets/cards/share-sealed.svg",
    revealed: "/assets/cards/share-revealed.svg",
    rarity: {
      common: "/assets/cards/rarity-common.svg",
      rare: "/assets/cards/rarity-rare.svg",
      epic: "/assets/cards/rarity-epic.svg",
      legendary: "/assets/cards/rarity-legendary.svg",
    },
  },
  illustrations: {
    vault: "/assets/illustrations/vault.svg",
    entropy: "/assets/illustrations/entropy.svg",
    market: "/assets/illustrations/market.svg",
  },
  backgrounds: {
    gridDark: "/assets/backgrounds/grid-dark.svg",
  },
  animations: {
    hero: "/assets/animations/hero.json",
  },
} as const;

export const rarityForWeight = (weight: bigint) => {
  const P = 10_000_000_000_000_000n;
  if (weight >= 40n * P) return "legendary" as const;
  if (weight >= 20n * P) return "epic" as const;
  if (weight >= 8n * P) return "rare" as const;
  return "common" as const;
};
