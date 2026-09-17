# Canopy — collectible claims on tokenized equity

**A technocratic cipher-society for tokenized stocks on Solana.** Fund a Sector → mint a sealed Share → reveal a deterministic operative backed by real assets → govern by market, not by whales. Solo pulls reveal instantly. Chrome, signal, math.

Built for **STOCKLANA** (Solana tokenized-stocks hackathon).

## Demo

- **Live app:** _(Vercel URL after deploy — see Deploy)_
- **Video walkthrough:** _(link after recording — shots below)_
- **Programs (devnet):** `canopy` `9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf` ·
  `canopy-futarchy` `BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k`
- **Faucet:** in-app test funds (10 mUSDC + 0.05 SOL, devnet).

## How it works

1. **Sectors** — permissionless funding cells with goal/deadline/min. Fund to
   mint a sealed Core NFT Share. Close on goal, cancel + refund if short.
2. **Reveal** — slot-hash entropy → deposit-weighted 0.5–2.0× rolls,
   normalized to exactly 1e18 (floor > 0). Rarity follows ownership share.
3. **Governance (futarchy)** — established Sectors are governed by conditional
   PASS/FAIL markets. Proposers bond both sides so a book always exists; the
   time-weighted price decides; silence keeps the status quo. No withdrawals.
4. **Instant** — solo micro-vault ($1.50+) minted + revealed in one tx, 1% to
   treasury. Same engine, zero waiting.
5. **Cards** — deterministic 27-ingredient compositor (pixel bases modeled
   from concept art + vector rarity frames + procedural overlays). Dual
   rarity: economic (chain) + cosmetic (DNA frame).

## Why Solana

Native xStocks (Token-2022 scaled-UI equities) · Metaplex Core single-account
NFTs with enforced plugins · Pyth 24/7 equity marks · Jupiter execution ·
sub-cent fees that make $1.50 pulls real.

## Run it

```bash
# programs
cargo build-sbf
solana program deploy target/deploy/canopy.so --program-id target/deploy/canopy-keypair.json
# scripts (devnet proofs)
node scripts/prove-d2-groves.mjs && node scripts/prove-d3-futarchy.mjs
node scripts/prove-d4-reveal.mjs && node scripts/prove-d5-instant.mjs
# app
pnpm install
pnpm --dir app dev   # http://localhost:3000
```

Env (`app/.env.local`): `FAUCET_KEY_JSON='[...]'` (devnet drip wallet).

## Layout

| Path | What |
|---|---|
| `programs/canopy` | Groves, vaults, Shares, reveal, claim, instant, treasury |
| `programs/canopy-futarchy` | Conditional vault + PASS/FAIL CPMM + TWAP + redeem |
| `packages/card-engine` | DNA → layer spec (tests: `node --test`) |
| `packages/registry` | xStock / mock asset registry |
| `app` | Next.js: landing, Instant, Sectors, card API, faucet |
| `art` | Pixel/vector generators, layers, brand, contact sheets |
| `scripts` | Devnet proofs (each asserts PASS on-chain) |
| `keeper` | Crank scripts (automation batch) |

## Hackathon tracks

- **Main:** consumer stocks app (collectible ownership + 24/7 marks).
- **Pyth:** NAV/marks via `Equity.US.*` + `Crypto.*x/USD` (product-central).
- **PreStocks / Tessera (stretch):** pre-IPO card series via their APIs.

## Video shots (90s)

1. Landing → connect → faucet drip. 2. `/instant`: $2 mint → rip → Legendary →
   claim. 3. `/sectors`: open Sector → fund ×2 → seal → commit → reveal →
   weights Σ 100%. 4. Governance tab: proposal market, PASS price, finalize.
   5. Card metadata/image routes + explorer links. End on doctrine.

## Status & risks

Devnet demo (mock mUSDC/xStocks; Jupiter + real xStocks on mainnet-beta for
the live round). Programs unaudited. BurnV1 close unverified on devnet Core
version (claim ships as mark+pay; re-enable after mainnet verify). xStocks
exclude US persons. Not investment advice; capital at risk.

## License

MIT — see LICENSE.
