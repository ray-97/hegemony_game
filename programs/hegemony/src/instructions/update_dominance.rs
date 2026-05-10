use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
pub struct UpdateRegionDominance<'info> {
    #[account(
        mut,
        seeds = [REGION_SEED, &[region.id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.region_id == region.id @ HegemonyError::InvalidStatus
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key()
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn update_dominance_handler(ctx: Context<UpdateRegionDominance>) -> Result<()> {
    let region = &mut ctx.accounts.region;
    let market = &ctx.accounts.market;

    // Formula: R_r = (α × I) + (β × MCI) - (γ × V)
    // Simplified for MVP:
    // α = 10 per sector level
    // β = 1 per 100 $CAP of net confidence (Pool_Yes - Pool_No)
    // γ = 1 per volatility point
    
    let sector_score = (region.energy_level as i64)
        .checked_add(region.tech_level as i64).unwrap()
        .checked_add(region.logistics_level as i64).unwrap()
        .checked_mul(10).unwrap();

    let mci = (market.pool_yes as i64).checked_sub(market.pool_no as i64).unwrap()
        .checked_div(100).unwrap_or(0);

    let raw_score = sector_score
        .checked_add(mci).unwrap()
        .checked_sub(region.volatility_penalty as i64).unwrap();

    // Normalize to 0-100
    let mut final_dominance = if raw_score < 0 { 0 } else { raw_score as u8 };
    if final_dominance > 100 { final_dominance = 100; }

    region.dominance = final_dominance;

    // Decay volatility penalty
    if region.volatility_penalty > 0 {
        region.volatility_penalty -= 1;
    }

    msg!("Region {} dominance updated to {}", region.id, region.dominance);
    Ok(())
}
