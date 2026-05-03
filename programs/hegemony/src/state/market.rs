use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MarketAccount {
    pub market_id: u64,
    pub region_id: u8,
    pub creator: Pubkey,
    pub thesis_type: ThesisType,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub capital_vault: Pubkey,
    pub pool_yes: u64,
    pub pool_no: u64,
    pub resolution_state: ResolutionState,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ThesisType {
    Macro,
    Micro,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ResolutionState {
    Unresolved,
    ResolvedYes,
    ResolvedNo,
}
