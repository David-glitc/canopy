use anchor_lang::prelude::*;

/// Fixed-point scale for TWAP prices (price of PASS in FAIL terms).
pub const PRICE_SCALE: u128 = 1_000_000_000;
/// Swap fee in basis points (30 = 0.3%). Retained in pool reserves.
pub const FEE_BPS: u64 = 30;
pub const FEE_DENOM: u64 = 10_000;

#[account]
pub struct Market {
    pub grove: Pubkey,
    pub proposal_id: u64,
    pub collateral_mint: Pubkey,
    pub collateral_vault: Pubkey,
    pub pass_mint: Pubkey,
    pub fail_mint: Pubkey,
    pub pass_pool: Pubkey,
    pub fail_pool: Pubkey,
    pub opens_at: i64,
    pub closes_at: i64,
    pub decided: bool,
    pub passed: bool,
    pub pass_reserve: u64,
    pub fail_reserve: u64,
    pub cum_price: u128,
    pub last_crank: i64,
    pub trade_count: u64,
    pub bump: u8,
}

impl Market {
    pub const SIZE: usize = 7 * 32 + 7 * 8 + 16 + 3;
}
