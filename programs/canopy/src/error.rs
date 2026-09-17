use anchor_lang::prelude::*;

#[error_code]
pub enum CanopyError {
    #[msg("Share name exceeds 32 bytes")]
    NameTooLong,
    #[msg("Share URI exceeds 200 bytes")]
    UriTooLong,
    #[msg("Funding goal must be positive")]
    GoalZero,
    #[msg("Minimum deposit must be positive")]
    MinZero,
    #[msg("Deadline must be in the future")]
    DeadlinePast,
    #[msg("Grove is not accepting deposits")]
    NotFunding,
    #[msg("Funding window has closed")]
    PastDeadline,
    #[msg("Deposit below minimum")]
    BelowMin,
    #[msg("Share index does not match grove count")]
    BadIndex,
    #[msg("Goal not yet met")]
    GoalNotMet,
    #[msg("Deadline has not passed")]
    NotExpired,
    #[msg("Grove met its goal; cannot cancel")]
    NotUnderfunded,
    #[msg("Grove is not cancelled")]
    NotCancelled,
    #[msg("Share already refunded or claimed")]
    NotActive,
    #[msg("Deposit token does not match grove vault")]
    MintMismatch,
    #[msg("Vault does not belong to this grove")]
    VaultMismatch,
    #[msg("Quote mint is not a Token-2022 mint")]
    InvalidQuoteMint,
    #[msg("Grove is not closed")]
    NotClosed,
    #[msg("Grove is not revealed")]
    NeedRevealed,
    #[msg("Reveal too early: entropy slot not yet reached")]
    TooEarly,
    #[msg("Entropy slot hash unavailable")]
    NoSlotHash,
    #[msg("Share accounts do not match the grove")]
    ShareCountMismatch,
    #[msg("Already revealed")]
    AlreadyRevealed,
    #[msg("Grove is full")]
    MaxShares,
    #[msg("Reveal math error")]
    MathError,
}
