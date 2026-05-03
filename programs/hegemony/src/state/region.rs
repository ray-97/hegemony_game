use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RegionAccount {
    pub id: u8,
    pub dominance: u8, // 0-100
    pub energy_level: u8, // 0-3
    pub tech_level: u8, // 0-3
    pub logistics_level: u8, // 0-3
    pub faction_owner: Option<Pubkey>,
    pub resource_yield: u64,
    pub bond_mint: Pubkey,
    pub bond_vault: Pubkey, // Holds $CAP yield
    pub status: RegionStatus,
    pub volatility_penalty: u16, // Penalizes raw score, decays over turns
    pub last_income_turn: u32,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RegionStatus {
    Stable,
    Contested,
    Blockaded,
}
