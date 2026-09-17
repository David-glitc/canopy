use anchor_lang::prelude::*;

// Grove lifecycle: Funding -> Closed (goal met) -> Revealed
//                          \-> Cancelled (deadline, underfunded)
pub const STATUS_FUNDING: u8 = 0;
pub const STATUS_CLOSED: u8 = 1;
pub const STATUS_CANCELLED: u8 = 2;
pub const STATUS_REVEALED: u8 = 3;

/// Max Shares per Grove: reveal processes every Share in one tx, and each
/// Share needs a (record, asset) account pair within the 64-account limit.
pub const MAX_SHARES: u32 = 20;

// ShareRecord status: Active -> Refunded (cancel) | Claimed (burn + payout)
pub const RECORD_ACTIVE: u8 = 0;
pub const RECORD_REFUNDED: u8 = 1;
pub const RECORD_CLAIMED: u8 = 2;

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

/// Reveal commitment + outcome. Created at close; consumed by reveal.
#[account]
pub struct RevealState {
    pub grove: Pubkey,
    pub close_slot: u64,
    pub seed: [u8; 32],
    pub revealed: bool,
    pub bump: u8,
}

impl RevealState {
    pub const SIZE: usize = 32 + 8 + 32 + 1 + 1;
}

/// Fee treasury (instant-mint cut; pool fee sweep lands here in D5+).
#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub quote_mint: Pubkey,
    pub vault: Pubkey,
    pub bump: u8,
}

impl Treasury {
    pub const SIZE: usize = 32 + 32 + 32 + 1;
}
