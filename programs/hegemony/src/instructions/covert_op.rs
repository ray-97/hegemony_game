use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
#[instruction(initiator_region_id: u8)]
pub struct InitiateCovertOp<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::Active @ HegemonyError::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[target_region.id]],
        bump = target_region.bump,
    )]
    pub target_region: Account<'info, RegionAccount>,

    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.region_id == target_region.id @ HegemonyError::InvalidStatus,
        constraint = market.resolution_state == ResolutionState::Unresolved @ HegemonyError::MarketResolved
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(
        mut,
        seeds = [DIPLOMACY_SEED, initiator.key().as_ref()],
        bump = initiator_diplomacy.bump,
        constraint = initiator_diplomacy.region_id == initiator_region_id @ HegemonyError::InvalidStatus
    )]
    pub initiator_diplomacy: Account<'info, DiplomaticInfluenceAccount>,

    #[account(mut)]
    pub initiator: Signer<'info>,

    #[account(
        mut,
        constraint = initiator_capital_account.owner == initiator.key(),
        constraint = initiator_capital_account.mint == global_state.capital_mint
    )]
    pub initiator_capital_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = market_vault.key() == market.capital_vault
    )]
    pub market_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    
    // In a real implementation, we would include Switchboard/Pyth VRF accounts here
}

pub fn initiate_covert_op_handler(
    ctx: Context<InitiateCovertOp>,
    initiator_region_id: u8,
) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let initiator_diplomacy = &mut ctx.accounts.initiator_diplomacy;
    let target_region = &ctx.accounts.target_region;

    // 1. Calculate DI cost based on target region's dominance
    // cost = 10 * D_r
    let di_cost = (target_region.dominance as u64).checked_mul(10).ok_or(HegemonyError::Overflow)?;
    
    if initiator_diplomacy.influence < di_cost {
        return Err(HegemonyError::InsufficientInfluence.into());
    }

    // 2. Consume DI
    initiator_diplomacy.influence = initiator_diplomacy.influence.checked_sub(di_cost).ok_or(HegemonyError::Overflow)?;
    initiator_diplomacy.last_action_turn = global_state.turn;

    // 3. Transfer Capital fee to the market vault (this acts as "YES" liquidity injection per spec)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.initiator_capital_account.to_account_info(),
                to: ctx.accounts.market_vault.to_account_info(),
                authority: ctx.accounts.initiator.to_account_info(),
            },
        ),
        COVERT_OP_COST,
    )?;

    // 4. Update Market Pools (inject YES liquidity)
    // Per spec: Remainder is injected as YES liquidity (widening profit margin for attacker wining NO bet)
    // Wait, the spec says "widening profit margin for attacker if they win their NO bet". 
    // Usually, Covert Op success = YES. So attacker would buy NO shares first, then trigger Op.
    // If they inject YES liquidity, price of YES drops? No, if they inject $CAP into YES pool, YES price rises.
    
    let market = &mut ctx.accounts.market;
    market.pool_yes = market.pool_yes.checked_add(COVERT_OP_COST).ok_or(HegemonyError::Overflow)?;

    msg!("Covert Op initiated against region {}. DI cost: {}", target_region.id, di_cost);
    
    // In a real implementation, we would now request randomness from a VRF.
    Ok(())
}
