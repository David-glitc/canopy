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

## 2026-09-17 — D3: futarchy sidecar proven (devnet, 3/3 PASS)

- `canopy-futarchy` now: `init_market` (proposer bonds collateral, split to
  PASS+FAIL, seeds CPMM book), `split`/`merge` (1:1 collateral, merge allowed
  post-finalize for pair reclaim), `swap` (CPMM + 30bps fee + TWAP crank),
  `crank` (permissionless), `finalize` (TWAP > 1.0 = PASS; zero trades =
  status quo FAILED), `redeem` (winners burn for 1:1 collateral, open-ended).
- No sweep ix by design: no profit extraction, Grove funds untouched, winner
  redemption never expires. Losers self-clean via direct token burn.
- `scripts/prove-d3-futarchy.mjs`: Market 1 traded → PASS → redeem paid
  exactly 730,236 (500k split + ~230k CPMM buy, as predicted); Market 2
  silent → FAILED. CPMM + TWAP math confirmed on-chain.
- Program: `canopy_futarchy` `BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k`.

## 2026-09-17 — D4: reveal + claim proven (devnet, 13/13 PASS)

- `commit_reveal` snapshots close slot; `reveal` consumes a future slot hash
  (SlotHashes sysvar, manual parse, ID hardcoded from solana-sdk-ids) +
  grove + index + asset via keccak into deposit-weighted 0.5x-2.0x rolls,
  normalized to exactly 1e18 (single-pass max correction, >0 floor), rarity
  from share bands. Records written, Core Attributes flipped to
  revealed/weight/rarity (program-signed UpdatePlugin), Grove → Revealed.
- `claim` pays weight × total / 1e18 in quote, marks shell claimed
  (UpdatePlugin) + record Claimed. Double-claim blocked by status.
- Proven: weights 74/26 → Legendary/Epic, Σ=1e18; payouts exact to the
  lamport (1 lamport dust on 2.5M); shells marked; no regressions.
- **Burn anomaly (devnet Core version skew suspected):** program-as-delegate
  BurnV1 succeeded without closing; direct owner burn errors 0x6 (Incorrect
  account). Create/UpdatePlugin/Attributes/Royalties/Freeze all fine, so
  close-path likely version-related. Claim ships as mark+pay (sound:
  status blocks re-claim); burn re-enabled after mainnet verification.
- No Grove/Record migrations (additive logic only); groves capped at 20
  Shares (single-tx reveal fits 64-account limit).

## 2026-09-17 — D5: instant mint + treasury (devnet, 6/6 PASS)

- `init_treasury` (one-time PDA + quote vault) and `instant_mint`: solo grove
  + net funding + 1% fee to treasury + already-revealed Core Share, one tx.
  Solo weight fixed 1e18 (Legendary); visual DNA rolls from current entropy
  (execution slot unknowable at sign time; simulation cannot preview a future
  slot — documented instant-grade randomness).
- Proven: solo Revealed with net 1.98M, record 100%, Legendary + dna seed,
  treasury +20k, instant claim paid full net. Standard `claim` path works
  unchanged on instant Shares.
- Keeper crank (auto close/commit/reveal) deferred to automation batch;
  manual keeper calls proven via scripts.

## 2026-09-17 — D6: card-engine + layer set + compositor (7/7 tests, visual QA)

- `packages/card-engine` (zero-dep, isomorphic): cyrb53/mulberry32 DNA,
  `traits.json`, `composeCard(seed, economicRarity)` with dual rarity
  (economic from chain + cosmetic DNA-rolled frame). Pool DNA =
  hash(revealSeed || index) (no program change); instant DNA from attribute.
- 27 ingredients, 9 slots: 14 pixel bases (72-96 col posters from
  download.zip refs) + 6 vector rarity frames + seal + 2 sigils +
  procedural wash/vignette/grain/rays/spores. Frames fixed to transparent
  art windows (opaque bg bug caught on first sheet).
- `art/generator/render-card.mjs` (sharp) composites spec → 800×1200 PNG.
  Sample sheet verifies Masterwork/Elite/Mythic/Ascendant end-to-end
  (gems, rays, sigil, holo trim all live). Metadata HTTP route lands with
  the D7 app.

## 2026-09-17 — Brand: black + Solana gradient, cipher mark, cypherpunk lore

- Colors: black `#050505` + Solana green `#14F195` / purple `#9945FF` /
  cyan accent; gradient CTAs, glass panels, mono data type (`brand/tokens.css`).
- Logo: hexagonal seal + canopy chevron + cipher diamond + terminal nodes
  (`brand/mark.svg`, `logo.svg`, `favicon.svg` + PNG exports). Verified render.
