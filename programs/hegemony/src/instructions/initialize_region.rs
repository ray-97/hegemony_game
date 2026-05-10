use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(region_id: u8)]
pub struct InitializeRegion<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RegionAccount::INIT_SPACE,
        seeds = [REGION_SEED, &[region_id]],
        bump
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = global_state,
        seeds = [BOND_MINT_SEED, &[region_id]],
        bump
    )]
    pub bond_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = capital_mint,
        token::authority = global_state,
        seeds = [VAULT_SEED, &[region_id]],
        bump
    )]
    pub bond_vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key()
    )]
    pub global_state: Account<'info, GlobalState>,

    pub capital_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_region_handler(
    ctx: Context<InitializeRegion>,
    region_id: u8,
    resource_yield: u64,
    energy_level: u8,
    tech_level: u8,
    logistics_level: u8,
) -> Result<()> {
    let region = &mut ctx.accounts.region;
    
    region.id = region_id;
    region.dominance = 20; // Starting baseline
    region.energy_level = energy_level;
    region.tech_level = tech_level;
    region.logistics_level = logistics_level;
    region.faction_owner = None;
    region.resource_yield = resource_yield;
    region.bond_mint = ctx.accounts.bond_mint.key();
    region.bond_vault = ctx.accounts.bond_vault.key();
    region.status = RegionStatus::Stable;
    region.volatility_penalty = 0;
    region.last_income_turn = 0;
    region.bump = ctx.bumps.region;

    Ok(())
}
