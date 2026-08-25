# Phase 15 — Custom-Development Client Portal

## Outcome

Give service clients a secure, calm, self-service portal for projects, milestones, deliverables, proposals, invoices, support, documents, and communication.

## Why this phase exists

Custom-development customers need visibility without access to internal operating details. This phase exposes carefully designed projections of the staff system rather than duplicating customer, project, financial, or support data.

## Dependencies

- Phase 14: commercial, support, document, and provisioning workflows
- Phase 05: tenant-aware identity and authorization

## Execution profile

- **Primary workstream:** client experience
- **Can run in parallel with:** Phase 16 after shared contracts are frozen
- **Shared-write warning:** coordinate changes to customer, invoice, support, file, and notification contracts with Phase 16
- **Initial external platform cost:** $0; uses the existing platform
- **Gate:** every exposed field has an explicit client-visibility rule, the shared portal contract is frozen, and measured capacity supports rollout

## Source decisions

Questions 15, 17, 28–43, 46, 51, 56, 59, 65, 70, 79, 84, 88–89.

## Execution decomposition and contract-freeze gate

Before parallel portal work, approve `docs/architecture/PORTAL-SHARED-CONTRACTS.md`. Then create `docs/execution/phase-15/PLAN.md` and step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). The client-app lane may consume frozen customer, invoice, file, support, notification and audit contracts but may not edit their canonical modules concurrently with Phase 16. Record evidence under `docs/evidence/phase-15/`.

## Work packages

### 15.1 Client organization and access

- Support client organizations, members, invitations, roles, project access, and member removal.
- Allow a client administrator to manage members only within authorized boundaries.
- Require stronger authentication for sensitive financial or contract actions.
- Audit invitations, membership changes, downloads, and acceptance events.

### 15.2 Portal home

- Present current projects, upcoming milestones, pending client actions, open support requests, unpaid invoices, and recent activity.
- Prioritize clarity and next action over internal operational detail.
- Explain status in customer language.

### 15.3 Project visibility

- Expose project summary, approved scope, milestones, progress, client-visible tasks, decisions, risks, and deliverables.
- Maintain internal-only fields and comments separately.
- Define who may publish each item to the client.
- Show dates and status history without promising unsupported precision.

### 15.4 Reviews and approvals

- Support client review requests, feedback, decision deadlines, acceptance, rejection, and revision cycles.
- Capture actor, timestamp, version, and comment for every decision.
- Prevent approval against an outdated artifact version.

### 15.5 Commercial self-service

- Let authorized clients view proposals, contracts, invoices, payment instructions, receipts, and account statements.
- Use the canonical Phase 14 records and generated documents.
- Keep sensitive internal margins, notes, and approvals invisible.

### 15.6 Files and deliverables

- Provide project-scoped folders or collections, upload/download, version labels, previews where safe, and clear ownership.
- Apply quotas, file-type controls, malware-scanning hooks, and signed access.
- Preserve a delivery history for contractual evidence.

### 15.7 Support and communication

- Let clients create and follow support tickets, add public replies, attach files, and see service targets.
- Add project discussion threads only when they have explicit ownership and notification behavior.
- Keep internal notes impossible to retrieve through API, exports, search, or notifications.

### 15.8 Activity and notifications

- Provide a client-visible activity feed generated from approved event types.
- Send notifications for invitations, review requests, new deliverables, proposals, invoices, payment confirmation, and support updates.
- Allow preferences while preserving security and contractual notifications.

### 15.9 Accessibility, mobile use, and verification

- Optimize key actions for mobile browsers and low-bandwidth connections.
- Meet the platform accessibility target for navigation, forms, status, files, and documents.
- Test tenant isolation, role boundaries, stale links, revoked access, signed URLs, and all internal/public separation points.

### 15.10 Capacity validation

- Measure authenticated sessions, project queries, file transfer, notifications and support load.
- Update the capacity ledger with safe headroom, degradation controls and the priced scale trigger.
- Roll out by organization and keep the portal disabled if the current topology lacks safe capacity.

## Deliverables

- Client organization and membership controls
- Client dashboard
- Project and milestone views
- Review and approval flow
- Commercial document self-service
- Secure project files and deliverables
- Client support interface
- Activity feed and notifications
- Isolation, accessibility, and acceptance test evidence

## Exit criteria

- A client can securely follow a project and complete all expected client actions.
- No internal-only field, note, file, search result, notification, or event leaks to clients.
- Revoked users lose access promptly, including to newly requested signed links.
- Approvals are bound to exact versions and audit evidence.
- Portal workflows reuse canonical platform records rather than maintaining shadow copies.
- The portal fits the initial self-hosted cost envelope.
- The phase has an approved step plan, disjoint write ownership and measured capacity evidence.

## Rollback and recovery

- Release portal capabilities behind organization-level feature flags.
- Disable uploads, approvals, financial views, or support independently.
- Maintain staff-side alternatives for every client action during rollout.
- Revoke signed links and sessions during a security rollback.
- Never delete canonical project or commercial history when disabling the portal.

## Cold-start handoff

Read the master plan, budget guardrails, execution decomposition standard, Phases 05 and 14, and the source decisions above. Begin with the shared-contract freeze, field-by-field visibility matrix, role/action matrix and exact step/write-ownership plan. Finish only when tenant-isolation and internal-data-leak tests pass with evidence under `docs/evidence/phase-15/`.
