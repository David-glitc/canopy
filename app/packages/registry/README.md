# @canopy/registry

Asset registry with two adapters (same shape, selected by network):

- **devnet** — mock Token-2022 `mUSDC` + `mNVDA`/`mTSLA`/`mSPY` for iteration.
  Same token program as real xStocks so program code paths are identical.
- **mainnet-beta** — real USDC + xStocks, filled via `scripts/fetch-xstocks.mjs`.

`NEXT_PUBLIC_CANOPY_NETWORK` selects the adapter. D2 pool vaults settle in the
registry `quote` mint and buy `assets` through the execution path.
