# Instants and group vaults

An Instant is a personal position with one collectible owning 100% of its vault. It has no group fundraising cycle. A group vault pools several contributors; each collectible receives a share after the funding/reveal cycle.

In the intended protocol, both use USDC to buy stock tokens. Redemption delivers the underlying stock tokens: the entire personal basket for an Instant, or the collectible’s share of each token for a group vault. Dollar amounts display valuation, not a cash-redemption promise. See the [stock-claim model](stock-claims.md) for the current implementation boundary.

## Custom Instant

Choose 1–5 registered stock targets, set percentages totaling exactly 100%, choose the deposit amount, and mint. The NFT URI records the allocation. The displayed dollar splits are targets based on the deposit after its fee, not executed trades.

## Mystery Instant

Choose 2–5 eligible stocks and their draw weights (default: equal odds). These percentages are probabilities, not simultaneous portfolio positions. The NFT URI commits that pool before the transaction is signed. There is no preview draw or pre-mint result.

After the mint confirms, the card reader loads the program-generated DNA from the Core asset, derives a separate stock-draw stream, and selects exactly one stock target with 100% allocation. The result is reproducible across reloads and owners. The reveal shows the selected stock beside the character. Cosmetic generation does not alter the draw.

The pool is encoded in `i=1m&b=...`; a custom allocation uses `i=1c&b=...`. The immutable v1 registry maps compact identifiers to exact stock mint addresses. Never edit or reorder existing v1 entries. Introduce a new registry version for changes. Compact encoding keeps even five positions within the contract's 200-byte URI limit, without mutable browser storage or an external configuration database.

## Execution boundary

The currently deployed contract deposits and redeems mUSDC. A configured or revealed stock is an allocation target until stock purchase support exists. It does not prove the vault holds that stock. The UI lists held balances separately.

The existing instantaneous DNA uses completed-slot entropy. The target is resolved from that minted DNA; this is not a VRF-backed, manipulation-resistant economic draw. A production stock draw needs an appropriate committed entropy/purchase/redemption design before trading real stock exposure. Current redemption also checks the original funding wallet.

Checks: `cd frontend && pnpm exec tsx --test scripts/test-instant-config.ts`.
