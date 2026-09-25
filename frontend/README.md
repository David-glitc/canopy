# Canopy web app

Canopy turns a private-market thesis into a collectible, verifiable claim on Solana. The app combines live [PreStocks](https://prestocks.com/products) discovery, Pyth equity/token feed context, devnet vaults, deterministic reveal cards, and conditional-market governance.

## Live app

**https://xcanopy.vercel.app**

The `/markets` desk loads the current PreStocks catalog from the official API. Selecting a company carries its symbol, Solana mint, and reference price into a Canopy claim. The Pyth panel resolves the canonical AAPL equity and AAPLx token feeds, reads fully verified Pyth Receiver accounts on Solana, and blocks parity calculations when either update is stale. A Pyth Pro key takes precedence when configured.

All transactions currently settle on Solana devnet using mock mUSDC. The PreStocks reference is preserved in the NFT metadata; the app does not claim that the devnet vault holds the mainnet PreStocks asset.

## Run locally

```bash
pnpm install
pnpm dev
```

Create `.env.local` when server integrations are needed. Wallet connections use Phantom or Solflare directly:

```bash
FAUCET_KEY_JSON='[...]'
PYTH_API_KEY=...
```

`PYTH_PRO_API_KEY` is also accepted. Keep Pyth credentials server-side.

## Validate

```bash
pnpm lint
pnpm build
node --test packages/card-engine/test.mjs
```

The two deployed devnet programs are linked in the site footer.
