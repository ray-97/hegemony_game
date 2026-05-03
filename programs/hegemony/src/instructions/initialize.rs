use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializeGlobalState<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury vault or account
    pub treasury: UncheckedAccount<'info>,

    /// CHECK: Capital SPL Token Mint
    pub capital_mint: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_global_state_handler(
    ctx: Context<InitializeGlobalState>,
    auction_duration: i64,
    epoch_duration: i64,
) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let clock = Clock::get()?;

    global_state.epoch = 1;
    global_state.turn = 0;
    global_state.start_time = clock.unix_timestamp;
    global_state.auction_end_time = clock.unix_timestamp.checked_add(auction_duration).unwrap();
    global_state.end_time = clock.unix_timestamp.checked_add(epoch_duration).unwrap();
    global_state.last_turn_timestamp = clock.unix_timestamp;
    global_state.status = GameStatus::PreEpoch;
    global_state.authority = ctx.accounts.authority.key();
    global_state.treasury = ctx.accounts.treasury.key();
    global_state.capital_mint = ctx.accounts.capital_mint.key();
    global_state.bump = ctx.bumps.global_state;

    Ok(())
}
