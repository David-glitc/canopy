# Canopy — DEVELOPMENT

## 2026-09-17 — D1: repo + toolchain + Core CPI proof (devnet)

- New repo `canopy` (brand per charter). Anchor 1.2.0 workspace (`cargo build-sbf`
  works on stock platform-tools v1.53; the `anchor build` wrapper exits 1 silently —
  bypass via `cargo build-sbf` + `anchor idl build`).
- Programs (devnet):
  - `canopy` `9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf`
  - `canopy_futarchy` `BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k`
- `canopy::mint_share` CPIs to Metaplex Core `CreateV1` (mpl-core Rust 0.12.1,
  unified cleanly with anchor-lang 1.2.0). Config PDA is Core update authority
  and authority of Attributes (sealed, deposit) + Royalties (250bps) +
  FreezeDelegate + BurnDelegate.
- Live proof `scripts/prove-core-mint.mjs`: initialize + mint + read-back,
  **7/7 PASS** on devnet. Example Share
  `EtrkmeThmmPd3539oDtVETu3YKxeyrDHaCogwS7AqjL8`
  (owner=payer, updateAuthority=config PDA `7XwEQdXFXtH8gNxdM87q6Le84ptHfMsdGTSWf6HLbSR5`).
- Notes: UMI `fetchAsset` needs retry (devnet RPC lag vs confirmation);
  `freezeDelegate` contains BigInt (log with a replacer).
- Charter: `/home/david/canopy-charter.md` (sleek rewrite; Tessera corrected to
  pre-IPO/T-tokens; §12 = Core, Bubblegum deferred to Season 2).
