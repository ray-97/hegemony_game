use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Burn, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.resolution_state != ResolutionState::Unresolved @ ErrorCode::MarketUnresolved
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = vault_token_account.key() == market.capital_vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_capital_account.owner == user.key(),
        constraint = user_capital_account.mint == vault_token_account.mint
    )]
    pub user_capital_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_winning_shares.owner == user.key(),
        constraint = user_winning_shares.mint == (if market.resolution_state == ResolutionState::ResolvedYes { market.yes_mint } else { market.no_mint })
    )]
    pub user_winning_shares: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = winning_mint.key() == (if market.resolution_state == ResolutionState::ResolvedYes { market.yes_mint } else { market.no_mint })
    )]
    pub winning_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn claim_payout_handler(ctx: Context<ClaimPayout>) -> Result<()> {
    let market = &ctx.accounts.market;
    let amount = ctx.accounts.user_winning_shares.amount;

    if amount == 0 {
        return Ok(());
    }

    // Burn the winning shares
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.winning_mint.to_account_info(),
                from: ctx.accounts.user_winning_shares.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            }
        ),
        amount,
    )?;

    // Transfer $CAP from vault to user
    let market_id_bytes = market.market_id.to_le_bytes();
    let seeds = &[
        MARKET_SEED,
        market_id_bytes.as_ref(),
        &[market.bump],
    ];
    let signer = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_capital_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer,
        ),
        amount,
    )?;

    Ok(())
}
