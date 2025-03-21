// Harbor: Private Real Estate RWA Platform on Aleo
// Program: harbor.aleo
// Privacy-preserving infrastructure for tokenized real-estate securities

program harbor.aleo {

    @noupgrade
    async constructor() {}

    // ═══════════════════════════════════════════════════════════════
    // HELPER STRUCTS (for hashing composite keys)
    // ═══════════════════════════════════════════════════════════════

    struct InvestorOffering {
        investor: address,
        offering_id: field,
    }

    struct ClaimKey {
        investor: address,
        distribution_id: field,
    }

    struct VoterKey {
        voter: address,
        proposal_id: field,
    }

    struct PositionKey {
        investor: address,
        offering_id: field,
        credential_hash: field,
        amount: u64,
    }

    struct PositionVoteKey {
        position_id: field,
        proposal_id: field,
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC STRUCTS (mapping values)
    // ═══════════════════════════════════════════════════════════════

    struct OfferingInfo {
        issuer: address,
        asset_hash: field,
        total_supply: u64,
        price_per_unit: u64,
        settlement_asset: u8,
        lockup_end: i64,
        accredited_only: bool,
        min_subscription: u64,
        max_investors: u32,
        is_active: bool,
    }

    struct OfferingMetadata {
        name: field,
        description_1: field,
        description_2: field,
        property_type: u8,
        location: field,
    }

    struct ProposalInfo {
        offering_id: field,
        proposer: address,
        description_hash: field,
        voting_end: i64,
        is_active: bool,
    }

    // ═══════════════════════════════════════════════════════════════
    // RECORDS (private state)
    // ═══════════════════════════════════════════════════════════════

    record ComplianceCredential {
        owner: address,
        issuer: address,
        jurisdiction: u8,
        accredited: bool,
        tier: u8,
        credential_hash: field,
        expiry: i64,
    }

    record Position {
        owner: address,
        position_id: field,
        offering_id: field,
        amount: u64,
        issuer: address,
    }

    record SubscriptionReceipt {
        owner: address,
        position_id: field,
        offering_id: field,
        amount: u64,
    }

    record TransferReceipt {
        owner: address,
        position_id: field,
        offering_id: field,
        amount: u64,
        buyer: address,
    }

    record DistributionReceipt {
        owner: address,
        distribution_id: field,
        offering_id: field,
        amount_received: u64,
    }

    record VoteReceipt {
        owner: address,
        position_id: field,
        proposal_id: field,
        vote: bool,
        weight: u64,
    }

    // ═══════════════════════════════════════════════════════════════
    // MAPPINGS (public state)
    // ═══════════════════════════════════════════════════════════════

    mapping issuer_registry: address => u8;
    mapping issuer_license_hash: address => field;
    mapping credential_issuer: field => address;
    mapping credential_owner: field => address;
    mapping investor_active_credential: address => field;
    mapping offering_exists: field => bool;
    mapping offerings: field => OfferingInfo;
    mapping offering_metadata: field => OfferingMetadata;
    mapping offering_count: u8 => u32;
    mapping offering_index: u32 => field;
    mapping offering_subscribed: field => u64;
    mapping offering_investor_count: field => u32;
    mapping investor_position_active: field => bool;
    mapping position_created_at: field => i64;
    mapping investor_whitelist: field => bool;
    mapping credential_status: field => u8;
    mapping distribution_exists: field => bool;
    mapping distributions: field => u64;
    mapping distribution_offering: field => field;
    mapping distribution_count: u8 => u32;
    mapping distribution_index: u32 => field;
    mapping distribution_claimed: field => bool;
    mapping proposal_exists: field => bool;
    mapping proposals: field => ProposalInfo;
    mapping proposal_count: u8 => u32;
    mapping proposal_index: u32 => field;
    mapping proposal_yes: field => u64;
    mapping proposal_no: field => u64;
    mapping voter_record: field => bool;
    mapping position_vote_record: field => bool;

    // ═══════════════════════════════════════════════════════════════
    // 1. REGISTER ISSUER
    // ═══════════════════════════════════════════════════════════════

    async transition register_issuer(license_hash: field) -> Future {
        return finalize_register_issuer(self.caller, license_hash);
    }

    async function finalize_register_issuer(caller: address, license_hash: field) {
        let status: u8 = issuer_registry.get_or_use(caller, 0u8);
        assert_eq(status, 0u8);
        issuer_registry.set(caller, 1u8);
        issuer_license_hash.set(caller, license_hash);
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. REVOKE ISSUER (self-revoke)
    // ═══════════════════════════════════════════════════════════════

    async transition revoke_issuer() -> Future {
        return finalize_revoke_issuer(self.caller);
    }

    async function finalize_revoke_issuer(caller: address) {
        let status: u8 = issuer_registry.get(caller);
        assert_eq(status, 1u8);
        issuer_registry.set(caller, 2u8);
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. ISSUE COMPLIANCE CREDENTIAL
    // ═══════════════════════════════════════════════════════════════

    async transition issue_compliance_credential(
        investor: address,
        jurisdiction: u8,
        accredited: bool,
        tier: u8,
        credential_hash: field,
        issued_at: i64,
        expiry: i64,
    ) -> (ComplianceCredential, Future) {
        assert(issued_at < expiry);

        let credential: ComplianceCredential = ComplianceCredential {
            owner: investor,
            issuer: self.caller,
            jurisdiction: jurisdiction,
            accredited: accredited,
            tier: tier,
            credential_hash: credential_hash,
            expiry: expiry,
        };

        return (credential, finalize_issue_credential(self.caller, investor, credential_hash));
    }

    async function finalize_issue_credential(caller: address, investor: address, credential_hash: field) {
        let status: u8 = issuer_registry.get(caller);
        assert_eq(status, 1u8);
        credential_status.set(credential_hash, 0u8);
        credential_issuer.set(credential_hash, caller);
        credential_owner.set(credential_hash, investor);
        investor_active_credential.set(investor, credential_hash);
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. REVOKE COMPLIANCE CREDENTIAL
    // ═══════════════════════════════════════════════════════════════

    async transition revoke_compliance_credential(credential_hash: field) -> Future {
        return finalize_revoke_credential(self.caller, credential_hash);
    }

    async function finalize_revoke_credential(caller: address, credential_hash: field) {
        let status: u8 = issuer_registry.get(caller);
        assert_eq(status, 1u8);

        let issuer: address = credential_issuer.get(credential_hash);
        assert_eq(issuer, caller);

        let owner: address = credential_owner.get(credential_hash);
        let active_credential: field = investor_active_credential.get_or_use(owner, 0field);
        if (active_credential == credential_hash) {
            investor_active_credential.set(owner, 0field);
        }
        credential_status.set(credential_hash, 1u8);
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. CREATE OFFERING
    // ═══════════════════════════════════════════════════════════════

    async transition create_offering(
        offering_id: field,
        name: field,
        description_1: field,
        description_2: field,
        property_type: u8,
        location: field,
        asset_hash: field,
        total_supply: u64,
        price_per_unit: u64,
        settlement_asset: u8,
        lockup_end: i64,
        accredited_only: bool,
        min_subscription: u64,
        max_investors: u32,
    ) -> Future {
        return finalize_create_offering(
            self.caller,
            offering_id,
            name,
            description_1,
            description_2,
            property_type,
            location,
            asset_hash,
            total_supply,
            price_per_unit,
            settlement_asset,
            lockup_end,
            accredited_only,
            min_subscription,
            max_investors,
        );
    }

    async function finalize_create_offering(
        caller: address,
        offering_id: field,
        name: field,
        description_1: field,
        description_2: field,
        property_type: u8,
        location: field,
        asset_hash: field,
        total_supply: u64,
        price_per_unit: u64,
        settlement_asset: u8,
        lockup_end: i64,
        accredited_only: bool,
        min_subscription: u64,
        max_investors: u32,
    ) {
        let status: u8 = issuer_registry.get(caller);
        assert_eq(status, 1u8);

        let existing: bool = offering_exists.get_or_use(offering_id, false);
        assert_eq(existing, false);

        let info: OfferingInfo = OfferingInfo {
            issuer: caller,
            asset_hash: asset_hash,
            total_supply: total_supply,
            price_per_unit: price_per_unit,
            settlement_asset: settlement_asset,
            lockup_end: lockup_end,
            accredited_only: accredited_only,
            min_subscription: min_subscription,
            max_investors: max_investors,
            is_active: true,
        };

        let metadata: OfferingMetadata = OfferingMetadata {
            name: name,
            description_1: description_1,
            description_2: description_2,
            property_type: property_type,
            location: location,
        };

        let count: u32 = offering_count.get_or_use(0u8, 0u32);

        offering_exists.set(offering_id, true);
        offerings.set(offering_id, info);
        offering_metadata.set(offering_id, metadata);
        offering_index.set(count, offering_id);
        offering_count.set(0u8, count + 1u32);
        offering_subscribed.set(offering_id, 0u64);
        offering_investor_count.set(offering_id, 0u32);
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. APPROVE INVESTOR
    // ═══════════════════════════════════════════════════════════════

    async transition approve_investor(investor: address, offering_id: field) -> Future {
        let key: InvestorOffering = InvestorOffering {
            investor: investor,
            offering_id: offering_id,
        };
        let hash: field = BHP256::hash_to_field(key);
        return finalize_approve_investor(self.caller, offering_id, hash);
    }

    async function finalize_approve_investor(caller: address, offering_id: field, whitelist_hash: field) {
        let info: OfferingInfo = offerings.get(offering_id);
        assert_eq(info.issuer, caller);
        investor_whitelist.set(whitelist_hash, true);
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. CLOSE OFFERING
    // ═══════════════════════════════════════════════════════════════

    async transition close_offering(offering_id: field) -> Future {
        return finalize_close_offering(self.caller, offering_id);
    }

    async function finalize_close_offering(caller: address, offering_id: field) {
        let info: OfferingInfo = offerings.get(offering_id);
        assert_eq(info.issuer, caller);

        let updated: OfferingInfo = OfferingInfo {
            issuer: info.issuer,
            asset_hash: info.asset_hash,
            total_supply: info.total_supply,
            price_per_unit: info.price_per_unit,
            settlement_asset: info.settlement_asset,
            lockup_end: info.lockup_end,
            accredited_only: info.accredited_only,
            min_subscription: info.min_subscription,
            max_investors: info.max_investors,
            is_active: false,
        };

        offerings.set(offering_id, updated);
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. SUBSCRIBE TO OFFERING
    // ═══════════════════════════════════════════════════════════════

    async transition subscribe(
        credential: ComplianceCredential,
        offering_id: field,
        amount: u64,
        position_id: field,
        issuer: address,
    ) -> (ComplianceCredential, Position, SubscriptionReceipt, Future) {
        // Re-output the credential
        let cred_out: ComplianceCredential = ComplianceCredential {
            owner: credential.owner,
            issuer: credential.issuer,
            jurisdiction: credential.jurisdiction,
            accredited: credential.accredited,
            tier: credential.tier,
            credential_hash: credential.credential_hash,
            expiry: credential.expiry,
        };

        let position: Position = Position {
            owner: credential.owner,
            position_id: position_id,
            offering_id: offering_id,
            amount: amount,
            issuer: issuer,
        };

        let receipt: SubscriptionReceipt = SubscriptionReceipt {
            owner: credential.owner,
            position_id: position_id,
            offering_id: offering_id,
            amount: amount,
        };

        let key: InvestorOffering = InvestorOffering {
            investor: credential.owner,
            offering_id: offering_id,
        };
        let whitelist_hash: field = BHP256::hash_to_field(key);

        return (cred_out, position, receipt, finalize_subscribe(
            offering_id,
            amount,
            position_id,
            whitelist_hash,
            credential.accredited,
            credential.credential_hash,
            credential.issuer,
            issuer,
            credential.expiry,
        ));
    }

    async function finalize_subscribe(
        offering_id: field,
        amount: u64,
        position_id: field,
        whitelist_hash: field,
        accredited: bool,
        credential_hash: field,
        credential_issuer_address: address,
        offering_issuer: address,
        credential_expiry: i64,
    ) {
        let current_time: i64 = block.timestamp;
        let info: OfferingInfo = offerings.get(offering_id);
        assert(info.is_active);
        assert_eq(info.issuer, offering_issuer);
        assert(current_time < credential_expiry);

        // Verify credential is not revoked (0 = active)
        let cred_status: u8 = credential_status.get(credential_hash);
        assert_eq(cred_status, 0u8);

        // Verify credential issuer is still active (1 = active)
        let iss_status: u8 = issuer_registry.get(credential_issuer_address);
        assert_eq(iss_status, 1u8);

        let whitelisted: bool = investor_whitelist.get_or_use(whitelist_hash, false);
        assert(whitelisted);

        let has_position: bool = investor_position_active.get_or_use(whitelist_hash, false);
        assert_eq(has_position, false);

        let existing_position_time: i64 = position_created_at.get_or_use(position_id, 0i64);
        assert_eq(existing_position_time, 0i64);

        if (info.accredited_only) {
            assert(accredited);
        }

        assert(amount >= info.min_subscription);

        let subscribed: u64 = offering_subscribed.get(offering_id);
        let new_total: u64 = subscribed + amount;
        assert(new_total <= info.total_supply);

        let count: u32 = offering_investor_count.get(offering_id);
        let new_count: u32 = count + 1u32;
        assert(new_count <= info.max_investors);

        offering_subscribed.set(offering_id, new_total);
        offering_investor_count.set(offering_id, new_count);
        investor_position_active.set(whitelist_hash, true);
        position_created_at.set(position_id, current_time);
    }

    // ═══════════════════════════════════════════════════════════════
    // 9. TRANSFER POSITION
    // ═══════════════════════════════════════════════════════════════

    async transition transfer_position(
        position: Position,
        buyer: address,
    ) -> (Position, TransferReceipt, Future) {
        let new_position: Position = Position {
            owner: buyer,
            position_id: position.position_id,
            offering_id: position.offering_id,
            amount: position.amount,
            issuer: position.issuer,
        };

        let receipt: TransferReceipt = TransferReceipt {
            owner: position.owner,
            position_id: position.position_id,
            offering_id: position.offering_id,
            amount: position.amount,
            buyer: buyer,
        };

        let key: InvestorOffering = InvestorOffering {
            investor: buyer,
            offering_id: position.offering_id,
        };
        let buyer_hash: field = BHP256::hash_to_field(key);

        let seller_key: InvestorOffering = InvestorOffering {
            investor: position.owner,
            offering_id: position.offering_id,
        };
        let seller_hash: field = BHP256::hash_to_field(seller_key);

        return (new_position, receipt, finalize_transfer_position(
            position.offering_id,
            buyer,
            buyer_hash,
            seller_hash,
        ));
    }

    async function finalize_transfer_position(
        offering_id: field,
        buyer: address,
        buyer_hash: field,
        seller_hash: field,
    ) {
        let current_time: i64 = block.timestamp;
        let info: OfferingInfo = offerings.get(offering_id);
        assert(current_time >= info.lockup_end);

        let whitelisted: bool = investor_whitelist.get_or_use(buyer_hash, false);
        assert(whitelisted);

        let seller_active: bool = investor_position_active.get_or_use(seller_hash, false);
        assert(seller_active);

        let buyer_active: bool = investor_position_active.get_or_use(buyer_hash, false);
        assert_eq(buyer_active, false);

        let buyer_credential_hash: field = investor_active_credential.get_or_use(buyer, 0field);
        assert(buyer_credential_hash != 0field);

        let buyer_credential_status: u8 = credential_status.get(buyer_credential_hash);
        assert_eq(buyer_credential_status, 0u8);

        let buyer_credential_issuer: address = credential_issuer.get(buyer_credential_hash);
        let buyer_issuer_status: u8 = issuer_registry.get(buyer_credential_issuer);
        assert_eq(buyer_issuer_status, 1u8);

        investor_position_active.set(seller_hash, false);
        investor_position_active.set(buyer_hash, true);
    }

    // ═══════════════════════════════════════════════════════════════
    // 10. DECLARE DISTRIBUTION
    // ═══════════════════════════════════════════════════════════════

    async transition declare_distribution(
        offering_id: field,
        distribution_id: field,
        amount_per_unit: u64,
    ) -> Future {
        return finalize_declare_distribution(self.caller, offering_id, distribution_id, amount_per_unit);
    }

    async function finalize_declare_distribution(
        caller: address,
        offering_id: field,
        distribution_id: field,
        amount_per_unit: u64,
    ) {
        let info: OfferingInfo = offerings.get(offering_id);
        assert_eq(info.issuer, caller);

        let exists: bool = distribution_exists.get_or_use(distribution_id, false);
        assert_eq(exists, false);

        let count: u32 = distribution_count.get_or_use(0u8, 0u32);

        distribution_exists.set(distribution_id, true);
        distributions.set(distribution_id, amount_per_unit);
        distribution_offering.set(distribution_id, offering_id);
        distribution_index.set(count, distribution_id);
        distribution_count.set(0u8, count + 1u32);
    }

    // ═══════════════════════════════════════════════════════════════
    // 11. CLAIM DISTRIBUTION
    // ═══════════════════════════════════════════════════════════════

    async transition claim_distribution(
        position: Position,
        distribution_id: field,
        amount_per_unit: u64,
    ) -> (Position, DistributionReceipt, Future) {
        let total_received: u64 = position.amount * amount_per_unit;

        let pos_out: Position = Position {
            owner: position.owner,
            position_id: position.position_id,
            offering_id: position.offering_id,
            amount: position.amount,
            issuer: position.issuer,
        };

        let receipt: DistributionReceipt = DistributionReceipt {
            owner: position.owner,
            distribution_id: distribution_id,
            offering_id: position.offering_id,
            amount_received: total_received,
        };

        let key: ClaimKey = ClaimKey {
            investor: position.owner,
            distribution_id: distribution_id,
        };
        let claim_hash: field = BHP256::hash_to_field(key);

        return (pos_out, receipt, finalize_claim_distribution(
            distribution_id,
            amount_per_unit,
            claim_hash,
            position.offering_id,
        ));
    }

    async function finalize_claim_distribution(
        distribution_id: field,
        amount_per_unit: u64,
        claim_hash: field,
        offering_id: field,
    ) {
        let stored_amount: u64 = distributions.get(distribution_id);
        assert_eq(stored_amount, amount_per_unit);

        // Verify distribution belongs to the position's offering
        let dist_offering: field = distribution_offering.get(distribution_id);
        assert_eq(dist_offering, offering_id);

        let claimed: bool = distribution_claimed.get_or_use(claim_hash, false);
        assert(!claimed);

        distribution_claimed.set(claim_hash, true);
    }

    // ═══════════════════════════════════════════════════════════════
    // 12. CREATE PROPOSAL
    // ═══════════════════════════════════════════════════════════════

    async transition create_proposal(
        offering_id: field,
        proposal_id: field,
        description_hash: field,
        voting_end: i64,
    ) -> Future {
        return finalize_create_proposal(self.caller, offering_id, proposal_id, description_hash, voting_end);
    }

    async function finalize_create_proposal(
        caller: address,
        offering_id: field,
        proposal_id: field,
        description_hash: field,
        voting_end: i64,
    ) {
        let current_time: i64 = block.timestamp;
        let info: OfferingInfo = offerings.get(offering_id);
        assert_eq(info.issuer, caller);
        assert(current_time < voting_end);

        let exists: bool = proposal_exists.get_or_use(proposal_id, false);
        assert_eq(exists, false);

        let proposal: ProposalInfo = ProposalInfo {
            offering_id: offering_id,
            proposer: caller,
            description_hash: description_hash,
            voting_end: voting_end,
            is_active: true,
        };

        let count: u32 = proposal_count.get_or_use(0u8, 0u32);

        proposal_exists.set(proposal_id, true);
        proposals.set(proposal_id, proposal);
        proposal_index.set(count, proposal_id);
        proposal_count.set(0u8, count + 1u32);
        proposal_yes.set(proposal_id, 0u64);
        proposal_no.set(proposal_id, 0u64);
    }

    // ═══════════════════════════════════════════════════════════════
    // 13. CAST VOTE
    // ═══════════════════════════════════════════════════════════════

    async transition cast_vote(
        position: Position,
        proposal_id: field,
        vote: bool,
    ) -> (Position, VoteReceipt, Future) {
        let pos_out: Position = Position {
            owner: position.owner,
            position_id: position.position_id,
            offering_id: position.offering_id,
            amount: position.amount,
            issuer: position.issuer,
        };

        let receipt: VoteReceipt = VoteReceipt {
            owner: position.owner,
            position_id: position.position_id,
            proposal_id: proposal_id,
            vote: vote,
            weight: position.amount,
        };

        let key: VoterKey = VoterKey {
            voter: position.owner,
            proposal_id: proposal_id,
        };
        let voter_hash: field = BHP256::hash_to_field(key);

        let position_vote_key: PositionVoteKey = PositionVoteKey {
            position_id: position.position_id,
            proposal_id: proposal_id,
        };
        let position_vote_hash: field = BHP256::hash_to_field(position_vote_key);

        return (pos_out, receipt, finalize_cast_vote(
            proposal_id,
            vote,
            position.amount,
            voter_hash,
            position.offering_id,
            position_vote_hash,
        ));
    }

    async function finalize_cast_vote(
        proposal_id: field,
        vote: bool,
        weight: u64,
        voter_hash: field,
        offering_id: field,
        position_vote_hash: field,
    ) {
        let current_time: i64 = block.timestamp;
        let proposal: ProposalInfo = proposals.get(proposal_id);
        assert(proposal.is_active);
        assert(current_time < proposal.voting_end);

        // Verify position belongs to the proposal's offering
        assert_eq(proposal.offering_id, offering_id);

        let already_voted: bool = voter_record.get_or_use(voter_hash, false);
        assert(!already_voted);

        let position_already_voted: bool = position_vote_record.get_or_use(position_vote_hash, false);
        assert(!position_already_voted);

        voter_record.set(voter_hash, true);
        position_vote_record.set(position_vote_hash, true);

        if (vote) {
            let current_yes: u64 = proposal_yes.get(proposal_id);
            proposal_yes.set(proposal_id, current_yes + weight);
        } else {
            let current_no: u64 = proposal_no.get(proposal_id);
            proposal_no.set(proposal_id, current_no + weight);
        }
    }
}
