use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, MintTo, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct TradeShares<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.resolution_state == ResolutionState::Unresolved @ ErrorCode::MarketResolved
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
        mut,
        constraint = vault_token_account.key() == market.capital_vault
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = trader_capital_account.owner == trader.key(),
        constraint = trader_capital_account.mint == vault_token_account.mint
    )]
    pub trader_capital_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = yes_mint.key() == market.yes_mint
    )]
    pub yes_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = no_mint.key() == market.no_mint
    )]
    pub no_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = yes_mint,
        associated_token::authority = trader
    )]
    pub trader_yes_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = no_mint,
        associated_token::authority = trader
    )]
    pub trader_no_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn trade_shares_handler(
    ctx: Context<TradeShares>,
    is_buying_yes: bool,
    amount_capital: u64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    if amount_capital == 0 {
        return Err(ErrorCode::InvalidAmmCalculation.into());
    }

    // Calculate AMM swap
    let k = (market.pool_yes as u128).checked_mul(market.pool_no as u128).ok_or(ErrorCode::Overflow)?;
    
    let mut shares_to_mint = amount_capital;

    if is_buying_yes {
        let new_pool_no = market.pool_no.checked_add(amount_capital).ok_or(ErrorCode::Overflow)?;
        // Round UP to ensure k does not decrease
        let new_pool_yes = k.checked_add(new_pool_no as u128).unwrap().checked_sub(1).unwrap()
            .checked_div(new_pool_no as u128).ok_or(ErrorCode::InvalidAmmCalculation)? as u64;
        
        let dy = market.pool_yes.checked_sub(new_pool_yes).ok_or(ErrorCode::InvalidAmmCalculation)?;
        shares_to_mint = shares_to_mint.checked_add(dy).ok_or(ErrorCode::Overflow)?;

        market.pool_yes = new_pool_yes;
        market.pool_no = new_pool_no;
    } else {
        let new_pool_yes = market.pool_yes.checked_add(amount_capital).ok_or(ErrorCode::Overflow)?;
        let new_pool_no = k.checked_add(new_pool_yes as u128).unwrap().checked_sub(1).unwrap()
            .checked_div(new_pool_yes as u128).ok_or(ErrorCode::InvalidAmmCalculation)? as u64;
        
        let dy = market.pool_no.checked_sub(new_pool_no).ok_or(ErrorCode::InvalidAmmCalculation)?;
        shares_to_mint = shares_to_mint.checked_add(dy).ok_or(ErrorCode::Overflow)?;

        market.pool_yes = new_pool_yes;
        market.pool_no = new_pool_no;
    }

    // 1. Transfer $CAP from trader to vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.trader_capital_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.trader.to_account_info(),
            },
        ),
        amount_capital,
    )?;

    let market_id_bytes = market.market_id.to_le_bytes();
    let seeds = &[
        MARKET_SEED,
        market_id_bytes.as_ref(),
        &[market.bump],
    ];
    let signer = &[&seeds[..]];

    // 2. Mint desired shares to trader
    if is_buying_yes {
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.yes_mint.to_account_info(),
                    to: ctx.accounts.trader_yes_account.to_account_info(),
                    authority: market.to_account_info(),
                },
                signer,
            ),
            shares_to_mint,
        )?;
    } else {
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.no_mint.to_account_info(),
                    to: ctx.accounts.trader_no_account.to_account_info(),
                    authority: market.to_account_info(),
                },
                signer,
            ),
            shares_to_mint,
        )?;
    }

    Ok(())
}
