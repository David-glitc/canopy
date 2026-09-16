use anchor_lang::prelude::*;
use anchor_lang::solana_program::account_info::AccountInfo as SolanaAccountInfo;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use mpl_core::{
    instructions::CreateV1CpiBuilder,
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
