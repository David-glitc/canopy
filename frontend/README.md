# Canopy web app

The canonical Canopy interface: stock discovery, configurable Instants, group vaults, collectible profiles and procedural card reveals. See the [project README](../README.md) for the protocol model and demo videos.

**USDC funds the purchase; the intended redemption delivers stock tokens.** USD NAV is a valuation. The current devnet implementation still holds and returns test mUSDC, with stock purchases and in-kind redemption pending.

## Run locally

Use Node.js 20.9+ and pnpm 10.25.0. From this directory:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The app defaults to Solana devnet. It can render without a funded faucet wallet; wallet transactions and server integrations need the corresponding configuration.

## Configuration

Set these in `.env.local` or your deployment environment. Never commit credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | Your Dynamic environment; configure allowed origins, email sign-in and Solana wallets in Dynamic |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Browser RPC; defaults to public Solana devnet |
| `SOLANA_DEVNET_RPC_URL` | Server RPC override for the faucet |
| `FAUCET_KEY_JSON` | Server-only JSON secret-key array for a funded devnet faucet wallet |
| `PYTH_API_KEY` or `PYTH_PRO_API_KEY` | Optional server-only Pyth API credential |
| `BLOB_READ_WRITE_TOKEN` | Server-only Vercel Blob token for persistent metadata snapshots |

Use a Dynamic environment you control for your own deployment. Never point the current mUSDC contract setup at mainnet as a shortcut to stock support.

## Main surfaces

| Route | Purpose |
| --- | --- |
| `/` / `/app` | Landing page / app home |
| `/markets` | Stock discovery |
| `/instant` | Configure a personal basket or a post-mint mystery stock target |
| `/sectors` | Shared vaults |
| `/profile` / `/people` | Inventory and collector profiles |
| `/share/[mint]` | Card, actual vault balances and ownership details |
| `/film` | Captioned launch film and vertical download |

Actual token balances and planned allocations are separate data. A target ticker, stock logo or USD quote must never be displayed as proof of an executed purchase. See [stock claims](../docs/stock-claims.md) and [Instant configuration](../docs/instant-modes.md).
