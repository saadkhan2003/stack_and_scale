# Phase 03 — Architecture Contracts and Threat Model

## Outcome

Freeze the technical boundaries that prevent the platform from becoming a tightly coupled application: domains, APIs, events, tenancy, data classification, security controls and non-functional requirements.

## Execution profile

- **Model tier:** strongest available reasoning model
- **Mode:** parallel with Phase 02 and Phase 10A; Phase 10B waits for this phase
- **External-platform spend:** $0
- **Depends on:** Phase 01
- **Unlocks:** Phases 04, 10 and 11

## Source decisions

Questions 27–35, 40, 49–53, 66–73, 79–87 and 96–98.

## Work packages

### 03.1 System and deployment views

- C4 context, container and component diagrams.
- Trust boundaries for public, CMS, staff, client, account, API and infrastructure surfaces.
- Data ownership between the central platform and independent products.

### 03.2 Domain map

- Identity/access.
- Organizations/contacts.
- CRM/sales.
- Content.
- Products/subscriptions.
- Billing/payments.
- Projects/documents.
- Support/knowledge.
- Notifications/audit.
- Integrations/reporting.

Define allowed dependencies and prohibited cross-domain table access.

### 03.3 API standards

- Versioning, pagination, filtering, errors and correlation IDs.
- Authentication and service credentials.
- Idempotency and concurrency rules.
- OpenAPI generation and client compatibility.
- Private partner API boundary.

### 03.4 Event and webhook standards

- Naming, envelope, version and ownership.
- Transactional outbox.
- Retry, dead letter, deduplication and replay.
- Signature, timestamp and secret-rotation policy.

### 03.5 Data classification and privacy model

- Public, internal, confidential, restricted and secret classes.
- Retention, export, correction, deletion and legal-hold behavior.
- Logging redaction and analytics consent boundaries.
- Portal upload restrictions.
- Privacy-request identity verification, authorization, status and audit contract.
- Deletion/retention propagation contract across transactional data, CMS, analytics, indexes, logs, files and backups.
- Legal-hold and required-retention exception model with reason, authority and expiry.

### 03.6 Hybrid tenant-isolation architecture

- Define supported isolation tiers: shared tables with organization keys initially, dedicated schema when justified, and dedicated database for the highest isolation tier.
- Define placement policy, placement registry, connection/routing abstraction and deny-safe behavior when placement is unknown.
- Define provisioning, tier migration, tenant move, isolated migration, backup ownership, restore and decommission procedures.
- Require one authorization/query contract across all tiers so isolation changes do not alter product behavior.
- Create test scenarios for every supported tier and tenant movement.

### 03.7 Threat model

Analyze:

- account takeover;
- cross-tenant access;
- staff privilege escalation;
- CMS publishing abuse;
- form spam and injection;
- file upload abuse;
- webhook spoofing/replay;
- payment/provisioning duplication;
- secrets exposure;
- supply-chain compromise;
- backup destruction;
- origin bypass and denial of service.

Map threats to prevention, detection, response and verification.

### 03.8 Non-functional budgets

- availability targets;
- recovery objectives;
- public performance budgets;
- data-retention defaults;
- audit retention;
- dependency and container update policy;
- maximum initial infrastructure spend.

## Deliverables

```text
docs/architecture/SYSTEM.md
docs/architecture/DOMAINS.md
docs/architecture/API-STANDARDS.md
docs/architecture/EVENT-STANDARDS.md
docs/security/THREAT-MODEL.md
docs/security/DATA-CLASSIFICATION.md
docs/architecture/TENANT-ISOLATION.md
docs/privacy/REQUEST-AND-DELETION-CONTRACT.md
docs/architecture/NON-FUNCTIONAL-REQUIREMENTS.md
docs/decisions/*.md
```

## Exit criteria

- Every V1 module has a defined owner and boundary.
- Tenant isolation has enforceable rules.
- Hybrid tenant placement, routing, movement, backup and restore have accepted contracts even though V1 may operate only the shared tier.
- API/event contracts cover retries and failures.
- Every critical threat has a testable mitigation.
- Data classes have retention and logging rules.
- No design requires a paid external platform.

## Rollback and recovery

Architecture documents are versioned decisions. Supersede an incorrect ADR with a new ADR; do not rewrite history without explanation.

## Cold-start handoff

Read the backend, API, security, product-integration and infrastructure sections of the blueprint before changing these contracts.
