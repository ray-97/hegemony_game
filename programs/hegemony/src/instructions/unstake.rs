use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Burn, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct UnstakeCapital<'info> {
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
        seeds = [BOND_MINT_SEED, &[region.id]],
        bump,
    )]
    pub bond_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = bond_vault.key() == region.bond_vault
    )]
    pub bond_vault: Account<'info, TokenAccount>,

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
        constraint = user_bond_account.owner == user.key(),
        constraint = user_bond_account.mint == bond_mint.key()
    )]
    pub user_bond_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<UnstakeCapital>, bond_amount: u64) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let region = &ctx.accounts.region;
    let bond_mint = &ctx.accounts.bond_mint;
    let bond_vault = &ctx.accounts.bond_vault;

    if bond_amount == 0 {
        return Ok(());
    }

    // 1. Calculate Exchange Rate
    // Payout = (bond_amount * vault_balance) / total_bond_supply
    let vault_balance = bond_vault.amount;
    let total_supply = bond_mint.supply;

    let payout = (bond_amount as u128)
        .checked_mul(vault_balance as u128).ok_or(ErrorCode::Overflow)?
        .checked_div(total_supply as u128).ok_or(ErrorCode::Overflow)? as u64;

    // 2. Burn $BOND tokens
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: bond_mint.to_account_info(),
                from: ctx.accounts.user_bond_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        bond_amount,
    )?;

    // 3. Transfer $CAP from vault to user
    let seeds = &[
        GLOBAL_STATE_SEED,
        &[global_state.bump],
    ];
    let signer = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: bond_vault.to_account_info(),
                to: ctx.accounts.user_capital_account.to_account_info(),
                authority: global_state.to_account_info(),
            },
            signer,
        ),
        payout,
    )?;

    msg!("User unstaked {} $BOND and received {} $CAP from region {}", bond_amount, payout, region.id);
    Ok(())
}
