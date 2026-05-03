use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RegionLeaderboard {
    pub region_id: u8,
    pub current_leader: Pubkey,
    #[max_len(100)]
    pub leader_manifesto_uri: String, 
    pub total_bid_weight: u64, // Principal + Delegated
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BidderEscrow {
    pub owner: Pubkey,
    pub region_id: u8,
    #[max_len(100)]
    pub manifesto_uri: String,
    pub principal_capital: u64,
    pub delegated_capital: u64,
    pub bump: u8,
}
