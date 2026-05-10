use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Mint, TokenAccount, Token};
use crate::state::*;
use crate::constants::*;
use crate::error::HegemonyError;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, &market.market_id.to_le_bytes()],
        bump = market.bump,
        constraint = market.resolution_state == ResolutionState::Unresolved @ HegemonyError::MarketResolved
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(
        mut,
        seeds = [REGION_SEED, &[market.region_id]],
        bump = region.bump,
    )]
    pub region: Account<'info, RegionAccount>,

    #[account(
        mut,
        constraint = market_vault.key() == market.capital_vault
    )]
    pub market_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = bond_vault.key() == region.bond_vault
    )]
    pub bond_vault: Account<'info, TokenAccount>,

    pub yes_mint: Account<'info, Mint>,
    pub no_mint: Account<'info, Mint>,

    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key()
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn resolve_market_handler(
    ctx: Context<ResolveMarket>,
    outcome: bool, // true for YES, false for NO
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let region = &mut ctx.accounts.region;

    if outcome {
        market.resolution_state = ResolutionState::ResolvedYes;
    } else {
        market.resolution_state = ResolutionState::ResolvedNo;
    }

    // Infrastructure Logic: Update region levels on YES resolution
    if outcome {
        let event_index = market.market_id % 100;
        match event_index {
            0 | 1 => { // Energy Upgrades
                region.energy_level = region.energy_level.saturating_add(1).min(3);
                msg!("Region {} Energy Level increased to {}", region.id, region.energy_level);
            },
            2 | 3 => { // Tech Upgrades
                region.tech_level = region.tech_level.saturating_add(1).min(3);
                msg!("Region {} Tech Level increased to {}", region.id, region.tech_level);
            },
            4 | 5 => { // Logistics Upgrades
                region.logistics_level = region.logistics_level.saturating_add(1).min(3);
                msg!("Region {} Logistics Level increased to {}", region.id, region.logistics_level);
            },
            6 | 7 => { // Energy Shocks
                region.energy_level = region.energy_level.saturating_sub(1);
                msg!("Region {} Energy Level decreased to {}", region.id, region.energy_level);
            },
            8 | 9 => { // Tech Shocks
                region.tech_level = region.tech_level.saturating_sub(1);
                msg!("Region {} Tech Level decreased to {}", region.id, region.tech_level);
            },
            10 | 11 => { // Logistics Shocks
                region.logistics_level = region.logistics_level.saturating_sub(1);
                msg!("Region {} Logistics Level decreased to {}", region.id, region.logistics_level);
            },
            _ => {
                msg!("Market {} resolved with no direct sector impact.", market.market_id);
            }
        }
    }

    // Sweep Surplus Capital to Bond Vault
    let winning_supply = if outcome { ctx.accounts.yes_mint.supply } else { ctx.accounts.no_mint.supply };
    let vault_balance = ctx.accounts.market_vault.amount;

    if vault_balance > winning_supply {
        let surplus = vault_balance.checked_sub(winning_supply).unwrap();
        
        if surplus > 0 {
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
                        from: ctx.accounts.market_vault.to_account_info(),
                        to: ctx.accounts.bond_vault.to_account_info(),
                        authority: market.to_account_info(),
                    },
                    signer,
                ),
                surplus,
            )?;
            msg!("Swept {} surplus $CAP to region {} bond vault", surplus, region.id);
        }
    }

    msg!("Market {} resolved as: {:?}", market.market_id, market.resolution_state);
    Ok(())
}
