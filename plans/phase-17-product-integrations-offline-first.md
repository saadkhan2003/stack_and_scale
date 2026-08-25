# Phase 17 — Product Integrations and Offline-First Operation

## Outcome

Connect Stack & Scale products to the central platform through stable APIs, webhooks, adapters, entitlement leases, and an offline-first synchronization protocol that remains safe under retries, outages, and conflicts.

## Why this phase exists

Product software may run at stores, offices, or devices with unreliable internet. A product must continue legitimate local work while the central platform retains commercial control and eventual operational visibility. This requires deliberate distributed-systems contracts, not ad hoc API calls.

## Dependencies

- Phase 16: product account, subscription, entitlement, license, and installation control plane
- Phase 10: reliable deployment and environment foundations
- Phase 11: observability, security, and incident response

## Execution profile

- **Primary workstream:** platform integration and product SDKs
- **Can run in parallel with:** product-specific UI work after protocol contracts are accepted
- **Must serialize:** protocol, event envelope, entitlement lease, and conflict-policy changes
- **Initial external platform cost:** $0; uses existing infrastructure initially
- **Gate:** every network operation defines retry, idempotency, timeout, ordering and offline behavior; execution and capacity plans pass

## Source decisions

Questions 26–31, 46, 49–54, 61–65, 70–73, 79–86 and 88.

## Execution decomposition gate

Create `docs/execution/phase-17/PLAN.md` and step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). Freeze protocol, event envelope, installation identity, lease and conflict contracts before product adapters start. Assign distinct server, SDK, simulator and reference-product write scopes; evidence belongs under `docs/evidence/phase-17/`.

## Work packages

### 17.1 Integration classification

- Define integration levels: informational link, authenticated deep link, API integration, event integration, synchronization, and managed provisioning.
- Assign each product capability the minimum necessary level.
- Avoid premature tight coupling between products and the website platform.

### 17.2 Versioned API contracts

- Publish product-facing contracts for organization, branch, installation, entitlement snapshot, license lease, release, and support operations.
- Use explicit versions, stable identifiers, pagination, error codes, request IDs, and deprecation rules.
- Generate contract tests and typed clients where practical.

### 17.3 Webhook and event delivery

- Define a versioned event envelope with event ID, type, source, subject, occurrence time, payload version, and signature.
- Provide signed delivery, retries, exponential backoff, dead-letter handling, replay, and observability.
- Require consumers to deduplicate by event ID.
- Never assume global event ordering.

### 17.4 Product adapter/SDK

- Build a small reference adapter that handles authentication, timeouts, retries, idempotency keys, event verification, caching, and telemetry.
- Keep product domain logic outside the transport library.
- Document upgrade and backward-compatibility expectations.

### 17.5 Installation identity and trust

- Provision each installation with a unique identity and securely rotated credentials.
- Bind credentials to allowed operations and product scope.
- Support revocation, replacement, compromise response, and clock-skew tolerance.
- Never embed shared permanent platform secrets in distributed binaries.

### 17.6 Entitlement lease protocol

- Issue signed, time-bounded entitlement snapshots or leases for offline verification.
- Define lease renewal, grace windows, emergency extension, revocation behavior, and degraded user messaging.
- Use asymmetric signatures so products verify without holding signing secrets.
- Separate commercial suspension from security revocation and system outage.
- Include monotonic lease sequence/version, installation-bound state or another approved anti-rollback mechanism so an older still-signed lease cannot restore removed rights.
- Publish verification-key versions, rotation overlap, revocation and compromised-signing-key recovery behavior.

### 17.7 Heartbeats and operational telemetry

- Collect minimum necessary installation health, version, last contact, sync status, and license state.
- Make telemetry privacy-aware, rate-limited, and non-blocking.
- Treat missing heartbeat as uncertainty, not immediate proof of misuse.

### 17.8 Offline data synchronization

- Define local ownership, server ownership, replicated records, tombstones, cursors, and retention.
- Use client-generated stable IDs and idempotent mutation IDs.
- Batch changes with resumable checkpoints.
- Avoid synchronized wall-clock dependence where sequence or version tokens are safer.

### 17.9 Conflict policy

- Specify conflict behavior per entity: server wins, client wins, last accepted version, merge, append-only, or human review.
- Never use silent last-write-wins for money, inventory, permissions, or contractual truth without a domain-approved rule.
- Preserve conflict evidence and provide reconciliation tools.

### 17.10 Failure and compatibility testing

- Test network loss, slow links, duplicate requests, duplicate events, reordering, corrupted payloads, clock skew, expired leases, revoked credentials, partial batches, and server rollback.
- Maintain compatibility tests across at least the supported product-version window.
- Conduct a prolonged offline simulation before production enforcement.
- Test old-lease replay/rollback, signing-key rotation, compromised keys, emergency replacement keys and installer signature failure.

### 17.11 Capacity validation

- Measure API requests, webhook backlog, heartbeat volume, sync batch size, retention and replay storage.
- Apply rate, batch, backpressure and telemetry degradation controls from the capacity ledger.
- Record the next safe topology and monthly cost; zero licence cost does not authorize unsafe load.

## Deliverables

- Integration-level catalog
- Versioned product API
- Signed webhook/event system
- Reference integration SDK
- Installation credential lifecycle
- Signed entitlement lease protocol
- Minimal heartbeat telemetry
- Offline synchronization and conflict specifications
- Chaos, compatibility, and prolonged-offline test evidence

## Exit criteria

- A reference product can provision, obtain entitlements, operate through the approved offline window, reconnect, and reconcile safely.
- Duplicate or reordered operations do not corrupt state.
- No distributed product contains a shared permanent signing secret.
- Financial, inventory, permission, and contractual conflicts follow explicit policies.
- Supported older product versions pass compatibility tests.
- Central outages degrade service according to policy rather than immediately disabling legitimate customers.
- Old leases cannot roll back entitlement state, and key compromise has a tested recovery path.
- The decomposed execution plan and measured capacity gate pass.

## Rollback and recovery

- Version all contracts and retain the previous supported protocol during rollout.
- Roll back enforcement separately from telemetry and synchronization.
- Extend valid leases through an audited emergency procedure during control-plane incidents.
- Pause a failing event consumer without discarding its replayable events.
- Reconcile from durable mutation/event logs after restoration.

## Cold-start handoff

Read the master plan, budget guardrails, execution decomposition standard, Phases 10, 11 and 16, and the source decisions above. Start with protocol ADRs, failure tables and the exact step/write-ownership plan, then build a reference simulator before connecting a real product. Finish only after chaos, prolonged-offline, cryptographic and backward-compatibility evidence is stored under `docs/evidence/phase-17/`.
