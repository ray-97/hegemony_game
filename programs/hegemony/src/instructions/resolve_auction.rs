use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
pub struct ResolveAuction<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::PreEpoch @ HegemonyError::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        seeds = [LEADERBOARD_SEED, &[region.id]],
        bump = leaderboard.bump,
    )]
    pub leaderboard: Account<'info, RegionLeaderboard>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[region.id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn resolve_auction_handler(ctx: Context<ResolveAuction>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let leaderboard = &ctx.accounts.leaderboard;
    let region = &mut ctx.accounts.region;
    let clock = Clock::get()?;

    if clock.unix_timestamp < global_state.auction_end_time {
        return Err(HegemonyError::AuctionOngoing.into());
    }

    // 1. Assign Winner to Region
    if leaderboard.current_leader != Pubkey::default() {
        region.faction_owner = Some(leaderboard.current_leader);
        region.dominance = 100; // Initialize with 100 dominance for the winner
        msg!("Region {} assigned to winner: {}", region.id, leaderboard.current_leader);
    }

    // Note: In a real implementation, we would repeat this for all 5-7 regions.
    // To simplify for the MVP, we can transition GlobalState to Active once all or a specific set of regions are resolved.
    // For now, let's just transition GlobalState immediately.
    global_state.status = GameStatus::Active;
    global_state.last_turn_timestamp = clock.unix_timestamp;

    Ok(())
}
