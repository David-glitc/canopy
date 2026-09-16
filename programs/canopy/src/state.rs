use anchor_lang::prelude::*;

// Grove lifecycle: Funding -> Closed (goal met) | Cancelled (deadline, underfunded)
pub const STATUS_FUNDING: u8 = 0;
pub const STATUS_CLOSED: u8 = 1;
pub const STATUS_CANCELLED: u8 = 2;

// ShareRecord status: Active -> Refunded (cancel) | Claimed (D4 claim+burn)
pub const RECORD_ACTIVE: u8 = 0;
pub const RECORD_REFUNDED: u8 = 1;

#[account]
pub struct Config {
    pub authority: Pubkey,
}

impl Config {
    pub const SIZE: usize = 32;
}

#[account]
pub struct Grove {
    pub creator: Pubkey,
    pub nonce: u64,
    pub quote_mint: Pubkey,
    pub vault: Pubkey,
    pub goal: u64,
    pub deadline: i64,
    pub min_deposit: u64,
    pub total_deposited: u64,
    pub share_count: u32,
    pub status: u8,
    pub bump: u8,
}

impl Grove {
    pub const SIZE: usize = 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8 + 4 + 1 + 1;
}

#[account]
pub struct ShareRecord {
    pub grove: Pubkey,
    pub owner: Pubkey,
    pub deposit: u64,
    pub core_asset: Pubkey,
    pub index: u32,
    pub revealed: bool,
    pub weight: u64,
    pub status: u8,
    pub bump: u8,
}

impl ShareRecord {
    pub const SIZE: usize = 32 + 32 + 8 + 32 + 4 + 1 + 8 + 1 + 1;
}
