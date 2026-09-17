use anchor_lang::prelude::*;

#[error_code]
pub enum FutarchyError {
    #[msg("Bond must be positive")]
    ZeroBond,
    #[msg("Seed liquidity must be positive and not exceed the bond")]
    BadSeed,
    #[msg("Market window is invalid")]
    BadWindow,
    #[msg("Market is not open")]
    NotOpen,
    #[msg("Market is already decided")]
    Decided,
    #[msg("Market is not decided yet")]
    NotDecided,
    #[msg("Slippage: output below minimum")]
    Slippage,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Division by zero in price")]
    ZeroPrice,
    #[msg("Account does not match market")]
    AccountMismatch,
    #[msg("Amount must be positive")]
    ZeroAmount,
}
