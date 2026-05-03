use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(region_id: u8)]
pub struct InitializeLeaderboard<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RegionLeaderboard::INIT_SPACE,
        seeds = [LEADERBOARD_SEED, &[region_id]],
        bump
    )]
    pub leaderboard: Account<'info, RegionLeaderboard>,

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

pub fn initialize_leaderboard_handler(ctx: Context<InitializeLeaderboard>, region_id: u8) -> Result<()> {
    let leaderboard = &mut ctx.accounts.leaderboard;
    leaderboard.region_id = region_id;
    leaderboard.current_leader = Pubkey::default();
    leaderboard.leader_manifesto_uri = String::new();
    leaderboard.total_bid_weight = 0;
    leaderboard.bump = ctx.bumps.leaderboard;
    Ok(())
}
