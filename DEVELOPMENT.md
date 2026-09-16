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

## 2026-09-17 — D2: Grove lifecycle proven (devnet, 6/6 PASS)

- `canopy` now: `create_grove` (PDA + PDA-owned Token-2022 vault ATA),
  `deposit` (checked transfer + ShareRecord + sealed Core Share, one tx),
  `close_grove` (goal met), `cancel_grove` (deadline + underfunded),
  `refund` (PDA-signed repay, double-refund guarded).
- Key decisions: **raw `spl-token-2022 v11` + `spl-associated-token-account v8`
  CPIs, not anchor-spl** (2.0-rc pulls a conflicting anchor-lang);
  `no-entrypoint` features fix the SBF global-allocator conflict;
  `transfer_checked` with client-passed decimals (token program enforces);
  no account unpacking (transfer_checked + key checks suffice).
- `scripts/prove-d2-groves.mjs`: Grove A funded 2.5 mUSDC → Closed;
  Grove B expired → Cancelled → refund repaid exactly 0.5 mUSDC →
  double refund rejected. Second depositor funded without faucet
  (SOL + mUSDC from payer).
- Registry live: mock Token-2022 mUSDC/mNVDA/mTSLA/mSPY; payer holds 11M mUSDC.
- Repo: https://github.com/David-glitc/canopy (main, pushed).
