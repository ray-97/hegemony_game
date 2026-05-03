use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct DelegateToBidder<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::PreEpoch @ ErrorCode::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [LEADERBOARD_SEED, &[escrow.region_id]],
        bump = leaderboard.bump,
    )]
    pub leaderboard: Account<'info, RegionLeaderboard>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.owner.as_ref(), &[escrow.region_id]],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, BidderEscrow>,

    #[account(mut)]
    pub delegate: Signer<'info>,

    #[account(
        mut,
        constraint = delegate_token_account.owner == delegate.key(),
        constraint = delegate_token_account.mint == global_state.capital_mint
    )]
    pub delegate_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_token_account.owner == global_state.key(),
        constraint = vault_token_account.mint == global_state.capital_mint
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn delegate_to_bidder_handler(ctx: Context<DelegateToBidder>, amount: u64) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let clock = Clock::get()?;

    if clock.unix_timestamp > global_state.auction_end_time {
        return Err(ErrorCode::AuctionEnded.into());
    }

    // 1. Transfer $CAP to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.delegate_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.delegate.to_account_info(),
            },
        ),
        amount,
    )?;

    // 2. Update Escrow
    let escrow = &mut ctx.accounts.escrow;
    escrow.delegated_capital = escrow.delegated_capital.checked_add(amount).ok_or(ErrorCode::Overflow)?;

    // 3. Update Leaderboard if needed
    let leaderboard = &mut ctx.accounts.leaderboard;
    let total_weight = escrow.principal_capital.checked_add(escrow.delegated_capital).ok_or(ErrorCode::Overflow)?;
    
    if total_weight > leaderboard.total_bid_weight {
        leaderboard.current_leader = escrow.owner;
        leaderboard.leader_manifesto_uri = escrow.manifesto_uri.clone();
        leaderboard.total_bid_weight = total_weight;
        msg!("New leader for region {}: {} via delegation", escrow.region_id, leaderboard.current_leader);
    }

    Ok(())
}
