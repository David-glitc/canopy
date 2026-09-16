use anchor_lang::prelude::*;
use mpl_core::{
    instructions::CreateV1CpiBuilder,
    types::{
        Attribute, Attributes, BurnDelegate, Creator, DataState, FreezeDelegate, Plugin,
        PluginAuthority, PluginAuthorityPair, Royalties, RuleSet,
    },
    ID as CORE_PROGRAM_ID,
};

declare_id!("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");

#[program]
pub mod canopy {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.config.authority = ctx.accounts.authority.key();
        Ok(())
    }

    /// Mint a sealed Share as a Metaplex Core asset via CPI.
    ///
    /// The program's config PDA becomes the Core `update_authority` and the
    /// authority of every plugin, so only this program can later reveal
    /// (update attributes), freeze (listing lock), or burn (claim) the Share.
    /// The depositor pays rent, owns the Share, and the asset key is a fresh
    /// keypair they provide as signer.
    pub fn mint_share(
        ctx: Context<MintShare>,
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
                        address: ctx.accounts.config.key(),
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

        CreateV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .payer(&ctx.accounts.payer.to_account_info())
            .owner(Some(&ctx.accounts.payer.to_account_info()))
            .update_authority(Some(&ctx.accounts.config.to_account_info()))
            .system_program(&ctx.accounts.system_program.to_account_info())
            .data_state(DataState::AccountState)
            .name(name)
            .uri(uri)
            .plugins(plugins)
            .invoke()?;

        Ok(())
    }
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
    /// Fresh Core asset keypair, provided and signed by the invoker.
    #[account(mut, signer)]
    pub asset: AccountInfo<'info>,
    /// Program config PDA — becomes Core update authority + plugin authority.
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    /// CHECK: Metaplex Core program, constrained by address.
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Config {
    pub authority: Pubkey,
}

impl Config {
    pub const SIZE: usize = 32;
}

#[error_code]
pub enum CanopyError {
    #[msg("Share name exceeds 32 bytes")]
    NameTooLong,
    #[msg("Share URI exceeds 200 bytes")]
    UriTooLong,
}
