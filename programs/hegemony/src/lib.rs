pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("79yvXQvVyqMYy4ofqKQD1CZXQSyH5eJ7dHT6ZZuXg7ND");

#[program]
pub mod hegemony {
    use super::*;

    pub fn initialize_global_state(
        ctx: Context<InitializeGlobalState>,
        auction_duration: i64,
        epoch_duration: i64,
    ) -> Result<()> {
        initialize::initialize_global_state_handler(ctx, auction_duration, epoch_duration)
    }

    pub fn initialize_region(
        ctx: Context<InitializeRegion>,
        region_id: u8,
        resource_yield: u64,
    ) -> Result<()> {
        initialize_region::initialize_region_handler(ctx, region_id, resource_yield)
    }

    pub fn initialize_leaderboard(
        ctx: Context<InitializeLeaderboard>,
        region_id: u8,
    ) -> Result<()> {
        initialize_leaderboard::initialize_leaderboard_handler(ctx, region_id)
    }

    pub fn submit_manifesto_bid(
        ctx: Context<SubmitManifestoBid>,
        region_id: u8,
        amount: u64,
        manifesto_uri: String,
    ) -> Result<()> {
        submit_bid::submit_manifesto_bid_handler(ctx, region_id, amount, manifesto_uri)
    }

    pub fn delegate_to_bidder(
        ctx: Context<DelegateToBidder>,
        amount: u64,
    ) -> Result<()> {
        delegate::delegate_to_bidder_handler(ctx, amount)
    }

    pub fn resolve_auction(ctx: Context<ResolveAuction>) -> Result<()> {
        resolve_auction::resolve_auction_handler(ctx)
    }

    pub fn advance_turn(ctx: Context<AdvanceTurn>) -> Result<()> {
        process_income::advance_turn_handler(ctx)
    }

    pub fn process_region_income(ctx: Context<ProcessRegionIncome>) -> Result<()> {
        process_income::process_region_income_handler(ctx)
    }

    pub fn set_region_owner(ctx: Context<SetRegionOwner>, owner: Pubkey) -> Result<()> {
        set_region_owner::set_region_owner_handler(ctx, owner)
    }
}
