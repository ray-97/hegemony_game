use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeDiplomacy<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + DiplomaticInfluenceAccount::INIT_SPACE,
        seeds = [DIPLOMACY_SEED, authority.key().as_ref(), &[region.id]],
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

pub fn handler(ctx: Context<InitializeDiplomacy>) -> Result<()> {
    let diplomacy = &mut ctx.accounts.diplomacy;
    diplomacy.owner = ctx.accounts.authority.key();
    diplomacy.region_id = ctx.accounts.region.id;
    diplomacy.influence = 2000; // Boosted for testing (Covert Ops cost DI)
    diplomacy.bump = ctx.bumps.diplomacy;
    Ok(())
}
