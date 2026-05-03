use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct EndEpoch<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::Active @ ErrorCode::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        seeds = [REGION_SEED, &[winning_region.id]],
        bump = winning_region.bump,
    )]
    pub winning_region: Account<'info, RegionAccount>,

    #[account(
        mut,
        constraint = global_state.authority == authority.key()
    )]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<EndEpoch>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let winning_region = &ctx.accounts.winning_region;
    let clock = Clock::get()?;

    if clock.unix_timestamp < global_state.end_time {
        // In real game, we'd check if someone reached 100 dominance
        if winning_region.dominance < 100 {
             return Err(ErrorCode::TurnNotReady.into()); // Borrowing error for "Not time yet"
        }
    }

    global_state.status = GameStatus::Ended;
    global_state.hegemon = winning_region.faction_owner;
    
    // For MVP, prize pool is the capital vault's current balance or a fixed sum
    // Let's just assume we distributed it elsewhere or it's tracked in GlobalState
    
    msg!("Epoch {} Ended. Hegemon: {:?}", global_state.epoch, global_state.hegemon);
    Ok(())
}
