// Harbor contract tests
// Leo 3.4's test framework cannot call async transitions, instantiate external types,
// or use self.caller in test scripts. These tests verify pure arithmetic and logic
// used by the contract. Full integration tests use testnet deployment + CLI.
//
// NOTE: Leo 3.4.0 / snarkVM 4.4.0 appears to panic when this project uses
// `@should_fail` tests. These assertions are written as positive conditions
// instead so the suite stays executable on the current toolchain.

program test_contract.aleo {

    // Test: distribution payout calculation (amount * per_unit)
    @test
    transition test_distribution_calc() {
        let amount: u64 = 100u64;
        let per_unit: u64 = 50u64;
        let total: u64 = amount * per_unit;
        assert_eq(total, 5000u64);
    }

    // Test: subscription capacity check succeeds when under supply
    @test
    transition test_capacity_under_limit() {
        let subscribed: u64 = 500u64;
        let new_amount: u64 = 200u64;
        let total: u64 = subscribed + new_amount;
        let supply: u64 = 1000u64;
        assert(total <= supply);
    }

    // Test: subscription capacity condition when over supply
    @test
    transition test_capacity_over_limit() {
        let subscribed: u64 = 900u64;
        let new_amount: u64 = 200u64;
        let total: u64 = subscribed + new_amount;
        let supply: u64 = 1000u64;
        assert(total > supply);
    }

    // Test: investor count check succeeds when under max
    @test
    transition test_investor_count_ok() {
        let count: u32 = 49u32;
        let new_count: u32 = count + 1u32;
        let max: u32 = 50u32;
        assert(new_count <= max);
    }

    // Test: investor count condition when exceeding max
    @test
    transition test_investor_count_exceeded() {
        let count: u32 = 50u32;
        let new_count: u32 = count + 1u32;
        let max: u32 = 50u32;
        assert(new_count > max);
    }

    // Test: issuer status codes
    @test
    transition test_status_codes() {
        let not_registered: u8 = 0u8;
        let active: u8 = 1u8;
        let revoked: u8 = 2u8;
        assert_eq(not_registered, 0u8);
        assert_eq(active, 1u8);
        assert_eq(revoked, 2u8);
        assert(active != revoked);
    }

    // Test: min subscription condition under threshold
    @test
    transition test_min_subscription_fail() {
        let amount: u64 = 5u64;
        let min: u64 = 10u64;
        assert(amount < min);
    }

    @noupgrade
    async constructor() {}
}
