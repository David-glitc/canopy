use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    rent::Rent,
    system_instruction,
};

declare_id!("BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k");

mod error;
mod state;

use error::FutarchyError;
use state::*;

const TOKEN_2022_ID: Pubkey = spl_token_2022::ID;
const ATA_ID: Pubkey = spl_associated_token_account::ID;
/// Token-2022 base mint size (no extensions on conditional mints).
const MINT_LEN: usize = 82;

#[program]
pub mod canopy_futarchy {
    use super::*;

    /// Open a decision market. The proposer bonds collateral (split into
    /// PASS+FAIL) and seeds the book, so a live market always exists.
    /// Silence (zero trades) resolves to the status quo at finalize.
    #[allow(clippy::too_many_arguments)]
    pub fn init_market(
        ctx: Context<InitMarket>,
        grove: Pubkey,
        proposal_id: u64,
        bond: u64,
        seed: u64,
        decimals: u8,
        opens_at: i64,
        closes_at: i64,
    ) -> Result<()> {
        require!(bond > 0, FutarchyError::ZeroBond);
        require!(seed > 0 && seed <= bond, FutarchyError::BadSeed);
        let now = Clock::get()?.unix_timestamp;
        require!(
            closes_at > opens_at && closes_at > now,
            FutarchyError::BadWindow
        );
        require!(
            ctx.accounts.collateral_mint.owner == &TOKEN_2022_ID,
            FutarchyError::AccountMismatch
        );

        let market_key = ctx.accounts.market.key();
        let proposer = ctx.accounts.proposer.key();
        let collateral_mint = ctx.accounts.collateral_mint.key();
        let pass_mint = ctx.accounts.pass_mint.key();
        let fail_mint = ctx.accounts.fail_mint.key();

        // Verify every PDA-owned ATA derivation before creating anything.
        let expected = |owner: &Pubkey, mint: &Pubkey| {
            spl_associated_token_account::get_associated_token_address_with_program_id(
                owner,
                mint,
                &TOKEN_2022_ID,
            )
        };
        require!(
            ctx.accounts.collateral_vault.key() == expected(&market_key, &collateral_mint)
                && ctx.accounts.pass_pool.key() == expected(&market_key, &pass_mint)
                && ctx.accounts.fail_pool.key() == expected(&market_key, &fail_mint)
                && ctx.accounts.proposer_pass_ata.key() == expected(&proposer, &pass_mint)
                && ctx.accounts.proposer_fail_ata.key() == expected(&proposer, &fail_mint),
            FutarchyError::AccountMismatch
        );

        let rent = Rent::get()?;
        let lamports = rent.minimum_balance(MINT_LEN);

        // Create + init the two conditional mints (authority = market PDA).
        for mint_ai in [
            ctx.accounts.pass_mint.to_account_info(),
            ctx.accounts.fail_mint.to_account_info(),
        ] {
            invoke(
                &system_instruction::create_account(
                    &proposer,
                    &mint_ai.key(),
                    lamports,
                    MINT_LEN as u64,
                    &TOKEN_2022_ID,
                ),
                &[
                    ctx.accounts.proposer.to_account_info(),
                    mint_ai.clone(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
            invoke(
                &spl_token_2022::instruction::initialize_mint2(
                    &TOKEN_2022_ID,
                    &mint_ai.key(),
                    &market_key,
                    None,
                    decimals,
                )?,
                &[mint_ai],
            )?;
        }

        // Create the five ATAs: vault, two pools, proposer's two outcome accounts.
        let vault_ata = ctx.accounts.collateral_vault.key();
        let pass_pool_ata = ctx.accounts.pass_pool.key();
        let fail_pool_ata = ctx.accounts.fail_pool.key();
        let proposer_pass_ata = ctx.accounts.proposer_pass_ata.key();
        let proposer_fail_ata = ctx.accounts.proposer_fail_ata.key();
        let creations = [
            (vault_ata, collateral_mint, market_key),
            (pass_pool_ata, pass_mint, market_key),
            (fail_pool_ata, fail_mint, market_key),
            (proposer_pass_ata, pass_mint, proposer),
            (proposer_fail_ata, fail_mint, proposer),
        ];
        // Owner/mint infos, aligned with `creations` order.
        let owners_mints = [
            (
                ctx.accounts.market.to_account_info(),
                ctx.accounts.collateral_mint.to_account_info(),
            ),
            (
                ctx.accounts.market.to_account_info(),
                ctx.accounts.pass_mint.to_account_info(),
            ),
            (
                ctx.accounts.market.to_account_info(),
                ctx.accounts.fail_mint.to_account_info(),
            ),
            (
                ctx.accounts.proposer.to_account_info(),
                ctx.accounts.pass_mint.to_account_info(),
            ),
            (
                ctx.accounts.proposer.to_account_info(),
                ctx.accounts.fail_mint.to_account_info(),
            ),
        ];
        for (i, (ata, mint, owner)) in creations.iter().enumerate() {
            require!(
                ctx.accounts.proposer.key() == proposer,
                FutarchyError::AccountMismatch
            );
            let (owner_ai, mint_ai) = &owners_mints[i];
            // Re-derive the ATA account info from the struct by key match.
            let ata_ai = [
                ctx.accounts.collateral_vault.to_account_info(),
                ctx.accounts.pass_pool.to_account_info(),
                ctx.accounts.fail_pool.to_account_info(),
                ctx.accounts.proposer_pass_ata.to_account_info(),
                ctx.accounts.proposer_fail_ata.to_account_info(),
            ][i]
                .clone();
            require!(&ata_ai.key() == ata, FutarchyError::AccountMismatch);
            invoke(
                &spl_associated_token_account::instruction::create_associated_token_account(
                    &proposer,
                    owner,
                    mint,
                    &TOKEN_2022_ID,
                ),
                &[
                    ctx.accounts.proposer.to_account_info(),
                    ata_ai,
                    owner_ai.clone(),
                    mint_ai.clone(),
                    ctx.accounts.system_program.to_account_info(),
                    ctx.accounts.token_2022_program.to_account_info(),
                ],
            )?;
        }

        // Bond collateral into the vault.
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.proposer_collateral_ata.key(),
                &collateral_mint,
                &vault_ata,
                &proposer,
                &[],
                bond,
                decimals,
            )?,
            &[
                ctx.accounts.proposer_collateral_ata.to_account_info(),
                ctx.accounts.collateral_mint.to_account_info(),
                ctx.accounts.collateral_vault.to_account_info(),
                ctx.accounts.proposer.to_account_info(),
            ],
        )?;

        // Mint seed -> pool and (bond - seed) -> proposer, per outcome.
        let pid_le = proposal_id.to_le_bytes();
        let seeds: &[&[u8]] = &[
            b"market",
            grove.as_ref(),
            &pid_le,
            &[ctx.bumps.market],
        ];
        let remainder = bond.checked_sub(seed).ok_or(FutarchyError::BadSeed)?;
        for (mint_key, mint_ai, pool_ata_ai, proposer_ata_ai) in [
            (
                pass_mint,
                ctx.accounts.pass_mint.to_account_info(),
                ctx.accounts.pass_pool.to_account_info(),
                ctx.accounts.proposer_pass_ata.to_account_info(),
            ),
            (
                fail_mint,
                ctx.accounts.fail_mint.to_account_info(),
                ctx.accounts.fail_pool.to_account_info(),
                ctx.accounts.proposer_fail_ata.to_account_info(),
            ),
        ] {
            for (dest_ai, amount) in [(pool_ata_ai, seed), (proposer_ata_ai, remainder)] {
                if amount == 0 {
                    continue;
                }
                // mint_to metas: [mint, dest, authority].
                invoke_signed(
                    &spl_token_2022::instruction::mint_to(
                        &TOKEN_2022_ID,
                        &mint_key,
                        &dest_ai.key(),
                        &market_key,
                        &[],
                        amount,
                    )?,
                    &[
                        mint_ai.clone(),
                        dest_ai,
                        ctx.accounts.market.to_account_info(),
                    ],
                    &[seeds],
                )?;
            }
        }

        // Write market state.
        let market = &mut ctx.accounts.market;
        market.grove = grove;
        market.proposal_id = proposal_id;
        market.collateral_mint = collateral_mint;
        market.collateral_vault = vault_ata;
        market.pass_mint = pass_mint;
        market.fail_mint = fail_mint;
        market.pass_pool = pass_pool_ata;
        market.fail_pool = fail_pool_ata;
        market.opens_at = opens_at;
        market.closes_at = closes_at;
        market.decided = false;
        market.passed = false;
        market.pass_reserve = seed;
        market.fail_reserve = seed;
        market.cum_price = 0;
        market.last_crank = opens_at;
        market.trade_count = 0;
        market.bump = ctx.bumps.market;
        Ok(())
    }

    pub fn split(
        ctx: Context<Split>,
        _grove: Pubkey,
        _proposal_id: u64,
        amount: u64,
        decimals: u8,
    ) -> Result<()> {
        require!(amount > 0, FutarchyError::ZeroAmount);
        let now = Clock::get()?.unix_timestamp;
        let market = &ctx.accounts.market;
        require!(!market.decided, FutarchyError::Decided);
        require!(
            now >= market.opens_at && now < market.closes_at,
            FutarchyError::NotOpen
        );
        require!(
            ctx.accounts.vault.key() == market.collateral_vault,
            FutarchyError::AccountMismatch
        );

        // Collateral in.
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.user_collateral.key(),
                &market.collateral_mint,
                &market.collateral_vault,
                &ctx.accounts.user.key(),
                &[],
                amount,
                decimals,
            )?,
            &[
                ctx.accounts.user_collateral.to_account_info(),
                ctx.accounts.collateral_mint.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.user.to_account_info(),
            ],
        )?;

