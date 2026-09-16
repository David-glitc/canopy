# Canopy

Collectible claims on tokenized equity — a Solana fork of Sherhood for STOCKLANA.

Fund a **Grove** → mint a sealed **Share** → a futarchy market governs allocation → reveal a layered character card → claim real stock. Solo pulls reveal instantly. The rip is the ritual.

Charter: [`/home/david/canopy-charter.md`](/home/david/canopy-charter.md) (to be moved into `docs/`).

## Layout

| Path | What |
|---|---|
| `programs/canopy` | Core Anchor program: Groves, vaults, Shares, reveal, claim, instant mint |
| `programs/canopy-futarchy` | Sidecar: conditional vault + binary LMSR + TWAP finalize |
| `packages/card-engine` | Deterministic DNA → layer compositor (TS, golden-tested) |
| `packages/canopy-client` | IDL + typed instruction builders + React hooks |
| `packages/registry` | xStock / mock asset registry + Pyth feed ids |
| `app` | Next.js port (Pools · Shop · People · Leaderboard · Lore) |
| `art/generator` | SVG → PNG layer emitter + trait tables |
| `keeper` | Crank: close → execute → reveal → sweep |
| `tests` | Anchor/LiteSVM + e2e |

## Dev

```bash
anchor build
anchor deploy --provider.cluster devnet
cargo test
```

Devnet program IDs: `canopy` `9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf`, `canopy_futarchy` `BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k`.
