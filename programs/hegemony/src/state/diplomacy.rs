use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DiplomaticInfluenceAccount {
    pub owner: Pubkey,
    pub region_id: u8,
    pub influence: u64, // Soulbound DI accrual
    pub last_action_turn: u32,
    pub turn_action_count: u8, // For the Pariah State Curve (1x, 2x, 4x cost)
    pub bump: u8,
}
