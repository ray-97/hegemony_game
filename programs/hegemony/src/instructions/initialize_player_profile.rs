use anchor_lang::prelude::*;
use crate::state::PlayerProfile;

#[derive(Accounts)]
pub struct InitializePlayerProfile<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + PlayerProfile::INIT_SPACE,
        seeds = [b"player_profile", authority.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, PlayerProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_player_profile_handler(ctx: Context<InitializePlayerProfile>, name: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    profile.name = name;
    profile.authority = ctx.accounts.authority.key();
    profile.bump = ctx.bumps.profile;
    Ok(())
}
