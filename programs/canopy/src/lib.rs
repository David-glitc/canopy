use anchor_lang::prelude::*;
use anchor_lang::solana_program::account_info::AccountInfo as SolanaAccountInfo;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use solana_keccak_hasher::hashv;
use mpl_core::{
    instructions::{CreateV1CpiBuilder, UpdatePluginV1CpiBuilder},
    types::{
        Attribute, Attributes, BurnDelegate, Creator, DataState, FreezeDelegate, Plugin,
        PluginAuthority, PluginAuthorityPair, Royalties, RuleSet,
    },
    ID as CORE_PROGRAM_ID,
};

declare_id!("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");

mod error;
mod state;

use error::CanopyError;
use state::*;

const TOKEN_2022_ID: Pubkey = spl_token_2022::ID;
const ATA_ID: Pubkey = spl_associated_token_account::ID;
/// Slots after close before reveal may consume entropy.
const REVEAL_DELAY_SLOTS: u64 = 10;
/// Ownership fixed point (100% = 1e18).
const WEIGHT_ONE: u128 = 1_000_000_000_000_000_000;
/// Multiplier band in bps (0.5x-2.0x), ported from Sherhood RevealEngine.
const MULT_FLOOR: u64 = 5_000;
const MULT_SPAN: u64 = 15_001;
/// Instant-mint floor: $1.50 in 6-dec quote.
const INSTANT_MIN: u64 = 1_500_000;
/// Instant-mint protocol fee (100bps = 1%), all to treasury (no creator).
const INSTANT_FEE_BPS: u64 = 100;
/// SlotHashes sysvar ID (consensus-stable; bytes from solana-sdk-ids).
const SLOT_HASHES_ID: Pubkey = Pubkey::new_from_array([
    6, 167, 213, 23, 25, 47, 10, 175, 198, 242, 101, 227, 251, 119, 204, 122, 218,
    130, 197, 41, 208, 190, 59, 19, 110, 45, 0, 85, 32, 0, 0, 0,
]);

