use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct AdvanceTurn<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn advance_turn_handler(ctx: Context<AdvanceTurn>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let clock = Clock::get()?;

    let elapsed = clock.unix_timestamp.checked_sub(global_state.last_turn_timestamp).ok_or(ErrorCode::Overflow)?;
    
    if elapsed < TURN_DURATION {
        return Err(ErrorCode::TurnNotReady.into());
    }

    global_state.turn = global_state.turn.checked_add(1).ok_or(ErrorCode::Overflow)?;
    global_state.last_turn_timestamp = clock.unix_timestamp;

    msg!("Turn advanced to {}", global_state.turn);
    Ok(())
}

#[derive(Accounts)]
pub struct ProcessRegionIncome<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[region.id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        mut,
        constraint = capital_mint.key() == global_state.capital_mint
    )]
    pub capital_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = destination_token_account.owner == region.faction_owner.ok_or(ErrorCode::InvalidOwner)?
    )]
    pub destination_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn process_region_income_handler(ctx: Context<ProcessRegionIncome>) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let region = &mut ctx.accounts.region;

    if region.last_income_turn >= global_state.turn {
        return Err(ErrorCode::IncomeAlreadyProcessed.into());
    }

    // Yield = resource_yield * (1 + infra_level) * (dominance / 100)
    let infra_multiplier = (region.infrastructure_level as u64).checked_add(1).ok_or(ErrorCode::Overflow)?;
    let base_yield = region.resource_yield.checked_mul(infra_multiplier).ok_or(ErrorCode::Overflow)?;
    let total_yield = base_yield
        .checked_mul(region.dominance as u64)
        .ok_or(ErrorCode::Overflow)?
        .checked_div(100)
        .ok_or(ErrorCode::Overflow)?;

    if total_yield > 0 {
        let seeds = &[
            GLOBAL_STATE_SEED,
            &[global_state.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.capital_mint.to_account_info(),
                    to: ctx.accounts.destination_token_account.to_account_info(),
                    authority: global_state.to_account_info(),
                },
                signer,
            ),
            total_yield,
        )?;
    }

    region.last_income_turn = global_state.turn;

    msg!("Processed income for region {}: {} Capital", region.id, total_yield);
    Ok(())
}
