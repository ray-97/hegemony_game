use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, MintTo, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct StakeCapital<'info> {
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
        init_if_needed,
        payer = user,
        associated_token::mint = bond_mint,
        associated_token::authority = user
    )]
    pub user_bond_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<StakeCapital>, amount: u64) -> Result<()> {
    let global_state = &ctx.accounts.global_state;
    let region = &ctx.accounts.region;

    // 1. Transfer $CAP from user to region vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_capital_account.to_account_info(),
                to: ctx.accounts.bond_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // 2. Mint $BOND tokens to user (1:1 during stake)
    let seeds = &[
        GLOBAL_STATE_SEED,
        &[global_state.bump],
    ];
    let signer = &[&seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.bond_mint.to_account_info(),
                to: ctx.accounts.user_bond_account.to_account_info(),
                authority: global_state.to_account_info(),
            },
            signer,
        ),
        amount,
    )?;

    msg!("User staked {} $CAP into region {}", amount, region.id);
    Ok(())
}