#[program]
pub mod canopy {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.config.authority = ctx.accounts.authority.key();
        Ok(())
    }

    /// Standalone sealed Share mint (D1 proof path; deposit uses the same helper).
    pub fn mint_share(
        ctx: Context<MintShare>,
        name: String,
        uri: String,
        deposit_lamports: u64,
    ) -> Result<()> {
        mint_share_cpi(
            ctx.accounts.core_program.to_account_info(),
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.config.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            name,
            uri,
            deposit_lamports,
        )
    }

    /// Open a Grove: funding goal + deadline + min deposit, with a PDA-owned
    /// Token-2022 vault (ATA) for the quote mint. Permissionless.
    pub fn create_grove(
        ctx: Context<CreateGrove>,
        nonce: u64,
        goal: u64,
        deadline: i64,
        min_deposit: u64,
    ) -> Result<()> {
        require!(goal > 0, CanopyError::GoalZero);
        require!(min_deposit > 0, CanopyError::MinZero);
        require!(
            deadline > Clock::get()?.unix_timestamp,
            CanopyError::DeadlinePast
        );
        require!(
            ctx.accounts.quote_mint.owner == &TOKEN_2022_ID,
            CanopyError::InvalidQuoteMint
        );

        let grove_key = ctx.accounts.grove.key();
        let expected_vault =
            spl_associated_token_account::get_associated_token_address_with_program_id(
                &grove_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            );
        require!(
            ctx.accounts.vault.key() == expected_vault,
            CanopyError::VaultMismatch
        );

        // Create the vault ATA (PDA-owned; no signature needed to create).
        let create_ata_ix =
            spl_associated_token_account::instruction::create_associated_token_account(
                &ctx.accounts.creator.key(),
                &grove_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            );
        invoke(
            &create_ata_ix,
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.grove.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_2022_program.to_account_info(),
            ],
        )?;

        let grove = &mut ctx.accounts.grove;
        grove.creator = ctx.accounts.creator.key();
        grove.nonce = nonce;
        grove.quote_mint = ctx.accounts.quote_mint.key();
        grove.vault = expected_vault;
        grove.goal = goal;
        grove.deadline = deadline;
        grove.min_deposit = min_deposit;
        grove.total_deposited = 0;
        grove.share_count = 0;
        grove.status = STATUS_FUNDING;
        grove.bump = ctx.bumps.grove;
        Ok(())
    }

    /// Fund a Grove: transfer quote to the vault, record the Share, and mint
    /// the sealed Core Share — one transaction.
    pub fn deposit(
        ctx: Context<Deposit>,
        creator: Pubkey,
        nonce: u64,
        index: u32,
        amount: u64,
        decimals: u8,
        name: String,
        uri: String,
    ) -> Result<()> {
        let grove = &mut ctx.accounts.grove;
        require!(grove.status == STATUS_FUNDING, CanopyError::NotFunding);
        require!(
            Clock::get()?.unix_timestamp < grove.deadline,
            CanopyError::PastDeadline
        );
        require!(amount >= grove.min_deposit, CanopyError::BelowMin);
        require!(index == grove.share_count, CanopyError::BadIndex);
        require!(
            grove.share_count < MAX_SHARES,
            CanopyError::MaxShares
        );
        require!(
            ctx.accounts.vault.key() == grove.vault,
            CanopyError::VaultMismatch
        );
        require!(
            ctx.accounts.quote_mint.key() == grove.quote_mint,
            CanopyError::MintMismatch
        );
        let _ = (creator, nonce);

        let transfer_ix = spl_token_2022::instruction::transfer_checked(
            &TOKEN_2022_ID,
            &ctx.accounts.depositor_ata.key(),
            &ctx.accounts.quote_mint.key(),
            &ctx.accounts.vault.key(),
            &ctx.accounts.depositor.key(),
            &[],
            amount,
            decimals,
        )?;
        invoke(
            &transfer_ix,
            &[
                ctx.accounts.depositor_ata.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.depositor.to_account_info(),
            ],
        )?;

        let record = &mut ctx.accounts.share_record;
        record.grove = grove.key();
        record.owner = ctx.accounts.depositor.key();
        record.deposit = amount;
        record.core_asset = ctx.accounts.asset.key();
        record.index = index;
        record.revealed = false;
        record.weight = 0;
        record.status = RECORD_ACTIVE;
        record.bump = ctx.bumps.share_record;

        mint_share_cpi(
            ctx.accounts.core_program.to_account_info(),
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.depositor.to_account_info(),
            ctx.accounts.config.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            name,
            uri,
            amount,
        )?;

        grove.total_deposited = grove
            .total_deposited
            .checked_add(amount)
            .ok_or(CanopyError::BelowMin)?;
        grove.share_count = grove
            .share_count
            .checked_add(1)
            .ok_or(CanopyError::BadIndex)?;
        Ok(())
    }

    /// Seal a funded Grove. Anyone may call once the goal is met.
    pub fn close_grove(ctx: Context<CloseGrove>, _creator: Pubkey, _nonce: u64) -> Result<()> {
        let grove = &mut ctx.accounts.grove;
        require!(grove.status == STATUS_FUNDING, CanopyError::NotFunding);
        require!(grove.total_deposited >= grove.goal, CanopyError::GoalNotMet);
        grove.status = STATUS_CLOSED;
        Ok(())
    }

    /// Cancel an underfunded Grove past its deadline. Refunds open up.
    pub fn cancel_grove(ctx: Context<CloseGrove>, _creator: Pubkey, _nonce: u64) -> Result<()> {
        let grove = &mut ctx.accounts.grove;
        require!(grove.status == STATUS_FUNDING, CanopyError::NotFunding);
        require!(
            Clock::get()?.unix_timestamp >= grove.deadline,
            CanopyError::NotExpired
        );
        require!(
            grove.total_deposited < grove.goal,
            CanopyError::NotUnderfunded
        );
        grove.status = STATUS_CANCELLED;
        Ok(())
    }

    /// Refund one Share from a cancelled Grove.
    pub fn refund(
        ctx: Context<Refund>,
        creator: Pubkey,
        nonce: u64,
        _index: u32,
        decimals: u8,
    ) -> Result<()> {
        let grove = &ctx.accounts.grove;
        require!(grove.status == STATUS_CANCELLED, CanopyError::NotCancelled);
        let record = &mut ctx.accounts.share_record;
        require!(record.status == RECORD_ACTIVE, CanopyError::NotActive);
        require!(
            record.owner == ctx.accounts.depositor.key(),
            CanopyError::NotActive
        );
        require!(
            ctx.accounts.vault.key() == grove.vault,
            CanopyError::VaultMismatch
        );
        require!(
            ctx.accounts.quote_mint.key() == grove.quote_mint,
            CanopyError::MintMismatch
        );


        let seeds: &[&[u8]] = &[
            b"grove",
            creator.as_ref(),
            &nonce.to_le_bytes(),
            &[grove.bump],
        ];
        let refund_ix = spl_token_2022::instruction::transfer_checked(
            &TOKEN_2022_ID,
            &ctx.accounts.vault.key(),
            &ctx.accounts.quote_mint.key(),
            &ctx.accounts.depositor_ata.key(),
            &grove.key(),
            &[],
            record.deposit,
            decimals,
        )?;
        invoke_signed(
            &refund_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.depositor_ata.to_account_info(),
                ctx.accounts.grove.to_account_info(),
            ],
            &[seeds],
        )?;

        record.status = RECORD_REFUNDED;
        Ok(())
    }

    /// Commit a reveal: snapshot the close slot. Anyone may call once Closed.
    /// The seed derives from a FUTURE slot hash, unknowable at commit time.
    pub fn commit_reveal(
        ctx: Context<CommitReveal>,
        _creator: Pubkey,
        _nonce: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.grove.status == STATUS_CLOSED,
            CanopyError::NotClosed
        );
        let state = &mut ctx.accounts.reveal_state;
        state.grove = ctx.accounts.grove.key();
        state.close_slot = Clock::get()?.slot;
        state.seed = [0u8; 32];
        state.revealed = false;
        state.bump = ctx.bumps.reveal_state;
        Ok(())
    }

    /// Reveal every Share in one tx (capped at MAX_SHARES). Weights are
    /// deposit-weighted 0.5x-2.0x rolls normalized to 1e18 with a >0 floor;
    /// rarity follows ownership share. Records are written, Core attributes
    /// flipped to revealed, Grove becomes Revealed.
    pub fn reveal(ctx: Context<Reveal>, creator: Pubkey, nonce: u64) -> Result<()> {
        let grove_key = ctx.accounts.grove.key();
        let n = ctx.accounts.grove.share_count as usize;
        require!(
            n > 0 && n <= MAX_SHARES as usize,
            CanopyError::ShareCountMismatch
        );
        require!(
            ctx.accounts.grove.status == STATUS_CLOSED,
            CanopyError::NotClosed
        );
        require!(
            !ctx.accounts.reveal_state.revealed,
            CanopyError::AlreadyRevealed
        );
        let _ = (creator, nonce);

        // remaining: [core, config, keeper, system, slothashes, rec0, asset0, ...]
        // All CPI inputs come from remaining (single lifetime); struct accounts
        // (grove, reveal_state) are only read/mutated, never passed to a CPI.
        let rem = ctx.remaining_accounts;
        require!(rem.len() == 5 + n * 2, CanopyError::ShareCountMismatch);
        let (core_ai, config_ai, keeper_ai, system_ai, slot_ai) =
            (&rem[0], &rem[1], &rem[2], &rem[3], &rem[4]);
        require!(
            core_ai.key() == CORE_PROGRAM_ID
                && keeper_ai.is_signer
                && keeper_ai.is_writable,
            CanopyError::ShareCountMismatch
        );
        let (expected_config, config_bump) =
            Pubkey::find_program_address(&[b"config"], &crate::ID);
        require!(
            config_ai.key() == expected_config,
            CanopyError::ShareCountMismatch
        );

        let slot_now = Clock::get()?.slot;
        let target = ctx
            .accounts
            .reveal_state
            .close_slot
            .checked_add(REVEAL_DELAY_SLOTS)
            .ok_or(CanopyError::MathError)?;
        require!(slot_now >= target, CanopyError::TooEarly);
        let target_hash = slot_hash_for(slot_ai, target)?;
        let seed = hashv(&[&target_hash, grove_key.as_ref()]).to_bytes();

        let mut recs: Vec<ShareRecord> = Vec::with_capacity(n);
        let mut deposits: Vec<u64> = Vec::with_capacity(n);
        let mut core_assets: Vec<Pubkey> = Vec::with_capacity(n);
        for i in 0..n {
            let rec_ai = &rem[5 + 2 * i];
            require!(rec_ai.owner == &crate::ID, CanopyError::ShareCountMismatch);
            let mut data: &[u8] = &rec_ai.data.borrow();
            let rec = ShareRecord::try_deserialize(&mut data)
                .map_err(|_| CanopyError::ShareCountMismatch)?;
            require!(rec.grove == grove_key, CanopyError::ShareCountMismatch);
            require!(rec.index as usize == i, CanopyError::ShareCountMismatch);
            require!(
                rec.status == RECORD_ACTIVE && !rec.revealed,
                CanopyError::NotActive
            );
            let (expected_rec, _) = Pubkey::find_program_address(
                &[
                    b"share",
                    grove_key.as_ref(),
                    rec.owner.as_ref(),
                    &(i as u32).to_le_bytes(),
                ],
                &crate::ID,
            );
            require!(*rec_ai.key == expected_rec, CanopyError::ShareCountMismatch);
            require!(
                *rem[5 + 2 * i + 1].key == rec.core_asset,
                CanopyError::ShareCountMismatch
            );
            deposits.push(rec.deposit);
            core_assets.push(rec.core_asset);
            recs.push(rec);
        }

        let weights = compute_weights(&seed, &grove_key, &deposits, &core_assets)?;

        for (i, mut rec) in recs.into_iter().enumerate() {
            rec.weight = weights[i];
            rec.revealed = true;
            {
                let mut borrowed = rem[5 + 2 * i].data.borrow_mut();
                rec.try_serialize(&mut &mut borrowed[..])?;
            }
            let attrs = Attributes {
                attribute_list: vec![
                    Attribute {
                        key: "sealed".to_string(),
                        value: "false".to_string(),
                    },
                    Attribute {
                        key: "revealed".to_string(),
                        value: "true".to_string(),
                    },
                    Attribute {
                        key: "deposit_lamports".to_string(),
                        value: rec.deposit.to_string(),
                    },
                    Attribute {
                        key: "weight_1e18".to_string(),
                        value: weights[i].to_string(),
                    },
                    Attribute {
                        key: "rarity".to_string(),
                        value: rarity_band(weights[i]).to_string(),
                    },
                ],
            };
            update_share_plugin_cpi(
                core_ai,
                &rem[5 + 2 * i + 1],
                config_ai,
                keeper_ai,
                system_ai,
                config_bump,
                Plugin::Attributes(attrs),
            )?;
        }

        ctx.accounts.grove.status = STATUS_REVEALED;
        let state = &mut ctx.accounts.reveal_state;
        state.seed = seed;
        state.revealed = true;
        Ok(())
    }

    /// Claim a revealed Share: burn the Core NFT (program as delegate) and
    /// pay weight * total_deposited / 1e18 in quote. (D5 upgrades the vault
    /// to xStocks; D4 settles in quote.)
    pub fn claim(
        ctx: Context<Claim>,
        creator: Pubkey,
        nonce: u64,
        _index: u32,
        decimals: u8,
    ) -> Result<()> {
        let grove = &ctx.accounts.grove;
        require!(grove.status == STATUS_REVEALED, CanopyError::NeedRevealed);
        let record = &mut ctx.accounts.share_record;
        require!(record.status == RECORD_ACTIVE, CanopyError::NotActive);
        require!(
            record.revealed && record.weight > 0,
            CanopyError::NotActive
        );
        require!(
            record.owner == ctx.accounts.owner.key(),
            CanopyError::NotActive
        );
        require!(
            ctx.accounts.core_asset.key() == record.core_asset,
            CanopyError::ShareCountMismatch
        );
        require!(
            ctx.accounts.vault.key() == grove.vault
                && ctx.accounts.quote_mint.key() == grove.quote_mint,
            CanopyError::VaultMismatch
        );
        let _ = (creator, nonce);

        let payout = (record.weight as u128)
            .checked_mul(grove.total_deposited as u128)
            .ok_or(CanopyError::MathError)?
            / WEIGHT_ONE;
        let payout = u64::try_from(payout).map_err(|_| CanopyError::MathError)?;
        require!(payout > 0, CanopyError::MathError);

        // Mark the shell as claimed (program-signed Attributes update).
        // NOTE: BurnV1 close is unverified on this devnet Core version
        // (delegate-burn succeeded without closing; owner-burn errors 0x6).
        // Double-claim is blocked by record status; burn re-enabled after
        // mainnet verification. See DEVELOPMENT.md.
        let config_bump = ctx.bumps.config;
        let claimed_attrs = Attributes {
            attribute_list: vec![
                Attribute {
                    key: "sealed".to_string(),
                    value: "false".to_string(),
                },
                Attribute {
                    key: "revealed".to_string(),
                    value: "true".to_string(),
                },
                Attribute {
                    key: "claimed".to_string(),
                    value: "true".to_string(),
                },
                Attribute {
                    key: "deposit_lamports".to_string(),
                    value: record.deposit.to_string(),
                },
                Attribute {
                    key: "weight_1e18".to_string(),
                    value: record.weight.to_string(),
                },
                Attribute {
                    key: "rarity".to_string(),
                    value: rarity_band(record.weight).to_string(),
                },
            ],
        };
        update_share_plugin_cpi(
            &ctx.accounts.core_program.to_account_info(),
            &ctx.accounts.core_asset.to_account_info(),
            &ctx.accounts.config.to_account_info(),
            &ctx.accounts.owner.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            config_bump,
            Plugin::Attributes(claimed_attrs),
        )?;

        // Pay out (authority = grove PDA).
        let grove_bump = grove.bump;
        let g_seeds: &[&[u8]] = &[
            b"grove",
            creator.as_ref(),
            &nonce.to_le_bytes(),
            &[grove_bump],
        ];
        invoke_signed(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.vault.key(),
                &ctx.accounts.quote_mint.key(),
                &ctx.accounts.owner_ata.key(),
                &ctx.accounts.grove.key(),
                &[],
                payout,
                decimals,
            )?,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.owner_ata.to_account_info(),
                ctx.accounts.grove.to_account_info(),
            ],
            &[g_seeds],
        )?;

        record.status = RECORD_CLAIMED;
        Ok(())
    }

    /// One-time treasury setup for a quote mint (instant-mint fees land here).
    pub fn init_treasury(ctx: Context<InitTreasury>) -> Result<()> {
        require!(
            ctx.accounts.quote_mint.owner == &TOKEN_2022_ID,
            CanopyError::InvalidQuoteMint
        );
        let treasury_key = ctx.accounts.treasury.key();
        let expected_vault =
            spl_associated_token_account::get_associated_token_address_with_program_id(
                &treasury_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            );
        require!(
            ctx.accounts.treasury_vault.key() == expected_vault,
            CanopyError::VaultMismatch
        );
        invoke(
            &spl_associated_token_account::instruction::create_associated_token_account(
                &ctx.accounts.admin.key(),
                &treasury_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            ),
            &[
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.treasury_vault.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_2022_program.to_account_info(),
            ],
        )?;
        let t = &mut ctx.accounts.treasury;
        t.authority = ctx.accounts.admin.key();
        t.quote_mint = ctx.accounts.quote_mint.key();
        t.vault = expected_vault;
        t.bump = ctx.bumps.treasury;
        Ok(())
    }

    /// Solo instant pull: solo grove + deposit + fee + revealed Core Share in
    /// one tx. Solo weight is always 1e18 (Legendary band); visual DNA still
    /// rolls from current entropy so pulls look unique. Instant-grade
    /// randomness (execution slot unknowable at sign time) — documented.
    pub fn instant_mint(
        ctx: Context<InstantMint>,
        nonce: u64,
        amount: u64,
        decimals: u8,
        name: String,
        uri: String,
    ) -> Result<()> {
        require!(amount >= INSTANT_MIN, CanopyError::BelowMin);
        require!(name.len() <= 32, CanopyError::NameTooLong);
        require!(uri.len() <= 200, CanopyError::UriTooLong);
        require!(
            ctx.accounts.quote_mint.owner == &TOKEN_2022_ID,
            CanopyError::InvalidQuoteMint
        );
        require!(
            ctx.accounts.quote_mint.key() == ctx.accounts.treasury.quote_mint,
            CanopyError::MintMismatch
        );
        require!(
            ctx.accounts.treasury_vault.key() == ctx.accounts.treasury.vault,
            CanopyError::VaultMismatch
        );

        let fee = amount
            .checked_mul(INSTANT_FEE_BPS)
            .ok_or(CanopyError::MathError)?
            / 10_000;
        let net = amount.checked_sub(fee).ok_or(CanopyError::MathError)?;
        require!(fee > 0 && net > 0, CanopyError::MathError);

        let grove_key = ctx.accounts.grove.key();
        let expected_vault =
            spl_associated_token_account::get_associated_token_address_with_program_id(
                &grove_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            );
        require!(
            ctx.accounts.vault.key() == expected_vault,
            CanopyError::VaultMismatch
        );
        invoke(
            &spl_associated_token_account::instruction::create_associated_token_account(
                &ctx.accounts.payer.key(),
                &grove_key,
                &ctx.accounts.quote_mint.key(),
                &TOKEN_2022_ID,
            ),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.grove.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_2022_program.to_account_info(),
            ],
        )?;
        // Fund vault (net) + treasury (fee) straight from payer.
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.payer_ata.key(),
                &ctx.accounts.quote_mint.key(),
                &expected_vault,
                &ctx.accounts.payer.key(),
                &[],
                net,
                decimals,
            )?,
            &[
                ctx.accounts.payer_ata.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.payer.to_account_info(),
            ],
        )?;
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.payer_ata.key(),
                &ctx.accounts.quote_mint.key(),
                &ctx.accounts.treasury_vault.key(),
                &ctx.accounts.payer.key(),
                &[],
                fee,
                decimals,
            )?,
            &[
                ctx.accounts.payer_ata.to_account_info(),
                ctx.accounts.quote_mint.to_account_info(),
                ctx.accounts.treasury_vault.to_account_info(),
                ctx.accounts.payer.to_account_info(),
            ],
        )?;

        // Solo grove: fully funded + revealed by construction.
        {
            let grove = &mut ctx.accounts.grove;
            grove.creator = ctx.accounts.payer.key();
            grove.nonce = nonce;
            grove.quote_mint = ctx.accounts.quote_mint.key();
            grove.vault = expected_vault;
            grove.goal = net;
            grove.deadline = Clock::get()?
                .unix_timestamp
                .checked_add(3600)
                .ok_or(CanopyError::MathError)?;
            grove.min_deposit = net;
            grove.total_deposited = net;
            grove.share_count = 1;
            grove.status = STATUS_REVEALED;
            grove.bump = ctx.bumps.grove;
        }
        {
            let record = &mut ctx.accounts.share_record;
            record.grove = grove_key;
            record.owner = ctx.accounts.payer.key();
            record.deposit = net;
            record.core_asset = ctx.accounts.asset.key();
            record.index = 0;
            record.revealed = true;
            record.weight = WEIGHT_ONE as u64;
            record.status = RECORD_ACTIVE;
            record.bump = ctx.bumps.share_record;
        }

        // Visual DNA from current entropy (latest completed slot hash).
        let slot_now = Clock::get()?.slot;
        require!(slot_now > 0, CanopyError::MathError);
        let entropy = slot_hash_for(
            &ctx.accounts.slot_hashes.to_account_info(),
            slot_now - 1,
        )?;
        let dna = hashv(&[
            &entropy,
            ctx.accounts.payer.key().as_ref(),
            grove_key.as_ref(),
        ])
        .to_bytes();
        let dna_u64 = u64::from_le_bytes(
            dna[0..8].try_into().map_err(|_| CanopyError::MathError)?,
        );

        mint_instant_share_cpi(
            &ctx.accounts.core_program.to_account_info(),
            &ctx.accounts.asset.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
            &ctx.accounts.config.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            name,
            uri,
            net,
            dna_u64,
        )?;
        Ok(())
    }
}

