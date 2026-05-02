use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub epoch: u64,
    pub turn: u32,
    pub start_time: i64,
    pub end_time: i64,
    pub last_turn_timestamp: i64,
    pub is_active: bool,
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub capital_mint: Pubkey,
    pub bump: u8,
}
