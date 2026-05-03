use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct ClaimEpochYield<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::Ended @ ErrorCode::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"delegation", user.key().as_ref(), winning_escrow.key().as_ref()],
        bump = delegation_record.bump,
        constraint = delegation_record.leader == global_state.hegemon.ok_or(ErrorCode::InvalidStatus)?
    )]
    pub delegation_record: Account<'info, DelegationRecord>,

    #[account(
        seeds = [ESCROW_SEED, global_state.hegemon.unwrap().as_ref(), &[delegation_record.region_id]],
        bump = winning_escrow.bump,
    )]
    pub winning_escrow: Account<'info, BidderEscrow>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_capital_account.owner == user.key(),
        constraint = user_capital_account.mint == global_state.capital_mint
    )]
    pub user_capital_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_token_account.owner == global_state.key(),
        constraint = vault_token_account.mint == global_state.capital_mint
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimEpochYield>) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let record = &mut ctx.accounts.delegation_record;
    let escrow = &ctx.accounts.winning_escrow;

    if record.amount == 0 {
        return Ok(());
    }

    // Payout = (user_delegation * prize_pool) / total_leader_weight
    let total_weight = escrow.principal_capital.checked_add(escrow.delegated_capital).ok_or(ErrorCode::Overflow)?;
    
    // For MVP, prize pool is exactly the total weight (simulating return of principal)
    let prize_pool = total_weight;
    
    let payout = (record.amount as u128)
        .checked_mul(prize_pool as u128).ok_or(ErrorCode::Overflow)?
        .checked_div(total_weight as u128).ok_or(ErrorCode::Overflow)? as u64;

    if payout > 0 {
        let seeds = &[
            GLOBAL_STATE_SEED,
            &[global_state.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.user_capital_account.to_account_info(),
                    authority: global_state.to_account_info(),
                },
                signer,
            ),
            payout,
        )?;
    }

    // Mark as claimed
    record.amount = 0;

    Ok(())
}
