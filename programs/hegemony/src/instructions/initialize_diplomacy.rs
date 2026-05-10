use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
pub struct InitializeDiplomacy<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + DiplomaticInfluenceAccount::INIT_SPACE,
        seeds = [DIPLOMACY_SEED, authority.key().as_ref()],
        bump
    )]
    pub diplomacy: Account<'info, DiplomaticInfluenceAccount>,

    #[account(
        seeds = [REGION_SEED, &[region.id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_diplomacy_handler(ctx: Context<InitializeDiplomacy>, region_id: u8) -> Result<()> {
    let diplomacy = &mut ctx.accounts.diplomacy;
    let region = &ctx.accounts.region;

    // Optional: Cross-verify region_id matches the account passed
    require!(region.id == region_id, HegemonyError::InvalidStatus);

    diplomacy.owner = ctx.accounts.authority.key();
    diplomacy.region_id = region_id;
    diplomacy.influence = 2000; // Starting bonus for MVP
    diplomacy.bump = ctx.bumps.diplomacy;

    msg!("User registered citizenship in Region {}", region_id);
    Ok(())
}