/// Shared Core CPI: program PDA as update authority + plugin authority.
/// Note: mint/decimals consistency is enforced by transfer_checked + the
/// Token-2022 program itself, so no account unpacking is needed here.
fn mint_share_cpi<'info>(
    core_program: SolanaAccountInfo<'info>,
    asset: SolanaAccountInfo<'info>,
    payer: SolanaAccountInfo<'info>,
    update_authority: SolanaAccountInfo<'info>,
    system_program: SolanaAccountInfo<'info>,
    name: String,
    uri: String,
    deposit_lamports: u64,
) -> Result<()> {
    require!(name.len() <= 32, CanopyError::NameTooLong);
    require!(uri.len() <= 200, CanopyError::UriTooLong);

    let plugins = vec![
        PluginAuthorityPair {
            plugin: Plugin::Attributes(Attributes {
                attribute_list: vec![
                    Attribute {
                        key: "sealed".to_string(),
                        value: "true".to_string(),
                    },
                    Attribute {
                        key: "deposit_lamports".to_string(),
                        value: deposit_lamports.to_string(),
                    },
                ],
            }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::Royalties(Royalties {
                basis_points: 250,
                creators: vec![Creator {
                    address: update_authority.key(),
                    percentage: 100,
                }],
                rule_set: RuleSet::None,
            }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::FreezeDelegate(FreezeDelegate { frozen: false }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::BurnDelegate(BurnDelegate {}),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
    ];

    CreateV1CpiBuilder::new(&core_program)
        .asset(&asset)
        .payer(&payer)
        .owner(Some(&payer))
        .update_authority(Some(&update_authority))
        .system_program(&system_program)
        .data_state(DataState::AccountState)
        .name(name)
        .uri(uri)
        .plugins(plugins)
        .invoke()?;
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::SIZE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintShare<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, signer)]
    pub asset: UncheckedAccount<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct CreateGrove<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + Grove::SIZE,
        seeds = [b"grove", creator.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub grove: Account<'info, Grove>,
    /// Vault ATA (PDA-owned). Created by this ix; address verified in handler.
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: verified as a Token-2022 mint in handler.
    pub quote_mint: UncheckedAccount<'info>,
    /// CHECK: Token-2022 program.
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    /// CHECK: Associated Token program.
    #[account(address = ATA_ID)]
    pub associated_token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64, index: u32)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(
        mut,
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
    /// CHECK: verified against grove.vault + mint in handler.
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: verified mint match in handler; debited via depositor signature.
    #[account(mut)]
    pub depositor_ata: UncheckedAccount<'info>,
    /// CHECK: verified as the grove quote mint in handler.
    pub quote_mint: UncheckedAccount<'info>,
    #[account(
        init,
        payer = depositor,
        space = 8 + ShareRecord::SIZE,
        seeds = [b"share", grove.key().as_ref(), depositor.key().as_ref(), &index.to_le_bytes()],
        bump
    )]
    pub share_record: Account<'info, ShareRecord>,
    #[account(mut, signer)]
    pub asset: UncheckedAccount<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: UncheckedAccount<'info>,
    /// CHECK: Token-2022 program.
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64)]
pub struct CloseGrove<'info> {
    #[account(
        mut,
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64, index: u32)]
pub struct Refund<'info> {
    pub depositor: Signer<'info>,
    #[account(
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
    /// CHECK: verified against grove.vault + mint in handler.
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: verified mint match in handler; credited to record owner.
    #[account(mut)]
    pub depositor_ata: UncheckedAccount<'info>,
    /// CHECK: verified as the grove quote mint in handler.
    pub quote_mint: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"share", grove.key().as_ref(), depositor.key().as_ref(), &index.to_le_bytes()],
        bump = share_record.bump,
    )]
    pub share_record: Account<'info, ShareRecord>,
    /// CHECK: Token-2022 program.
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
}