        // PASS + FAIL out (mint authority = market PDA).
        let pid_le = ctx.accounts.market.proposal_id.to_le_bytes();
        let seeds: &[&[u8]] = &[
            b"market",
            ctx.accounts.market.grove.as_ref(),
            &pid_le,
            &[ctx.accounts.market.bump],
        ];
        // NOTE: mint_to metas are [mint, dest, authority].
        // The mint pubkey must equal the stored pass/fail mint.
        require!(
            ctx.accounts.pass_mint.key() == market.pass_mint
                && ctx.accounts.fail_mint.key() == market.fail_mint,
            FutarchyError::AccountMismatch
        );
        for (mint_ai, dest_ai) in [
            (
                ctx.accounts.pass_mint.to_account_info(),
                ctx.accounts.user_pass.to_account_info(),
            ),
            (
                ctx.accounts.fail_mint.to_account_info(),
                ctx.accounts.user_fail.to_account_info(),
            ),
        ] {
            invoke_signed(
                &spl_token_2022::instruction::mint_to(
                    &TOKEN_2022_ID,
                    &mint_ai.key(),
                    &dest_ai.key(),
                    &market.key(),
                    &[],
                    amount,
                )?,
                &[
                    mint_ai,
                    dest_ai,
                    ctx.accounts.market.to_account_info(),
                ],
                &[seeds],
            )?;
        }
        Ok(())
    }

    pub fn merge(
        ctx: Context<Merge>,
        _grove: Pubkey,
        _proposal_id: u64,
        amount: u64,
        decimals: u8,
    ) -> Result<()> {
        require!(amount > 0, FutarchyError::ZeroAmount);
        let market = &ctx.accounts.market;
        require!(
            ctx.accounts.vault.key() == market.collateral_vault
                && ctx.accounts.pass_mint.key() == market.pass_mint
                && ctx.accounts.fail_mint.key() == market.fail_mint,
            FutarchyError::AccountMismatch
        );

        // Burn the pair (authority = user).
        for (mint_ai, user_ai) in [
            (
                ctx.accounts.pass_mint.to_account_info(),
                ctx.accounts.user_pass.to_account_info(),
            ),
            (
                ctx.accounts.fail_mint.to_account_info(),
                ctx.accounts.user_fail.to_account_info(),
            ),
        ] {
            invoke(
                &spl_token_2022::instruction::burn(
                    &TOKEN_2022_ID,
                    &user_ai.key(),
                    &mint_ai.key(),
                    &ctx.accounts.user.key(),
                    &[],
                    amount,
                )?,
                &[user_ai, mint_ai, ctx.accounts.user.to_account_info()],
            )?;
        }

        // Return the collateral (authority = market PDA).
        let pid_le = market.proposal_id.to_le_bytes();
        let seeds: &[&[u8]] = &[
            b"market",
            market.grove.as_ref(),
            &pid_le,
            &[market.bump],
        ];
        invoke_signed(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &market.collateral_vault,
                &market.collateral_mint,
                &ctx.accounts.user_collateral.key(),
                &market.key(),
                &[],
                amount,
                decimals,
            )?,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.collateral_mint.to_account_info(),
                ctx.accounts.user_collateral.to_account_info(),
                ctx.accounts.market.to_account_info(),
            ],
            &[seeds],
        )?;
        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        _grove: Pubkey,
        _proposal_id: u64,
        amount_in: u64,
        is_pass_to_fail: bool,
        min_out: u64,
        decimals: u8,
    ) -> Result<()> {
        require!(amount_in > 0, FutarchyError::ZeroAmount);
        let now = Clock::get()?.unix_timestamp;
        let market = &mut ctx.accounts.market;
        require!(!market.decided, FutarchyError::Decided);
        require!(
            now >= market.opens_at && now < market.closes_at,
            FutarchyError::NotOpen
        );

        // Resolve direction against stored pools/mints.
        let (in_reserve, out_reserve, in_pool_key, out_pool_key, in_mint_key, out_mint_key) =
            if is_pass_to_fail {
                (
                    market.pass_reserve,
                    market.fail_reserve,
                    market.pass_pool,
                    market.fail_pool,
                    market.pass_mint,
                    market.fail_mint,
                )
            } else {
                (
                    market.fail_reserve,
                    market.pass_reserve,
                    market.fail_pool,
                    market.pass_pool,
                    market.fail_mint,
                    market.pass_mint,
                )
            };
        require!(
            ctx.accounts.pool_in.key() == in_pool_key
                && ctx.accounts.pool_out.key() == out_pool_key
                && ctx.accounts.pass_mint.key() == market.pass_mint
                && ctx.accounts.fail_mint.key() == market.fail_mint,
            FutarchyError::AccountMismatch
        );

        // TWAP accrual with pre-trade price.
        crank_to(market, now)?;

        // CPMM with fee: out = out_r * in_fee / (in_r + in_fee).
        let in_after_fee = (amount_in as u128)
            .checked_mul((FEE_DENOM - FEE_BPS) as u128)
            .ok_or(FutarchyError::Overflow)?
            / FEE_DENOM as u128;
        let out = (out_reserve as u128)
            .checked_mul(in_after_fee)
            .ok_or(FutarchyError::Overflow)?
            / (in_reserve as u128)
                .checked_add(in_after_fee)
                .ok_or(FutarchyError::Overflow)?;
        let out = u64::try_from(out).map_err(|_| FutarchyError::Overflow)?;
        require!(out > 0 && out >= min_out, FutarchyError::Slippage);

        // Collateral leg in (authority = user).
        invoke(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &ctx.accounts.user_in.key(),
                &in_mint_key,
                &in_pool_key,
                &ctx.accounts.user.key(),
                &[],
                amount_in,
                decimals,
            )?,
            &[
                ctx.accounts.user_in.to_account_info(),
                if is_pass_to_fail {
                    ctx.accounts.pass_mint.to_account_info()
                } else {
                    ctx.accounts.fail_mint.to_account_info()
                },
                ctx.accounts.pool_in.to_account_info(),
                ctx.accounts.user.to_account_info(),
            ],
        )?;

        // Payout leg out (authority = market PDA).
        let pid_le = market.proposal_id.to_le_bytes();
        let market_bump = market.bump;
        let seeds: &[&[u8]] = &[
            b"market",
            market.grove.as_ref(),
            &pid_le,
            &[market_bump],
        ];
        let market_ai = market.to_account_info();
        invoke_signed(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &out_pool_key,
                &out_mint_key,
                &ctx.accounts.user_out.key(),
                &market.key(),
                &[],
                out,
                decimals,
            )?,
            &[
                ctx.accounts.pool_out.to_account_info(),
                if is_pass_to_fail {
                    ctx.accounts.fail_mint.to_account_info()
                } else {
                    ctx.accounts.pass_mint.to_account_info()
                },
                ctx.accounts.user_out.to_account_info(),
                market_ai,
            ],
            &[seeds],
        )?;

        // Update reserves + stats.
        if is_pass_to_fail {
            market.pass_reserve = market
                .pass_reserve
                .checked_add(amount_in)
                .ok_or(FutarchyError::Overflow)?;
            market.fail_reserve = market
                .fail_reserve
                .checked_sub(out)
                .ok_or(FutarchyError::Overflow)?;
        } else {
            market.fail_reserve = market
                .fail_reserve
                .checked_add(amount_in)
                .ok_or(FutarchyError::Overflow)?;
            market.pass_reserve = market
                .pass_reserve
                .checked_sub(out)
                .ok_or(FutarchyError::Overflow)?;
        }
        market.trade_count = market
            .trade_count
            .checked_add(1)
            .ok_or(FutarchyError::Overflow)?;
        market.last_crank = now;
        Ok(())
    }

    pub fn crank(ctx: Context<Crank>, _grove: Pubkey, _proposal_id: u64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        crank_to(&mut ctx.accounts.market, now)
    }

    pub fn finalize(ctx: Context<Finalize>, _grove: Pubkey, _proposal_id: u64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let market = &mut ctx.accounts.market;
        require!(!market.decided, FutarchyError::Decided);
        require!(now >= market.closes_at, FutarchyError::NotOpen);
        let closes_at = market.closes_at;
        crank_to(market, closes_at)?;

        // Silence resolves to the status quo.
        if market.trade_count == 0 {
            market.decided = true;
            market.passed = false;
            return Ok(());
        }
        let elapsed = market
            .closes_at
            .checked_sub(market.opens_at)
            .ok_or(FutarchyError::BadWindow)?;
        require!(elapsed > 0, FutarchyError::BadWindow);
        let twap = market.cum_price / elapsed as u128;
        market.passed = twap > PRICE_SCALE;
        market.decided = true;
        Ok(())
    }

    pub fn redeem(
        ctx: Context<Redeem>,
        _grove: Pubkey,
        _proposal_id: u64,
        amount: u64,
        decimals: u8,
    ) -> Result<()> {
        require!(amount > 0, FutarchyError::ZeroAmount);
        let market = &ctx.accounts.market;
        require!(market.decided, FutarchyError::NotDecided);
        let win_mint = if market.passed {
            market.pass_mint
        } else {
            market.fail_mint
        };
        require!(
            ctx.accounts.win_mint.key() == win_mint
                && ctx.accounts.vault.key() == market.collateral_vault,
            FutarchyError::AccountMismatch
        );

        // Burn winners (authority = user).
        invoke(
            &spl_token_2022::instruction::burn(
                &TOKEN_2022_ID,
                &ctx.accounts.user_ata.key(),
                &win_mint,
                &ctx.accounts.user.key(),
                &[],
                amount,
            )?,
            &[
                ctx.accounts.user_ata.to_account_info(),
                ctx.accounts.win_mint.to_account_info(),
                ctx.accounts.user.to_account_info(),
            ],
        )?;

        // Pay 1:1 collateral (authority = market PDA).
        let pid_le = market.proposal_id.to_le_bytes();
        let seeds: &[&[u8]] = &[
            b"market",
            market.grove.as_ref(),
            &pid_le,
            &[market.bump],
        ];
        invoke_signed(
            &spl_token_2022::instruction::transfer_checked(
                &TOKEN_2022_ID,
                &market.collateral_vault,
                &market.collateral_mint,
                &ctx.accounts.user_collateral.key(),
                &market.key(),
                &[],
                amount,
                decimals,
            )?,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.collateral_mint.to_account_info(),
                ctx.accounts.user_collateral.to_account_info(),
                ctx.accounts.market.to_account_info(),
            ],
            &[seeds],
        )?;
        Ok(())
    }
}

