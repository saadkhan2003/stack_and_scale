# Phase 00 — Program Constitution and Readiness

## Outcome

Create the binding execution contract for the program. After this phase, a fresh implementation agent can identify the authoritative requirements, V1 boundary, budget, unresolved provider choices, verification standards and ownership without rereading the entire planning conversation.

## Execution profile

- **Model tier:** strongest available reasoning model
- **Mode:** serial
- **External-platform spend:** $0
- **Dependencies:** none
- **Unlocks:** every other phase

## Source decisions

All 100 decision records, with particular emphasis on Questions 1–3, 8, 18, 25, 51, 61, 62, 79, 86, 99 and 100.

## Required inputs

- approved platform blueprint;
- 100 detailed decision records;
- logo and color assets currently available;
- known products, services and projects;
- USD 50/month platform ceiling;
- Git repository access.

## Work packages

### 00.1 Authority map

- Define precedence: final question decision → master blueprint → phase plan → implementation ADR → code.
- Mark any outdated or conflicting document as historical.
- Create a change-control template for future decision changes.
- Record that conversational alternatives are context, not implementation scope.

### 00.2 V1 boundary

- Convert Phase 1 scope into uniquely numbered capabilities.
- Produce explicit included, deferred and prohibited lists.
- Map every V1 capability to one owner phase and one acceptance test family.
- Confirm that portals, advanced operations, product integrations and AI remain deferred.

### 00.3 Product and content inventory

- Inventory products, services, industries, projects, testimonials, clients, team, careers and resources.
- Mark each item real, private, incomplete or demonstration-only.
- Record media availability, approval state and missing content.
- Prohibit invented customer names, metrics or testimonials from production.

### 00.4 Provider decision register

- Create decision slots for domain registrar, edge, email delivery, identity, object storage, monitoring and backups.
- Define comparison criteria: cost, self-hostability, data location, export, security, maintenance and failure modes.
- Do not purchase services in this phase.
- Resolve secrets management through an ADR before Phase 01 exits. The decision must cover production key custody, named access, access evidence, separate recipients, rotation, break-glass approval, lost-key recovery and acknowledged limitations. Do not assume encrypted Git files alone satisfy access auditing.
- Define the backup failure-domain requirement: geographically separate from the primary Hetzner location, independently credentialed, encrypted and protected from deletion through a compromised primary account.

### 00.5 Quality constitution

- Define minimum accessibility, performance, security, privacy, testing and recovery gates.
- Define evidence required to mark a requirement complete.
- Define defect severity and launch-blocking criteria.

### 00.6 Program risk register

- Record content delays, overbuilding, single-maintainer risk, infrastructure operations, deliverability, tenant leakage, backup failure and budget overrun.
- Give each risk an owner, trigger, mitigation and contingency.

### 00.7 Privacy implementation matrix

- Map Question 51 to V1 implementation owners for notice, consent/preference history, authenticated request intake, access/portable export, correction, restriction, erasure/anonymization, legal hold, retention enforcement and processor/vendor records.
- Define deletion propagation for CRM, CMS, analytics, search, logs, media and backups, including what is deleted immediately, cryptographically or physically expired later, or retained under a documented exception.
- Assign Phase 12 end-to-end privacy acceptance tests.

### 00.8 Capacity and recovery ledger

- Create CPU, memory, disk, I/O, database-connection, telemetry-retention and backup-volume budgets for every planned service.
- Record safe headroom, degradation controls, scale triggers and next-topology monthly costs.
- Define complete-system restore order for infrastructure state, network, database, identity, secrets, application configuration, media, monitoring and status.
- Treat later “$0 cost” claims as provisional until measurements prove spare capacity.

## Deliverables

```text
docs/program/AUTHORITY.md
docs/program/V1-SCOPE.md
docs/program/REQUIREMENTS.md
docs/program/DECISION-TRACEABILITY.md
docs/program/CONTENT-INVENTORY.md
docs/program/PROVIDER-DECISIONS.md
docs/program/QUALITY-GATES.md
docs/program/RISK-REGISTER.md
docs/program/PLAN-CHANGES.md
docs/program/ENVIRONMENT-AND-DELIVERY-POLICY.md
docs/privacy/IMPLEMENTATION-MATRIX.md
docs/privacy/PROCESSOR-REGISTER.md
docs/operations/CAPACITY-LEDGER.md
docs/operations/RESTORE-ORDER.md
docs/decisions/ADR-SECRETS-MANAGEMENT.md
docs/decisions/ADR-BACKUP-FAILURE-DOMAIN.md
docs/execution/phase-00/PLAN.md
```

## Verification

- Every V1 requirement has an ID, owner phase and verification method.
- Every question decision is linked to at least one blueprint section or marked contextual.
- Deferred features do not appear as V1 tasks.
- Projected initial spend remains at or below $50/month.
- Demonstration content is clearly separated from publishable evidence.
- Every privacy obligation has one implementation phase and one acceptance test.
- Secrets and backup ADRs satisfy custody, audit/recovery and failure-domain requirements.
- The capacity ledger demonstrates that the proposed service set has a plausible path within $50.

## Exit criteria

- Source-of-truth precedence is explicit.
- V1 scope is unambiguous.
- No unresolved decision blocks repository scaffolding.
- Quality gates and risk owners exist.
- Budget guardrails are accepted.

## Rollback and recovery

This phase changes documentation only. Revert the affected documentation commit and restore the previous authority map. Never roll back by deleting historical decisions.

## Cold-start handoff

Read `plans/MASTER_IMPLEMENTATION_PLAN.md`, this file, `docs/program/AUTHORITY.md` and `docs/program/V1-SCOPE.md`. Do not scaffold code until every exit criterion above passes.
