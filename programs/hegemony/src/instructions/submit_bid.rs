use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(region_id: u8, amount: u64, manifesto_uri: String)]
pub struct SubmitManifestoBid<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.status == GameStatus::PreEpoch @ ErrorCode::InvalidStatus
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [LEADERBOARD_SEED, &[region_id]],
        bump = leaderboard.bump,
    )]
    pub leaderboard: Account<'info, RegionLeaderboard>,

    #[account(
        init_if_needed,
        payer = bidder,
        space = 8 + BidderEscrow::INIT_SPACE,
        seeds = [ESCROW_SEED, bidder.key().as_ref(), &[region_id]],
        bump
    )]
    pub escrow: Account<'info, BidderEscrow>,

    #[account(mut)]
    pub bidder: Signer<'info>,

    #[account(
        mut,
        constraint = bidder_token_account.owner == bidder.key(),
        constraint = bidder_token_account.mint == global_state.capital_mint
    )]
    pub bidder_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_token_account.owner == global_state.key(),
        constraint = vault_token_account.mint == global_state.capital_mint
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn submit_manifesto_bid_handler(
    ctx: Context<SubmitManifestoBid>,
    region_id: u8,
    amount: u64,
    manifesto_uri: String,
) -> Result<()> {
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
                from: ctx.accounts.bidder_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.bidder.to_account_info(),
            },
        ),
        amount,
    )?;

    // 2. Update Escrow
    let escrow = &mut ctx.accounts.escrow;
    escrow.owner = ctx.accounts.bidder.key();
    escrow.region_id = region_id;
    escrow.manifesto_uri = manifesto_uri.clone();
    escrow.principal_capital = escrow.principal_capital.checked_add(amount).ok_or(ErrorCode::Overflow)?;
    escrow.bump = ctx.bumps.escrow;

    // 3. Update Leaderboard if needed
    let leaderboard = &mut ctx.accounts.leaderboard;
    let total_weight = escrow.principal_capital.checked_add(escrow.delegated_capital).ok_or(ErrorCode::Overflow)?;
    
    if total_weight > leaderboard.total_bid_weight {
        leaderboard.current_leader = ctx.accounts.bidder.key();
        leaderboard.leader_manifesto_uri = manifesto_uri;
        leaderboard.total_bid_weight = total_weight;
        msg!("New leader for region {}: {}", region_id, leaderboard.current_leader);
    }

    Ok(())
}