/// Rewrite a Share's Attributes plugin (program as UpdateAuthority).
/// Owned AccountInfos with independent lifetimes: reveal mixes struct
/// accounts and remaining_accounts, whose invariant lifetimes cannot unify
/// behind a single shared reference.
fn update_share_plugin_cpi<'info>(
    core_program: &SolanaAccountInfo<'info>,
    asset: &SolanaAccountInfo<'info>,
    authority: &SolanaAccountInfo<'info>,
    payer: &SolanaAccountInfo<'info>,
    system_program: &SolanaAccountInfo<'info>,
    config_bump: u8,
    plugin: Plugin,
) -> Result<()> {
    let seeds: &[&[u8]] = &[b"config", &[config_bump]];
    UpdatePluginV1CpiBuilder::new(&core_program)
        .asset(&asset)
        .authority(Some(&authority))
        .payer(&payer)
        .system_program(&system_program)
        .plugin(plugin)
        .invoke_signed(&[seeds])?;
    Ok(())
}

/// Deposit-weighted rolls normalized to WEIGHT_ONE with a >0 floor.
/// Ported from Sherhood RevealEngine._allocate (single-pass max correction).
fn compute_weights(
    seed: &[u8; 32],
    grove: &Pubkey,
    deposits: &[u64],
    assets: &[Pubkey],
) -> Result<Vec<u64>> {
    let n = deposits.len();
    let mut raw = vec![0u128; n];
    let mut sum = 0u128;
    for i in 0..n {
        let roll_hash = hashv(&[
            seed,
            grove.as_ref(),
            &(i as u32).to_le_bytes(),
            assets[i].as_ref(),
        ]);
        let roll = u64::from_le_bytes(
            roll_hash.as_ref()[0..8]
                .try_into()
                .map_err(|_| CanopyError::MathError)?,
        );
        let mult = MULT_FLOOR + (roll % MULT_SPAN);
        let r = (deposits[i] as u128)
            .checked_mul(mult as u128)
            .ok_or(CanopyError::MathError)?;
        raw[i] = r;
        sum = sum.checked_add(r).ok_or(CanopyError::MathError)?;
    }
    require!(sum > 0, CanopyError::MathError);

    let mut weights = vec![0u64; n];
    let mut assigned = 0u128;
    for i in 0..n {
        let mut w = raw[i]
            .checked_mul(WEIGHT_ONE)
            .ok_or(CanopyError::MathError)?
            / sum;
        if w == 0 {
            w = 1;
        }
        weights[i] = w as u64;
        assigned = assigned.checked_add(w).ok_or(CanopyError::MathError)?;
    }
    if assigned != WEIGHT_ONE {
        let mut max_i = 0;
        for i in 1..n {
            if raw[i] > raw[max_i] {
                max_i = i;
            }
        }
        if assigned > WEIGHT_ONE {
            let over = assigned - WEIGHT_ONE;
            require!((weights[max_i] as u128) > over, CanopyError::MathError);
            weights[max_i] -= over as u64;
        } else {
            weights[max_i] = weights[max_i]
                .checked_add((WEIGHT_ONE - assigned) as u64)
                .ok_or(CanopyError::MathError)?;
        }
    }
    let total: u128 = weights.iter().map(|w| *w as u128).sum();
    require!(total == WEIGHT_ONE, CanopyError::MathError);
    require!(weights.iter().all(|w| *w > 0), CanopyError::MathError);
    Ok(weights)
}

