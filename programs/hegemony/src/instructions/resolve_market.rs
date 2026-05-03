use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.resolution_state == ResolutionState::Unresolved @ ErrorCode::MarketResolved
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

pub fn resolve_market_handler(
    ctx: Context<ResolveMarket>,
    outcome: bool, // true for YES, false for NO
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    if outcome {
        market.resolution_state = ResolutionState::ResolvedYes;
    } else {
        market.resolution_state = ResolutionState::ResolvedNo;
    }

    msg!("Market {} resolved as: {:?}", market.market_id, market.resolution_state);
    Ok(())
}
