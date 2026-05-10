use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PlayerProfile {
    #[max_len(32)]
    pub name: String,
    pub authority: Pubkey,
    pub bump: u8,
}
