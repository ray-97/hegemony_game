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

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        region_id: u8,
        thesis_type: ThesisType,
        liquidity: u64,
    ) -> Result<()> {
        initialize_market::initialize_market_handler(ctx, market_id, region_id, thesis_type, liquidity)
    }

    pub fn trade_shares(
        ctx: Context<TradeShares>,
        is_buying_yes: bool,
        amount_capital: u64,
    ) -> Result<()> {
        trade_shares::trade_shares_handler(ctx, is_buying_yes, amount_capital)
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        outcome: bool,
    ) -> Result<()> {
        resolve_market::resolve_market_handler(ctx, outcome)
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        claim_payout::claim_payout_handler(ctx)
    }

    pub fn initialize_diplomacy(ctx: Context<InitializeDiplomacy>) -> Result<()> {
        initialize_diplomacy::handler(ctx)
    }

    pub fn initiate_covert_op(ctx: Context<InitiateCovertOp>, initiator_region_id: u8) -> Result<()> {
        covert_op::initiate_covert_op_handler(ctx, initiator_region_id)
    }

    pub fn resolve_kinetic_market(ctx: Context<ResolveKineticMarket>, outcome: bool) -> Result<()> {
        resolve_kinetic::resolve_kinetic_market_handler(ctx, outcome)
    }

    pub fn end_epoch(ctx: Context<EndEpoch>) -> Result<()> {
        end_epoch::handler(ctx)
    }

    pub fn claim_epoch_yield(ctx: Context<ClaimEpochYield>) -> Result<()> {
        claim_epoch_yield::handler(ctx)
    }
}
