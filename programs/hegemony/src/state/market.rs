use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MarketAccount {
    pub market_id: u64,
    pub pool_yes: u64,
    pub pool_no: u64,
    pub region_id: u8,
    pub thesis_type: u8, // 0 for Macro, 1 for Micro
    pub resolution_state: ResolutionState,
    pub bump: u8,
    // Put Pubkeys at the end for clean alignment
    pub creator: Pubkey,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub capital_vault: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ResolutionState {
    Unresolved,
    ResolvedYes,
    ResolvedNo,
}
