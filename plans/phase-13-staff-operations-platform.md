# Phase 13 — Staff Operations Platform

## Outcome

Deliver one secure internal workspace where authorized staff can understand customers, leads, work, approvals, notifications, and operating health without switching between disconnected tools.

## Why this phase exists

The public website and lead engine create demand, but the company still needs an operating surface. This phase turns the foundations from Phases 05, 09, and 12 into a coherent staff product. It intentionally extends the shared platform instead of introducing a paid CRM or admin SaaS.

## Dependencies

- Phase 05: identity, tenancy, authorization, and audit foundations
- Phase 09: lead, demo, and CRM domain records
- Phase 12: stable V1 production baseline

## Execution profile

- **Primary workstream:** internal product and operations
- **Can run in parallel with:** content production and non-conflicting public-site improvements
- **Must not overlap writes with:** authorization schema or CRM state-machine changes
- **Initial external platform cost:** $0; deploy within existing Hetzner capacity
- **Gate:** no staff feature ships without explicit role permissions, audit events, an approved decomposed execution plan, and measured infrastructure headroom

## Source decisions

Questions 28–43, 45, 57–60, 70, 79, 84, 91–92 and 98, plus the V1 evidence produced by Phases 05, 09 and 12.

## Execution decomposition gate

Before implementation, create `docs/execution/phase-13/PLAN.md` and step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). Freeze staff permissions, CRM states and timeline event contracts first. Assign exact ownership for the staff app, CRM modules, search/read models, notifications and migrations; store evidence under `docs/evidence/phase-13/`.

## Work packages

### 13.1 Staff workspace shell

- Build the authenticated staff navigation, route guards, session handling, and responsive layout.
- Provide role-aware navigation rather than hiding unauthorized actions only at the page level.
- Add a command/search entry point designed to grow into global operations search.
- Include clear empty, loading, forbidden, degraded, and error states.

### 13.2 Operational dashboard

- Present actionable queues: new leads, overdue follow-ups, upcoming demos, unresolved support items, and pending approvals.
- Use explicit definitions for every metric and timestamp.
- Avoid vanity dashboards; every card must answer a decision or link to an action.
- Add saved filters only after the base filtering model is stable.
- Allow only approved, permission-safe widget configuration; metric definitions and data scopes remain centrally governed.

### 13.3 Customer and lead 360 timeline

- Unify organizations, contacts, leads, interests, source attribution, meetings, notes, consent, and lifecycle events.
- Keep the timeline append-oriented and auditable.
- Separate factual events from editable notes.
- Enforce field-level treatment for sensitive information.

### 13.4 Tasks, ownership, and follow-up

- Support assignable tasks, due dates, priorities, statuses, comments, and links to domain records.
- Define overdue and completion semantics centrally.
- Generate tasks from approved workflows such as a demo request or proposal follow-up.
- Prevent automation from silently changing commercial truth.

### 13.5 Approvals

- Establish a generic approval primitive with requester, approver, decision, reason, expiry, and audit trail.
- Use it first for high-impact actions such as discounts, proposal publication, refunds, or destructive changes.
- Require separation of duties where the risk justifies it.
- Support configurable thresholds, escalation routes, reminders and expiry without allowing users to bypass policy.

### 13.6 Global operations search

- Search customers, contacts, leads, tasks, content, and permitted documents.
- Apply authorization before returning results, snippets, counts, or suggestions.
- Begin with PostgreSQL search and indexed filters; do not buy or deploy a separate search cluster yet.

### 13.7 Notifications and inbox

- Add an in-app notification inbox with read state, category, urgency, and deep links.
- Route critical events to transactional email through the existing provider adapter.
- Support user preferences without allowing critical security notices to be disabled.
- Deduplicate repeated events and expose delivery state.

### 13.8 Knowledge and operating procedures

- Provide an internal knowledge area for procedures, scripts, FAQs, and onboarding material.
- Reuse structured content primitives where appropriate while keeping internal content isolated.
- Add ownership and review dates to reduce stale procedures.
- Provide permission-filtered contextual knowledge suggestions based on the current record or workflow; no generative AI is required.

### 13.9 Operational reports

- Deliver exportable lead funnel, response-time, workload, conversion, and activity reports.
- Document formulas and timezone behavior.
- Generate heavy exports asynchronously with access-controlled download links.

### 13.10 Quality and security

- Add permission-matrix tests, audit-event tests, critical workflow integration tests, and accessibility checks.
- Verify no cross-organization or cross-role leakage through lists, search, exports, or notifications.
- Load-test the most common staff list and search paths against realistic data volumes.

### 13.11 Release and environment visibility

- Provide read-only views of deployed version, environment health, deployment history, migration version and rollback status from the delivery system.
- Never expose deployment secrets or turn the staff portal into an unrestricted infrastructure console.

### 13.12 Capacity validation

- Update `docs/operations/CAPACITY-LEDGER.md` with measured post-phase use and safe headroom.
- Disable or defer nonessential dashboards, indexing or retention if the existing nodes cannot carry them safely.
- Record the priced next topology before enabling sustained growth.

## Deliverables

- Staff workspace and navigation
- Operations dashboard and queues
- Customer/lead timeline
- Tasks and approvals
- Authorized global search
- Notification inbox
- Internal knowledge area
- Operational reports and exports
- Permission, audit, integration, and performance test suites

## Exit criteria

- Staff can process a lead from arrival through follow-up without an external CRM.
- Every sensitive action is permission-checked and audit-recorded.
- Search, exports, and notifications cannot expose unauthorized data.
- Dashboard metrics have documented definitions and traceable sources.
- Critical staff workflows pass automated and human acceptance testing.
- The phase adds no mandatory paid platform.
- Measured capacity—not licence price—supports the deployed staff modules inside the approved ceiling.

## Rollback and recovery

- Release modules behind staff-only feature flags.
- Keep schema migrations backward-compatible until the release is verified.
- Disable individual queues, automations, search, or reporting independently.
- Preserve all source records when read models or indexes are rebuilt.
- Revert to direct lead-record processing if the dashboard aggregation fails.

## Cold-start handoff

Before beginning, read the master plan, budget guardrails, execution decomposition standard, Phases 05, 09, and 12, and the source decisions listed above. Start by writing the staff role/action matrix and customer-timeline event contract, then the exact step/write-ownership plan. Do not implement screens until those contracts are accepted. Complete this phase when the exit criteria are evidenced in `docs/evidence/phase-13/`.
