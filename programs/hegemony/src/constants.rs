use anchor_lang::prelude::*;

#[constant]
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";

#[constant]
pub const REGION_SEED: &[u8] = b"region";

#[constant]
pub const TURN_DURATION: i64 = 5; // Set to 5 seconds for testing
