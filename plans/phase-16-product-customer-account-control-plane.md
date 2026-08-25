# Phase 16 — Product Customer Account and Control Plane

## Outcome

Create the central account and commercial control plane through which product customers manage organizations, subscriptions, branches, users, entitlements, licenses, downloads, billing, and support.

## Why this phase exists

Stack & Scale products may have their own runtime systems, including offline installations, but customer identity and commercial truth must remain centralized. This phase establishes that stable control plane without coupling it to any single product implementation.

## Dependencies

- Phase 14: commercial, support, document, and provisioning workflows
- Phase 05: identity, tenancy, authorization, and audit

## Execution profile

- **Primary workstream:** product platform and customer account
- **Can run in parallel with:** Phase 15 after shared contracts are frozen
- **Shared-write warning:** coordinate customer, billing, files, support, and notification contracts with Phase 15
- **Initial external platform cost:** $0 platform subscription; provider transaction fees remain usage-based
- **Gate:** central commercial truth does not depend on continuous product connectivity; the shared portal contract, execution plan and capacity gate have passed

## Source decisions

Questions 11–17, 28–43, 46, 51, 56, 59, 65, 70, 79, 84–85, 88 and 90.

## Execution decomposition and contract-freeze gate

Before parallel portal work, approve `docs/architecture/PORTAL-SHARED-CONTRACTS.md`. Then create `docs/execution/phase-16/PLAN.md` and step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). The account-app/product-control lane consumes frozen shared contracts and owns only assigned product catalog, subscription, entitlement, license and release modules. Record evidence under `docs/evidence/phase-16/`.

## Work packages

### 16.1 Product catalog and plans

- Model products, editions, plans, price versions, billing periods, trials, add-ons, limits, and availability.
- Version prices and entitlements so historical subscriptions remain reproducible.
- Separate marketing copy from enforceable entitlement definitions.
- Support manual quotation and activation before automated checkout is justified.

### 16.2 Product customer organizations

- Support organizations, owners, administrators, billing contacts, branches/sites, and product-specific roles.
- Reuse platform identity while keeping product access explicit.
- Define ownership transfer, member removal, and organization suspension procedures.

### 16.3 Subscription lifecycle

- Implement pending, trial, active, past-due, suspended, cancelled, expired, and terminated states.
- Record state transitions as events with reasons and effective times.
- Keep subscription state distinct from invoices, payments, and licenses.
- Support authorized manual overrides with expiry, reason, and audit.

### 16.4 Entitlements and limits

- Resolve versioned plan entitlements into organization-specific effective entitlements.
- Support overrides, add-ons, limits, grace periods, and effective dates.
- Provide a deterministic entitlement snapshot API for downstream products.
- Never infer permission solely from a paid invoice; use the subscription policy.

### 16.5 Licenses and installations

- Model license grants, installation identities, devices, activations, revocation, lease windows, and last contact.
- Keep secrets and signing keys outside application data.
- Design for offline verification and bounded grace without permanent offline bypass.
- Expose clear staff recovery paths for device replacement and legitimate reactivation.
- Version signing keys and verification metadata, define rotation overlap and compromised-key recovery, and prevent an installation from accepting an older lease merely to regain revoked entitlements.

### 16.6 Billing account

- Let customers view subscriptions, invoices, receipts, payment methods or instructions, and billing contacts.
- Use Phase 14's canonical invoice and payment records.
- Add checkout or automatic renewal only through provider adapters with verified events.
- Make all automated billing actions idempotent and observable.

### 16.7 Downloads and releases

- Publish authorized installers, release notes, checksums, mandatory cryptographic signatures, signer/key version, platform requirements, and support status.
- Allow downloads only for eligible products and versions.
- Audit downloads without exposing permanent public object URLs.
- Provide a rollback path to a known supported version.

### 16.8 Product support and service status

- Scope support tickets to products, installations, branches, and versions where appropriate.
- Surface relevant service notices and known issues.
- Keep private operational details out of customer-facing status messages.

### 16.9 Account notifications

- Notify customers about invitations, activations, renewals, payment failures, suspension risk, releases, security notices, and support activity.
- Use urgency, deduplication, and preference rules.
- Preserve mandatory security and contractual communications.

### 16.10 Verification

- Test plan-version history, subscription transitions, entitlement determinism, manual overrides, download authorization, organization isolation, and revoked access.
- Simulate delayed and duplicate provider events.
- Verify that product installations can tolerate temporary control-plane unavailability within policy.
- Test tenant placement/routing for enabled isolation tiers, signing-key rotation, compromised-key response, lease rollback resistance and installer signature verification.

### 16.11 Capacity validation

- Measure account sessions, entitlement reads, release storage/downloads, billing callbacks and license-registry load.
- Update the capacity ledger and define rate/degradation controls plus the priced scale trigger.
- Do not activate large binaries or telemetry retention that exhausts the shared node/storage envelope.

## Deliverables

- Product catalog and versioned plans
- Product customer organizations and branches
- Subscription lifecycle
- Entitlement resolver and snapshot contract
- License and installation registry
- Billing account views
- Secure release/download center
- Product support and account notifications
- State-machine, isolation, and resilience test evidence

## Exit criteria

- A customer can be provisioned from an accepted commercial agreement into a working product account.
- Product access is determined by explicit, versioned entitlements.
- Subscription, payment, entitlement, and license states remain separate and reconcilable.
- Downloads are authorized, cryptographically signed, checksummed and audited.
- Temporary control-plane failure does not instantly stop legitimate offline-capable customers.
- No new mandatory paid SaaS is introduced.
- The execution plan, shared-contract ownership and measured-capacity gates pass.

## Rollback and recovery

- Feature-flag catalog, automated billing, downloads, and license enforcement separately.
- Preserve entitlement snapshots and prior plan versions.
- Use time-bounded manual grants for recovery, always with approval and audit.
- Fall back to staff-assisted provisioning and billing.
- Never mass-revoke installations because of a deployment or connectivity incident.

## Cold-start handoff

Read the master plan, budget guardrails, execution decomposition standard, Phases 05 and 14, and the source decisions above. Begin with the shared-contract freeze, four separate state diagrams—subscription, payment, entitlement and license—and the exact step/write-ownership plan. Finish when deterministic entitlement, cryptographic and outage simulations pass with evidence under `docs/evidence/phase-16/`.
