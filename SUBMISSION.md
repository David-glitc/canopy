# STOCKLANA submission — Canopy

## Project name

Canopy

## One-line pitch

Turn a private-market thesis into a collectible, asset-referenced Solana claim, then coordinate its vault through markets instead of token-weighted voting.

## Description

Canopy is a discovery-to-ownership experience for tokenized equity. Its live market desk loads the official PreStocks catalog, exposes price and valuation context, and lets a user carry a selected company's symbol, Solana mint, and current reference price into a collectible Canopy Share. Each Share is a Metaplex Core asset backed by a devnet vault, with an on-chain deposit weight and deterministic reveal art.

Solo users can mint and reveal instantly from $1.50 of mock mUSDC. Groups can create Sectors with a funding goal, deadline, and minimum deposit; successful Sectors seal, commit entropy, reveal all Shares, and normalize economic weights to exactly 100%. Failed Sectors remain refundable. A second Solana program adds bonded PASS/FAIL conditional markets so allocation proposals resolve from time-weighted market prices rather than raw wallet size.

The Pyth desk resolves `Equity.US.AAPL/USD` beside `Crypto.AAPLX/USD`, displays market-session state, and computes the equity/token spread whenever a server-side Pyth Pro key is available. The interface labels every devnet and reference-data boundary plainly.

## Links

- Live demo: https://xcanopy.vercel.app
- Market desk: https://xcanopy.vercel.app/markets
- Instant claim: https://xcanopy.vercel.app/instant
- GitHub: https://github.com/David-glitc/canopy
- Canopy program: https://explorer.solana.com/address/9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf?cluster=devnet
- Futarchy program: https://explorer.solana.com/address/BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k?cluster=devnet

## Sponsor tracks

### 1. Best Use of PreStocks

PreStocks is the product's private-market discovery layer. Canopy consumes only the official PreStocks pre-IPO catalog, exposes its Solana token addresses and market context, and carries the selected asset into verifiable Share metadata that users can mint and share. No non-PreStocks pre-IPO token is integrated.

### 2. Best use of Pyth market data

Canopy resolves Pyth's canonical Apple equity and AAPLx token feeds together so users can inspect the relationship between an underlying public equity and its on-chain representation. Feed identity and market-session state are live; authenticated price updates drive the parity calculation when a Pyth Pro key is present.

Do not select Tessera, Clawpump, or Meteora: this build does not use Tessera T-Tokens and has not launched the stock-paired mainnet pool required by the latter tracks.

## Judge walkthrough

1. Open `/markets` and inspect the live PreStocks rows.
2. Choose **Mint claim** on OpenAI, SpaceX, or Anthropic.
3. Connect a Solana wallet, enter at least $1.50 mock mUSDC, and mint the claim on devnet.
4. Rip the revealed card and inspect its share/metadata route.
5. Open `/sectors` to inspect pooled funding, seal/reveal, claim/refund, and governance states.
6. Follow the program links in the footer to verify both programs on Solana Explorer.

## Technical proof

- Next.js 16 production build and ESLint pass.
- Seven deterministic card-engine tests pass.
- Both local SBF binaries are byte-for-byte identical to the programs deployed on devnet.
- The public homepage, market desk, instant mint, sector list, and metadata API were probed after deployment.

## Suggested 90-second pitch video

“Private-market products are hard to discover, harder to make social, and almost impossible to coordinate transparently. Canopy turns a market thesis into a collectible claim. Here is the live PreStocks catalog; I can inspect the current reference price and mint address, choose OpenAI, and carry that source data into a devnet Canopy Share. The vault accounting and reveal weight live in this Solana program. A solo claim reveals immediately; a group Sector funds toward a goal, commits entropy, reveals deterministic cards, and preserves refunds if it fails. Then this second program replaces whale voting with bonded PASS/FAIL markets and a time-weighted decision. Pyth resolves the underlying Apple equity beside AAPLx so the same interface can measure on-chain parity. Canopy makes tokenized equities legible, collectible, and governable.”