/// Accrue time-weighted price up to `now` (capped at close).
/// Price = fail_reserve / pass_reserve in PRICE_SCALE fixed point.
fn crank_to(market: &mut Market, now: i64) -> Result<()> {
    let cap = now.min(market.closes_at).max(market.last_crank);
    if cap <= market.last_crank {
        return Ok(());
    }
    let dt = (cap - market.last_crank) as u128;
    // last_crank starts at opens_at; never accrue before open.
    if market.last_crank < market.opens_at {
        market.last_crank = cap.max(market.opens_at);
        if market.last_crank >= cap {
            return Ok(());
        }
    }
    if market.pass_reserve == 0 {
        market.last_crank = cap;
        return Ok(());
    }
    let price = (market.fail_reserve as u128)
        .checked_mul(PRICE_SCALE)
        .ok_or(FutarchyError::Overflow)?
        / market.pass_reserve as u128;
    market.cum_price = market
        .cum_price
        .checked_add(price.checked_mul(dt).ok_or(FutarchyError::Overflow)?)
        .ok_or(FutarchyError::Overflow)?;
    market.last_crank = cap;
    Ok(())
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct InitMarket<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    #[account(
        init,
        payer = proposer,
        space = 8 + Market::SIZE,
        seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    /// Fresh PASS mint keypair (created + inited by this ix).
    #[account(mut, signer)]
    pub pass_mint: UncheckedAccount<'info>,
    /// Fresh FAIL mint keypair (created + inited by this ix).
    #[account(mut, signer)]
    pub fail_mint: UncheckedAccount<'info>,
    /// Vault ATA (created by this ix).
    #[account(mut)]
    pub collateral_vault: UncheckedAccount<'info>,
    /// Pool PASS ATA (created by this ix).
    #[account(mut)]
    pub pass_pool: UncheckedAccount<'info>,
    /// Pool FAIL ATA (created by this ix).
    #[account(mut)]
    pub fail_pool: UncheckedAccount<'info>,
    /// Proposer's collateral ATA (debited).
    #[account(mut)]
    pub proposer_collateral_ata: UncheckedAccount<'info>,
    /// Proposer's PASS ATA (created by this ix).
    #[account(mut)]
    pub proposer_pass_ata: UncheckedAccount<'info>,
    /// Proposer's FAIL ATA (created by this ix).
    #[account(mut)]
    pub proposer_fail_ata: UncheckedAccount<'info>,
    /// CHECK: verified as a Token-2022 mint in handler.
    pub collateral_mint: UncheckedAccount<'info>,
    /// CHECK: Token-2022 program.
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
    /// CHECK: Associated Token program.
    #[account(address = ATA_ID)]
    pub associated_token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Split<'info> {
    pub user: Signer<'info>,
    #[account(seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_collateral: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_pass: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_fail: UncheckedAccount<'info>,
    #[account(mut)]
    pub pass_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub fail_mint: UncheckedAccount<'info>,
    /// CHECK: collateral mint recorded on the market; enforced by transfer.
    pub collateral_mint: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Merge<'info> {
    pub user: Signer<'info>,
    #[account(seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_collateral: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_pass: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_fail: UncheckedAccount<'info>,
    #[account(mut)]
    pub pass_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub fail_mint: UncheckedAccount<'info>,
    /// CHECK: collateral mint recorded on the market; enforced by transfer.
    pub collateral_mint: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Swap<'info> {
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub pool_in: UncheckedAccount<'info>,
    #[account(mut)]
    pub pool_out: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_in: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_out: UncheckedAccount<'info>,
    pub pass_mint: UncheckedAccount<'info>,
    pub fail_mint: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Crank<'info> {
    pub cranker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Finalize<'info> {
    pub anyone: Signer<'info>,
    #[account(
        mut,
        seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
#[instruction(grove: Pubkey, proposal_id: u64)]
pub struct Redeem<'info> {
    pub user: Signer<'info>,
    #[account(seeds = [b"market", grove.as_ref(), &proposal_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_collateral: UncheckedAccount<'info>,
    #[account(mut)]
    pub user_ata: UncheckedAccount<'info>,
    #[account(mut)]
    pub win_mint: UncheckedAccount<'info>,
    /// CHECK: collateral mint recorded on the market; enforced by transfer.
    pub collateral_mint: UncheckedAccount<'info>,
    #[account(address = TOKEN_2022_ID)]
    pub token_2022_program: UncheckedAccount<'info>,
}
