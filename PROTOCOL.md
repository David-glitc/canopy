# Canopy protocol blueprint

Canopy turns a stock basket into a collectible, redeemable claim. The card is the interface to the financial position; it is never a detached PFP or a substitute for the underlying assets.

## Core lifecycle

1. **Fund** — a user deposits the settlement asset into a named vault and receives one sealed Share.
2. **Close** — the vault reaches its goal or its deadline. An underfunded vault cancels and refunds every depositor in full.
3. **Buy** — the protocol swaps the funded balance into the vault's signed 2–5 token stock set.
4. **Reveal** — future, auditable entropy assigns every Share a bounded ownership multiplier. The resulting weights are normalized to exactly 100%.
5. **Own** — the holder can keep or trade the Share, or redeem it for its pro-rata stock tokens.

## Economic invariants

- Every active Share owns more than zero of its vault.
- Reveal weights always sum to exactly 100%.
- Expected ownership equals deposit share; reveal variance creates the game without a house edge on allocation.
- Multipliers remain inside the protocol's bounded range.
- Stock purchases complete before reveal, so artwork and metadata derive from realized holdings.
- Capital exits only through a full cancel refund or a pro-rata stock redemption.
- Instant mode is the same protocol with a one-user micro-vault and immediate execution and reveal.

## Identity engine

Each Share combines two independent rarity systems:

- **Economic rarity** follows the Share's revealed percentage of the vault.
- **Cosmetic grade** follows deterministic visual DNA and never changes economic value.

Financial DNA includes realized tokens, basket weights, deposit, ownership share, sector, NAV, and yield. Character and visual DNA assemble the collectible. Historical DNA appends holding time, market events, distributions, and earned badges without rewriting provenance.

The collectible front carries character identity and a compact ownership strip. Its financial back exposes the full token set, weights, NAV, traits, mint provenance, holding history, and redemption state.

## Product rules

- Vault identity includes a name, description, creator, project link, token mints, target weights, goal, minimum deposit, and funding deadline.
- Group vaults are social draws with a shared close and reveal.
- Instant vaults provide the solo path from a small minimum position.
- Automation handles close, basket execution, reveal, and fee distribution. Users sign funding, redemption, and trading actions.
- Art communicates the position. It never implies a better financial result than the onchain claim.

## Current implementation boundary

The deployed Solana demo proves funding, sealed Core assets, bounded non-zero reveal weights, normalization to 100%, refunds, claims, deterministic art, and conditional governance. Vault identity and target token mints are signed onchain as transaction memo data.

The current vault program still settles and redeems in mUSDC. Basket swap execution, custody of constituent stock tokens, in-kind redemption, one-Share-per-wallet enforcement, and creator fee distribution remain protocol work. The interface must keep target allocations separate from realized holdings until those instructions are deployed.
