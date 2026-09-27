# Stock claims

This document defines Canopy’s intended asset flow for contributors working on contracts, execution and the interface. It is not a description of completed stock settlement.

## Intended asset flow

USDC is the funding currency. The protocol buys the configured stock tokens and holds them in the position’s vault. The NFT represents an ownership claim over those tokens. Redeeming the NFT transfers the underlying tokens to its current owner without liquidating them into USDC.

USD NAV is an estimate of the position’s value. NFT resale price is a separate market price and may be above or below NAV. Neither figure changes the token quantities owed by the position. Tokenized-stock exposure is subject to the token issuer’s terms; it is not automatically direct ownership of company shares.

| Position | Purchase | Redemption |
| --- | --- | --- |
| Custom Instant | Buy the configured basket of 1–5 stocks | Transfer the full personal stock position |
| Mystery Instant | Commit the eligible pool before mint; determine one stock after mint; buy it | Transfer the full position in that stock |
| Group vault | Pool contributions, close funding, buy the basket, assign ownership shares | Transfer the NFT’s share of every basket token |
| Cancelled group vault | No purchase | Refund the funding currency |

An Instant has no shared funding cycle. Its NFT owns 100% of its personal position. A group-vault NFT has a fractional entitlement. The stock draw and ownership allocation are economic mechanisms; cosmetic character generation must not alter either.

## What the interface should show

- Before purchase: funding amount and configured stock targets.
- After purchase: exact token mints, verified held quantities and purchase provenance.
- Position value: an estimated USD NAV, separate from any NFT resale quote.
- Redemption: token symbols and quantities the holder will receive, with USD estimates secondary.
- Legacy test positions: actual mUSDC holdings and a clearly named test-fund recovery action.

Never infer a completed stock purchase from an NFT URI, chosen ticker, logo or price feed. A stock-token balance alone also does not prove the deployed program can redeem it. Purchase verification and redemption support are separate requirements.

## Current implementation

The [Canopy program](../programs/canopy/src/lib.rs) deposits the configured Token-2022 quote mint into a vault. `instant_mint` charges a fee and creates the collectible but executes no stock swap. `claim` pays the recorded quote-token entitlement and requires the original funding wallet. It does not transfer stocks or follow a secondary NFT buyer.

The Instant configuration records custom targets or a mystery pool in the Core NFT URI. The reader resolves a mystery target from the confirmed asset’s DNA. That is target selection, not purchase settlement. Existing completed-slot entropy is not a manipulation-resistant production draw.

The deployed program therefore cannot satisfy the intended stock-claim flow. Renaming its `claim` action to “Redeem stocks” would misrepresent the transaction.

## Required settlement invariants

Before enabling real stock redemption, the contract and executor must enforce:

1. **Committed positions:** validate the eligible mints, allocations, fees, slippage limits and mystery entropy policy before funding can be spent. Preserve mint identities and token-program ownership on chain.
2. **Verified execution:** record purchased token quantities from confirmed swaps. A failed or incomplete purchase cannot produce a position advertised as stock-backed. Specify cancellation and recovery for an unfulfilled Instant.
3. **Current-owner authorization:** check ownership of the correct Core NFT at redemption. The original depositor loses the redemption right when the NFT transfers.
4. **In-kind payout:** transfer the owed quantities of every basket token from authorized vault accounts to the holder’s token accounts. No automatic sale to USDC. Explicitly account for token precision, fees and any funding dust.
5. **Conserved entitlement:** consume each claim exactly once; prevent partial transfers from leaving a reusable full claim. Remaining liabilities must stay fully backed, including after earlier redemptions and any approved rebalance.
6. **Observable results:** expose purchase and redemption signatures, mint addresses and actual quantities. Confirm them before the interface marks a position purchased or redeemed.

The stock-gacha film illustrates this intended model. Its example portfolios do not establish that these settlement invariants are implemented.
