use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DelegationRecord {
    pub delegator: Pubkey,
    pub leader: Pubkey,
    pub region_id: u8,
    pub amount: u64,
    pub bump: u8,
}
