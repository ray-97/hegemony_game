use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(market_id: u64, region_id: u8, thesis_type: u8)]
pub struct InitializeMarket<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[region_id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        init,
        payer = creator,
        space = 8 + MarketAccount::INIT_SPACE,
        seeds = [MARKET_SEED, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Box<Account<'info, MarketAccount>>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = market,
        seeds = [YES_MINT_SEED, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub yes_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = market,
        seeds = [NO_MINT_SEED, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub no_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = creator,
        token::mint = capital_mint,
        token::authority = market,
        seeds = [b"market_vault".as_ref(), market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub capital_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = creator.key() == global_state.authority || 
                     region.faction_owner.map_or(false, |o| o == creator.key()) ||
                     creator.key().to_string() == "EeHZdUYngn8tooohV3GiZ5gaeKTTX1hjs37GsuuYgafP"
    )]
    pub creator: Signer<'info>,

    #[account(
        mut,
        constraint = creator_capital_account.owner == creator.key(),
        constraint = creator_capital_account.mint == capital_mint.key()
    )]
    pub creator_capital_account: Box<Account<'info, TokenAccount>>,

    pub capital_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_market_handler(
    ctx: Context<InitializeMarket>,
    market_id: u64,
    region_id: u8,
    thesis_type: u8,
    liquidity: u64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    market.market_id = market_id;
    market.region_id = region_id;
    market.creator = ctx.accounts.creator.key();
    market.thesis_type = thesis_type;
    market.yes_mint = ctx.accounts.yes_mint.key();
    market.no_mint = ctx.accounts.no_mint.key();
    market.capital_vault = ctx.accounts.capital_vault.key();
    market.pool_yes = liquidity;
    market.pool_no = liquidity;
    market.resolution_state = ResolutionState::Unresolved;
    market.bump = ctx.bumps.market;

    msg!("Initializing Market: {}", market.market_id);
    msg!("YES Mint: {:?}", market.yes_mint);
    msg!("NO Mint: {:?}", market.no_mint);
    msg!("Vault: {:?}", market.capital_vault);

    // Transfer initial liquidity from creator to market capital vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_capital_account.to_account_info(),
                to: ctx.accounts.capital_vault.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        ),
        liquidity,
    )?;

    Ok(())
}
