use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct SetRegionOwner<'info> {
    #[account(
        mut,
        seeds = [REGION_SEED, &[region.id]],
        bump = region.bump,
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
}

pub fn set_region_owner_handler(ctx: Context<SetRegionOwner>, owner: Pubkey) -> Result<()> {
    let region = &mut ctx.accounts.region;
    region.faction_owner = Some(owner);
    region.dominance = 100; // For testing income, set dominance to 100%
    Ok(())
}