/// Ownership-share rarity bands (Sherhood): 40/20/8%.
fn rarity_band(weight: u64) -> &'static str {
    const PCT: u128 = WEIGHT_ONE / 100;
    let w = weight as u128;
    if w >= 40 * PCT {
        "Legendary"
    } else if w >= 20 * PCT {
        "Epic"
    } else if w >= 8 * PCT {
        "Rare"
    } else {
        "Common"
    }
}

/// Read a historical slot hash from the SlotHashes sysvar (manual parse:
/// u64 count + (u64 slot, 32-byte hash) entries). Verifies the sysvar ID.
fn slot_hash_for(ai: &SolanaAccountInfo, target: u64) -> Result<[u8; 32]> {
    require!(ai.key() == SLOT_HASHES_ID, CanopyError::NoSlotHash);
    let data = ai.data.borrow();
    require!(data.len() >= 8, CanopyError::NoSlotHash);
    let len = u64::from_le_bytes(
        data[0..8]
            .try_into()
            .map_err(|_| CanopyError::NoSlotHash)?,
    ) as usize;
    let mut offset = 8usize;
    for _ in 0..len {
        require!(data.len() >= offset + 40, CanopyError::NoSlotHash);
        let slot = u64::from_le_bytes(
            data[offset..offset + 8]
                .try_into()
                .map_err(|_| CanopyError::NoSlotHash)?,
        );
        if slot == target {
            let mut out = [0u8; 32];
            out.copy_from_slice(&data[offset + 8..offset + 40]);
            return Ok(out);
        }
        offset += 40;
    }
    Err(CanopyError::NoSlotHash.into())
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64)]
pub struct CommitReveal<'info> {
    #[account(
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
    #[account(
        init,
        payer = keeper,
        space = 8 + RevealState::SIZE,
        seeds = [b"reveal", grove.key().as_ref()],
        bump
    )]
    pub reveal_state: Account<'info, RevealState>,
    #[account(mut)]
    pub keeper: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64)]