- Lore pivot (plants → technocratic cipher-society), zero on-chain changes:
  Grove/Share/Canopy kept as proper nouns; fiction rewritten (Operators,
  Sectors, grown-chrome Series 1 → full-machine Series 2); 20 operative
  roles; 8 sectors; Diamond Roots → Cold Storage. Charter:
  `/home/david/canopy-charter.md`.

## 2026-09-17 — D7 app shell (Next 16 build green)

- `app/` (Next 16.2.10, React 19, Tailwind 4, Solana wallet-adapter):
  black + Solana-gradient system, cipher mark header/footer, wallet connect
  (mount-guarded), live devnet ProgramStatus (slot + program executables +
  explorer links), hero + Sectors/Instant/Shop tracks + Doctrine. `/`
  prerenders clean (SSR-safe).
- Brand assets copied to `app/public` (mark/logo/favicon/touch).
- Surfaces (pools, shop, people, leaderboard, rip ritual, metadata route)
  land incrementally on this shell.

## 2026-09-17 — D7 instant UI + live card routes (8/8 route tests)

- `/instant`: amount → fee preview → wallet signs `instant_mint` (real
  metadata URI at mint) → Rip ritual (sealed → tear → revealed) → claim.
  `lib/canopy-ix.ts` ports the proven ix builders (hardcoded discriminators,
  isomorphic encoders). Rip is CSS ritual v1 (tap-to-tear, flash, stats,
  share, replay).
- `/api/cards/[mint]/{image,metadata}`: UMI Core read + RevealState seed
  (pool) or dna attr (instant) → card-engine → sharp PNG (800×1200) +
  Metaplex JSON. Proven live on devnet for both paths (219KB pool card
  visually verified). Sealed cards 404 image (UI shows CSS seal).
- Noble fix: app pins `@noble/hashes@^1.8.0` (mpl-core needs `./sha3`,
  removed in v2) + `serverExternalPackages` for mpl-core/umi/sharp.

## 2026-09-17 — Sectors surface + faucet (build green, live-proven)

- `/sectors`: on-chain Grove discovery (size-filtered), status/raise/vault/
  deadline cards, inline create form. `/sectors/[address]`: stats, Shares
  gallery (live card images for revealed, sealed pods otherwise), Fund +
  Advance (seal/cancel/commit/reveal/claim/refund paths), My Shares, and a
  read-only Governance tab (proposal markets, PASS price, book, countdown).
- `/api/faucet` (server key, 10 mUSDC + 0.05 SOL, 10-min cooldown):
  proven live (drip confirmed + cooldown enforced). Makes the demo
  self-serve for judges. Needs `FAUCET_KEY_JSON` on deploy.
- `lib/canopy-ix.ts` now covers the full grove lifecycle (builders +
  parsers); `lib/futarchy-read.ts` for market views.

## 2026-09-17 — Ship prep: README, LICENSE, mainnet registry

- Submission README (demo, programs, run, tracks, video shots, risks) +
  MIT LICENSE.
- Mainnet registry filled: 14 xStocks verified on mainnet-beta
  (Token-2022, 8 dec, live supplies: AAPL/NVDA/TSLA/MSFT/SPY/QQQ/GOOGL/
  AMZN/META/COIN/HOOD/PLTR/MSTR/CRCL). Full 877 via fetch-xstocks
  (paginated, case-fixed). Jupiter v6 retired — routability proven at demo
  via Ultra/swap API with small size.
- Faucet topped to ~14 SOL from deployer (280+ drips).
- Vercel: CLI authed but no portable token found; deploy via dashboard
  (import repo → Root Directory `app` → env `FAUCET_KEY_JSON` → deploy).

## 2026-09-17 — Art pipeline proof (download.zip → pixel layers)

- 41 AI concept JPEGs (tree-spirit guardian, obsidian/gold + bronze + emerald
  frames, auras, trait overlays, card back) reviewed; kept as local reference
  only (`download.zip` gitignored, 33MB stays out of the repo).
- `art/generator/pixelate.mjs`: JPEG → 72×108 grid → median → 5-level
  posterize → RLE rect SVG (in-memory) → 800×1200 PNG via resvg + palette
  JSON. `contact-sheet.mjs` tiles for QA.
- First layers: `guardian.png`, `aura.png`, `cardback.png` (~3k rects each).
  Contact sheet confirms authentic chunky pixel-art with palette intact.
- Learnings: use pure renders (no TCG text) for bodies — card chrome
  pixelates to mud; frames go vector (crisp over pixels); aura/back work
  full-bleed. Grid tunable per layer (bodies finer, auras coarser).
