use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct ResolveKineticMarket<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.resolution_state == ResolutionState::Unresolved @ ErrorCode::MarketResolved
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[market.region_id]],
        bump = target_region.bump,
    )]
    pub target_region: Account<'info, RegionAccount>,

    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key()
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn resolve_kinetic_market_handler(
    ctx: Context<ResolveKineticMarket>,
    outcome: bool, // true for success (YES), false for failure (NO)
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let target_region = &mut ctx.accounts.target_region;

    if outcome {
        market.resolution_state = ResolutionState::ResolvedYes;
        
        // Successful Kinetic Event (e.g., Sabotage)
        // 1. Reduce Energy Infrastructure
        if target_region.energy_level > 0 {
            target_region.energy_level -= 1;
        }
        
        // 2. Apply Volatility Penalty
        target_region.volatility_penalty = target_region.volatility_penalty.checked_add(50).unwrap_or(255); // Caps at u16 max but logic uses it as small penalty

        // 3. Status Change if dominance low
        if target_region.dominance < 20 {
            target_region.status = RegionStatus::Contested;
        }

        msg!("Kinetic Event SUCCESS. Region {} infrastructure degraded.", target_region.id);
    } else {
        market.resolution_state = ResolutionState::ResolvedNo;
        msg!("Kinetic Event FAILED. Region {} remains stable.", target_region.id);
    }

    Ok(())
}
