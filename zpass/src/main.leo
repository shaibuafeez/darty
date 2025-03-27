program harborzpass.aleo {
    @noupgrade
    async constructor() {}

    record ComplianceZPass {
        owner: address,
        issuer: address,
        jurisdiction: u8,
        accredited: bool,
        tier: u8,
        credential_hash: field,
        issued_at: u32,
        expiry: u32,
        salt: scalar
    }

    struct PrivateComplianceCredentials {
        jurisdiction: u8,
        accredited: bool,
        tier: u8,
        credential_hash: field,
        issued_at: u32,
        expiry: u32
    }

    struct PublicComplianceCredentials {
        issuer: address,
        salt: scalar
    }

    struct FullComplianceCredentials {
        issuer: address,
        subject: address,
        jurisdiction: u8,
        accredited: bool,
        tier: u8,
        credential_hash: field,
        issued_at: u32,
        expiry: u32,
        salt: scalar
    }

    mapping approved_issuers: address => bool;
    mapping issued_commitments: group => bool;

    async transition register_issuer() -> Future {
        return register_issuer_finalize(self.caller);
    }

    async function register_issuer_finalize(public issuer: address) {
        Mapping::set(approved_issuers, issuer, true);
    }

    async transition revoke_issuer() -> Future {
        return revoke_issuer_finalize(self.caller);
    }

    async function revoke_issuer_finalize(public issuer: address) {
        Mapping::set(approved_issuers, issuer, false);
    }

    async transition issue(
        private sig: signature,
        private pri: PrivateComplianceCredentials,
        public pub: PublicComplianceCredentials
    ) -> (ComplianceZPass, Future) {
        let creds: FullComplianceCredentials = FullComplianceCredentials {
            issuer: pub.issuer,
            subject: self.signer,
            jurisdiction: pri.jurisdiction,
            accredited: pri.accredited,
            tier: pri.tier,
            credential_hash: pri.credential_hash,
            issued_at: pri.issued_at,
            expiry: pri.expiry,
            salt: pub.salt
        };

        let verified: bool = signature::verify(sig, creds.issuer, Poseidon2::hash_to_field(creds));
        assert_eq(verified, true);
        assert_eq(pri.expiry >= pri.issued_at, true);

        let commitment: group = BHP256::commit_to_group(pri.credential_hash, pub.salt);

        return (
            ComplianceZPass {
                owner: self.signer,
                issuer: pub.issuer,
                jurisdiction: pri.jurisdiction,
                accredited: pri.accredited,
                tier: pri.tier,
                credential_hash: pri.credential_hash,
                issued_at: pri.issued_at,
                expiry: pri.expiry,
                salt: pub.salt
            },
            issue_finalize(pub.issuer, commitment)
        );
    }

    async function issue_finalize(public issuer: address, public commitment: group) {
        let is_approved: bool = Mapping::get_or_use(approved_issuers, issuer, false);
        assert_eq(is_approved, true);

        let already_issued: bool = Mapping::get_or_use(issued_commitments, commitment, false);
        assert_eq(already_issued, false);

        Mapping::set(issued_commitments, commitment, true);
    }

    async transition assert_valid(public credential_hash: field, public salt: scalar) -> Future {
        let commitment: group = BHP256::commit_to_group(credential_hash, salt);
        return assert_valid_finalize(commitment);
    }

    async function assert_valid_finalize(public commitment: group) {
        let is_issued: bool = Mapping::get_or_use(issued_commitments, commitment, false);
        assert_eq(is_issued, true);
    }
}
