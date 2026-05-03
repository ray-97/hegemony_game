use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Turn duration has not yet elapsed")]
    TurnNotReady,
    #[msg("Income for this region has already been processed for the current turn")]
    IncomeAlreadyProcessed,
    #[msg("Numerical overflow")]
    Overflow,
    #[msg("Invalid region owner")]
    InvalidOwner,
    #[msg("Auction has already ended")]
    AuctionEnded,
    #[msg("Auction is still ongoing")]
    AuctionOngoing,
    #[msg("Invalid Game Status")]
    InvalidStatus,
    #[msg("Market already resolved")]
    MarketResolved,
    #[msg("Market is still unresolved")]
    MarketUnresolved,
    #[msg("Invalid AMM Calculation")]
    InvalidAmmCalculation,
}
