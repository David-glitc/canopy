# Canopy

**Collect stocks like cards.** Canopy is building collectible NFT ownership claims on tokenized stock portfolios on Solana. Fund with USDC, reveal a character, and redeem the underlying stock tokens. The dollar figure is the position’s estimated value; the NFT’s resale price can be higher or lower.

Built for STOCKLANA. [Open the app](https://xcanopy.vercel.app/app) · [Watch the film](https://xcanopy.vercel.app/film)

**Implementation status:** the current devnet contracts hold and return test mUSDC. Stock choices are recorded targets; swaps and stock-token redemption are not implemented. The flow below describes the intended protocol, not a claim that today’s NFTs hold purchased stocks.

## Demo videos

[![Watch the Canopy stock-gacha film](https://34my0igsumg3dye4.public.blob.vercel-storage.com/launch/2026-09-27/stock-gacha-v2/canopy-stock-gacha-poster.jpg)](https://xcanopy.vercel.app/film)

| Video | Watch |
| --- | --- |
| Stock-gacha journey · 60 seconds, narration and music | [Landscape](https://34my0igsumg3dye4.public.blob.vercel-storage.com/launch/2026-09-27/stock-gacha-v2/canopy-stock-gacha.mp4) · [Vertical](https://34my0igsumg3dye4.public.blob.vercel-storage.com/launch/2026-09-27/stock-gacha-v2/canopy-stock-gacha-vertical.mp4) |
| Collectible art edit · 35 seconds, music | [Landscape](https://34my0igsumg3dye4.public.blob.vercel-storage.com/launch/2026-09-27/canopy-launch.mp4) · [Vertical](https://34my0igsumg3dye4.public.blob.vercel-storage.com/launch/2026-09-27/canopy-launch-vertical.mp4) |

These films use illustrative portfolios to explain the product. They are not recordings of completed stock purchases. [English captions](frontend/public/canopy-film.vtt) accompany the journey film.

## Run locally

Use Node.js 20.9+ and pnpm 10.25.0. From the repository root:

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The canonical app lives in `frontend`, not the root Next.js scaffold. See the [frontend setup](frontend/README.md) for Dynamic sign-in, RPC, storage and faucet configuration.

## Instants and vaults

| | Instant | Group vault |
| --- | --- | --- |
| Ownership | One NFT owns 100% of a personal portfolio | Each NFT owns a share of a shared portfolio |
| Stock choice | Custom: 1–5 stocks and allocation weights. Mystery: one stock selected after mint from a committed pool | Creator configures the basket; contributors fund it |
| Timing | No group fundraising cycle | Funding → close → buy → reveal |
| Intended redemption | All stock tokens backing the personal position | The card’s share of each underlying stock token |

For a Mystery Instant, configure eligible stocks and draw odds before signing. The confirmed mint seed determines one stock target; there is no pre-mint draw. Current slot-hash entropy is not production-grade economic randomness. See [Instant modes](docs/instant-modes.md).

### USDC in. Stock tokens out.

```text
USDC deposit → purchase stock tokens → tokens held in vault
                                             │
                                   NFT ownership claim
                                             │
                               redeem underlying tokens
```

USDC funds the purchase. After execution, the portfolio consists of the acquired stock tokens. Redemption transfers those tokens to the NFT holder without selling them for USDC. A cancelled, unpurchased group vault instead refunds its funding currency.

For example, if a vault holds 2 NVDAx and 4 AAPLx, a 10% ownership claim redeems 0.2 NVDAx and 0.4 AAPLx, subject to token precision. USD NAV estimates their value; it does not set a cash payout. Stock-token ownership is also distinct from direct ownership of issuer shares. See the [stock-claim model and implementation boundary](docs/stock-claims.md).

## What exists today

- **Funding and minting:** devnet vaults, Metaplex Core collectibles, reveal, cancellation/refunds and test mUSDC recovery.
- **Instants:** configurable targets and post-mint mystery selection, encoded in the NFT URI. These do not execute purchases.
- **Collectibles:** structured DNA, five character classes, compatible procedural traits, SVG/3D rendering, reveal animations and metadata snapshots. Cosmetic traits do not determine financial entitlement.
- **Collector profiles:** names, bios, featured cards and current NFT inventory, with Dynamic sign-in.
- **Market discovery:** public xStock and PreStocks references, plus Pyth price context. A catalog entry or logo is not evidence of a vault holding.
- **Decision-market prototype:** conditional PASS/FAIL markets and TWAP resolution. Resolving a proposal does not currently execute stock-basket rebalancing.

Stock swaps, in-kind redemption following the NFT’s current owner, and production economic randomness remain required. The existing claim instruction checks the original funder and pays quote tokens; transferring a card does not transfer that legacy withdrawal right. Programs are unaudited. Historical devnet proofs are documented in [DEVELOPMENT.md](DEVELOPMENT.md).

## Repository

| Path | Purpose |
| --- | --- |
| `programs/canopy` | Vault funding, minting, reveal, quote-token claim and treasury |
| `programs/canopy-futarchy` | Conditional markets, TWAP and resolution |
| `frontend` | Next.js app, profiles, markets and card APIs |
| `frontend/src/lib/matter` | DNA, asset registry, scene assembly, SVG/GLB and snapshots |
| `frontend/src/lib/instant-config.ts` | Versioned allocations and deterministic mystery target selection |
| `packages/registry` | Stock and test-token registry |
| `scripts` / `keeper` | Devnet proof scripts and lifecycle automation |
| `brag-output/composition` | Remotion demo and launch-film sources |

Deployed on **Solana devnet**: Canopy `9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf`; decision markets `BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k`.

## License

MIT — see [LICENSE](LICENSE).
