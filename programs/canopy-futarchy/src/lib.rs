use anchor_lang::prelude::*;

declare_id!("BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k");

#[program]
pub mod canopy_futarchy {
    use super::*;

    /// D1 stub: proves the toolchain. Conditional vault + LMSR + TWAP
    /// finalize land in subsequent commits.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.state.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + State::SIZE,
        seeds = [b"futarchy"],
        bump
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct State {
    pub authority: Pubkey,
}

impl State {
    pub const SIZE: usize = 32;
}