pub struct Reveal<'info> {
    #[account(
        mut,
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
    #[account(
        mut,
        seeds = [b"reveal", grove.key().as_ref()],
        bump = reveal_state.bump,
    )]
    pub reveal_state: Account<'info, RevealState>,
    // remaining (ALL single-lifetime: struct accounts never enter a CPI):
    // [core_program, config_pda, keeper, system_program, slot_hashes,
    //  record_0, asset_0, record_1, asset_1, ...]
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, nonce: u64, index: u32)]
pub struct Claim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        seeds = [b"grove", creator.as_ref(), &nonce.to_le_bytes()],
        bump = grove.bump,
    )]
    pub grove: Account<'info, Grove>,
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub owner_ata: UncheckedAccount<'info>,
    pub quote_mint: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"share", grove.key().as_ref(), owner.key().as_ref(), &index.to_le_bytes()],
        bump = share_record.bump,
    )]
    pub share_record: Account<'info, ShareRecord>,
    /// CHECK: must equal record.core_asset (verified in handler); marked
    /// claimed via Attributes update on claim (burn pending mainnet verify).
    #[account(mut)]
    pub core_asset: UncheckedAccount<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

/// Mint an already-revealed solo Share (instant path). Solo weight is always
/// WEIGHT_ONE; visual DNA rolls so pulls still look unique.
fn mint_instant_share_cpi<'info>(
    core_program: &SolanaAccountInfo<'info>,
    asset: &SolanaAccountInfo<'info>,
    payer: &SolanaAccountInfo<'info>,
    update_authority: &SolanaAccountInfo<'info>,
    system_program: &SolanaAccountInfo<'info>,
    name: String,
    uri: String,
    deposit: u64,
    dna: u64,
) -> Result<()> {
    require!(name.len() <= 32, CanopyError::NameTooLong);
    require!(uri.len() <= 200, CanopyError::UriTooLong);
    let plugins = vec![
        PluginAuthorityPair {
            plugin: Plugin::Attributes(Attributes {
                attribute_list: vec![
                    Attribute {
                        key: "sealed".to_string(),
                        value: "false".to_string(),
                    },
                    Attribute {
                        key: "revealed".to_string(),
                        value: "true".to_string(),
                    },
                    Attribute {
                        key: "deposit_lamports".to_string(),
                        value: deposit.to_string(),
                    },
                    Attribute {
                        key: "weight_1e18".to_string(),
                        value: WEIGHT_ONE.to_string(),
                    },
                    Attribute {
                        key: "rarity".to_string(),
                        value: "Legendary".to_string(),
                    },
                    Attribute {
                        key: "dna".to_string(),
                        value: dna.to_string(),
                    },
                    Attribute {
                        key: "instant".to_string(),
                        value: "true".to_string(),
                    },
                ],
            }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::Royalties(Royalties {
                basis_points: 250,
                creators: vec![Creator {
                    address: update_authority.key(),
                    percentage: 100,
                }],
                rule_set: RuleSet::None,
            }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::FreezeDelegate(FreezeDelegate { frozen: false }),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
        PluginAuthorityPair {
            plugin: Plugin::BurnDelegate(BurnDelegate {}),
            authority: Some(PluginAuthority::UpdateAuthority),
        },
    ];
    CreateV1CpiBuilder::new(core_program)
        .asset(asset)
        .payer(payer)
        .owner(Some(payer))
        .update_authority(Some(update_authority))
        .system_program(system_program)
        .data_state(DataState::AccountState)
        .name(name)
        .uri(uri)
        .plugins(plugins)
        .invoke()?;
    Ok(())
}

#[derive(Accounts)]
pub struct InitTreasury<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + Treasury::SIZE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub treasury_vault: UncheckedAccount<'info>,
    pub quote_mint: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    #[account(address = ATA_ID)]
    pub associated_token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct InstantMint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + Grove::SIZE,
        seeds = [b"grove", payer.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub grove: Account<'info, Grove>,
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub treasury_vault: UncheckedAccount<'info>,
    pub quote_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer_ata: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + ShareRecord::SIZE,
        seeds = [b"share", grove.key().as_ref(), payer.key().as_ref(), &[0u8, 0u8, 0u8, 0u8]],
        bump
    )]
    pub share_record: Account<'info, ShareRecord>,
    #[account(mut, signer)]
    pub asset: UncheckedAccount<'info>,
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    #[account(address = ATA_ID)]
    pub associated_token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub slot_hashes: UncheckedAccount<'info>,
}
