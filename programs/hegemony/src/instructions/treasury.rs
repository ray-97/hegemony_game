use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        constraint = capital_mint.key() == global_state.capital_mint
    )]
    pub capital_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = treasury.key() == global_state.treasury
    )]
    /// CHECK: Treasury vault receiving SOL
    pub treasury: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = capital_mint,
        associated_token::authority = user
    )]
    pub user_capital_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn deposit_sol_handler(ctx: Context<DepositSol>, amount_lamports: u64) -> Result<()> {
    // 1. Transfer SOL from user to treasury
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.treasury.key(),
        amount_lamports,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;

    // 2. Mint $CAP tokens (1000 per SOL, so 1 per 1,000,000 lamports if decimals match, 
    // but let's just use a fixed rate: 1 lamport -> 1000 'units' of Capital if decimals are 9)
    // Actually, let's say 1 SOL (1e9 lamports) = 1000 $CAP (with 9 decimals = 1000e9 units)
    // So multiplier is 1000.
    
    let capital_to_mint = amount_lamports.checked_mul(1000).ok_or(HegemonyError::Overflow)?;

    let global_state = &ctx.accounts.global_state;
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
                to: ctx.accounts.user_capital_account.to_account_info(),
                authority: global_state.to_account_info(),
            },
            signer,
        ),
        capital_to_mint,
    )?;

    msg!("Deposited {} lamports for {} Capital units", amount_lamports, capital_to_mint);
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        constraint = capital_mint.key() == global_state.capital_mint
    )]
    pub capital_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = treasury.key() == global_state.treasury
    )]
    /// CHECK: Treasury vault holding SOL
    pub treasury: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_capital_account.owner == user.key(),
        constraint = user_capital_account.mint == capital_mint.key()
    )]
    pub user_capital_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_sol_handler(ctx: Context<WithdrawSol>, amount_capital: u64) -> Result<()> {
    // 1. Calculate SOL to return (1 SOL = 1000 $CAP)
    // amount_capital is in units (with 9 decimals)
    let sol_to_return = amount_capital.checked_div(1000).ok_or(HegemonyError::Overflow)?;

    // 2. Burn Capital tokens from user
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Burn {
                mint: ctx.accounts.capital_mint.to_account_info(),
                from: ctx.accounts.user_capital_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_capital,
    )?;

    // 3. Transfer SOL from treasury to user
    // Since treasury is a PDA or controlled account, we use sub-lamports transfer
    **ctx.accounts.treasury.try_borrow_mut_lamports()? = ctx.accounts.treasury.lamports()
        .checked_sub(sol_to_return).ok_or(HegemonyError::Overflow)?;
    **ctx.accounts.user.try_borrow_mut_lamports()? = ctx.accounts.user.lamports()
        .checked_add(sol_to_return).ok_or(HegemonyError::Overflow)?;

    msg!("Withdrew {} lamports by burning {} Capital units", sol_to_return, amount_capital);
    Ok(())
}
