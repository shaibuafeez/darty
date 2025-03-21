# Harbor

**Private infrastructure for real-estate securities on Aleo.**

Harbor is a privacy-preserving operating layer for tokenized real-estate offerings. It gives issuers, operators, and investors one Aleo-native workflow for investor credentialing, compliant subscriptions, controlled transfers, distributions, and governance without exposing the cap table to the public chain.

## Why Harbor

Most RWA platforms can tokenize an asset. Very few can operate it privately.

Public-chain real-estate products leak:
- investor identity and eligibility status
- wallet-level allocation patterns
- cap-table behavior
- transfer activity
- governance and payout behavior

Harbor uses Aleo to keep investor credentials and positions private while still enforcing offering rules on-chain.

## What Harbor Does

Harbor is not a listing site. It is the **private operating layer** behind a real-estate security workflow.

Core capabilities:
- **Issuer registration** with on-chain issuer status and license-hash provenance
- **Private investor credentials** for eligibility and accreditation
- **Offering creation** with supply, pricing, lockups, investor caps, and settlement asset selection
- **Per-offering investor approval** via whitelist controls
- **Private subscriptions** that mint private position records
- **Controlled transfers** with whitelist, lockup, and credential checks
- **Distributions** with on-chain declaration and private claim receipts
- **Governance** with position-weighted voting
- **Companion zPass credentials** for reusable investor credential portability
- **Aleo-native settlement rails** via `credits.aleo`, plus `USDCx` / `USAD` support through the token registry

## Why Privacy Matters Here

Real-estate securities are not just “tokens.” They involve:
- regulated investor access
- sensitive eligibility data
- issuer-controlled transfer restrictions
- private positions and allocations
- payout and governance history

Those should not become permanent public-chain exhaust.

Harbor uses:
- **private records** for credentials, positions, and receipts
- **public mappings** for offering metadata, proposal state, and rule enforcement
- **zero-knowledge execution on Aleo** to keep user data hidden by default

## Architecture

Harbor has three layers:

1. **Harbor contract**
   - Program: `harbor.aleo`
   - Owns the real-estate workflow and enforcement logic

2. **Companion credential layer**
   - Program: `harborzpass.aleo`
   - Provides a `zPass`-compatible investor credential path for portability and ecosystem interoperability

3. **Settlement rails**
   - `credits.aleo` for ALEO-denominated demo settlement
   - `token_registry.aleo` for `USDCx` / `USAD` transfer support

### Main Program: `harbor.aleo`

Transitions:
- `register_issuer`
- `revoke_issuer`
- `issue_compliance_credential`
- `revoke_compliance_credential`
- `create_offering`
- `approve_investor`
- `close_offering`
- `subscribe`
- `transfer_position`
- `declare_distribution`
- `claim_distribution`
- `create_proposal`
- `cast_vote`

Private records:
- `ComplianceCredential`
- `Position`
- `SubscriptionReceipt`
- `TransferReceipt`
- `DistributionReceipt`
- `VoteReceipt`

### Companion Program: `harborzpass.aleo`

Transitions:
- `register_issuer`
- `revoke_issuer`
- `issue`
- `assert_valid`

This program is not the marketplace. It is the **portable credential layer**.

## Product Flows

### 1. Issuer setup
- Register issuer in Harbor
- Optionally register the same issuer in `harborzpass.aleo`

### 2. Investor credentialing
- Issue a Harbor-native `ComplianceCredential`
- Optionally mint a companion `zPass` credential for reuse outside Harbor

### 3. Offering launch
- Create an offering with:
  - property metadata
  - supply
  - price per unit
  - settlement asset
  - lockup period
  - investor cap
  - accredited-only restriction

### 4. Subscription
- Approve investor for a specific offering
- Investor subscribes with a valid credential
- Harbor mints a private `Position`

### 5. Post-issuance operations
- Transfer positions to approved buyers
- Declare and claim distributions
- Create proposals and cast votes

## zPass in Harbor

Harbor does **not** outsource its business logic to `zPass`.

The split is deliberate:
- **Harbor contract** = offering rules, subscriptions, transfers, distributions, governance
- **zPass companion layer** = reusable investor credentials

This keeps Harbor as the product and uses `zPass` where it is strongest: **portable credentialing**.

## Settlement Assets

Each offering stores a settlement asset:
- `ALEO`
- `USDCx`
- `USAD`

Current behavior:
- ALEO settlement uses `credits.aleo`
- `USDCx` / `USAD` settlement uses `token_registry.aleo`

Important note:
- the settlement transfer currently runs as a **separate transaction** before Harbor subscription minting
- it is real Aleo-native settlement, but not yet atomic with the Harbor contract call

## Frontend

The Harbor frontend includes:
- a marketing landing page
- issuer dashboard
- investor dashboard
- marketplace
- onboarding, subscription, transfer, distribution, and governance flows
- Shield / Leo wallet integration
- companion `zPass` runtime via worker + wasm

## Repo Layout

```text
harbor/
├── contract/        # harbor.aleo Leo program
├── frontend/        # React + Vite app
└── zpass/           # harborzpass.aleo companion credential program
```

## Local Setup

### Prerequisites
- Node.js 20+
- Leo 3.4.x
- Shield Wallet
- Aleo testnet account

### Install frontend

```bash
cd frontend
npm install
```

### Build programs

```bash
cd contract
leo build

cd ../zpass
leo build
```

### Run frontend

```bash
cd frontend
npm run dev
```

## Environment Variables

Stablecoin transfers use token IDs from env:

```bash
VITE_USDCX_TOKEN_ID=...
VITE_USAD_TOKEN_ID=...
```

If these are not set:
- ALEO settlement still works
- `USDCx` / `USAD` transfer attempts will be blocked in the UI

## Build Status

Latest verified locally:
- `harbor/contract`: `leo build` passes
- `harbor/zpass`: `leo build` passes
- `harbor/frontend`: `npm run build` passes

## Why Aleo

Harbor depends on Aleo’s core advantages:
- **Offchain execution** for privacy-preserving application logic
- **Encrypted state** for credentials and positions
- **Selective disclosure** for regulated workflows
- **Composable private programs** for credential + marketplace architecture

Harbor is a better Aleo app than a public-chain RWA clone because privacy is not cosmetic here. It is the product requirement.

## Current Scope

What Harbor already demonstrates:
- private investor credentials
- private positions
- compliant offering access
- transfer restrictions
- distributions
- governance
- companion `zPass` credential path
- ALEO / `USDCx` / `USAD` settlement support in the frontend flow

What is still evolving:
- atomic payment + subscription settlement
- direct Harbor consumption of `zPass` proofs instead of companion-mode coexistence
- stronger production-grade RWA servicing and reporting workflows

## Submission Lens

Harbor is best understood as:

**a privacy-preserving operating system for tokenized real-estate securities on Aleo**

It fits the Aleo x AKINDO Buildathon at the intersection of:
- Private Finance
- Private Identity & Credentials
- Private Governance

## License

MIT
