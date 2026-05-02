use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(region_id: u8)]
pub struct InitializeRegion<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RegionAccount::INIT_SPACE,
        seeds = [REGION_SEED, &[region_id]],
        bump
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key()
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_region_handler(
    ctx: Context<InitializeRegion>,
    region_id: u8,
    resource_yield: u64,
) -> Result<()> {
    let region = &mut ctx.accounts.region;
    
    region.id = region_id;
    region.dominance = 0;
    region.infrastructure_level = 0;
    region.faction_owner = None;
    region.resource_yield = resource_yield;
    region.status = RegionStatus::Stable;
    region.bump = ctx.bumps.region;

    Ok(())
}
