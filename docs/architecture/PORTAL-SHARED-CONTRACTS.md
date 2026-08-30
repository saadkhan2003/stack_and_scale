# Portal Shared Contracts

## Status

**Frozen technical baseline — version 0.1.**

This document defines the read-only boundary between the canonical Phase 14
commercial/support/file records and the Phase 15 client portal. It must be
approved by the product owner before portal implementation starts, and any
change afterwards requires a versioned amendment and security review.

## Purpose and non-negotiable rules

- Phase 15 consumes projections of canonical records. It does not duplicate or
  become the source of truth for proposals, contracts, invoices, payments,
  tickets, files, communications, or audit history.
- Every API query must scope results by both `organization_id` and the current
  authenticated client's `customer_id` or explicitly granted project access.
- A client must never select another customer, project, organization, file,
  invoice, contract, ticket, or document identifier and obtain data merely
  because the identifier exists.
- Client-visible data is an allow-list. Fields not listed below are internal by
  default and must not appear in API responses, search, exports, activity, or
  notifications.
- Financial, contract, and signed-download actions require a fresh sensitive
  session/MFA claim as defined by the identity policy.
- Revoking membership must block future queries and future signed URLs
  immediately. Previously issued URLs remain short-lived and are audited.

## Canonical ownership

| Domain | Canonical Phase 14 owner | Portal responsibility |
| --- | --- | --- |
| Proposal and proposal versions | `platform.proposals`, `platform.proposal_versions` | Read a published/accepted customer projection; submit acceptance only against the exact current published version. |
| Contracts and signatures | `platform.contracts`, `platform.contract_signers`, `platform.contract_artifacts` | Read client-owned status/artifact projection; launch the approved signing provider only after exact-version confirmation. |
| Invoices, payments, receipts | `platform.invoices`, `platform.payment_attempts`, `platform.payment_receipts` | Read issued financial projection and payment instructions/receipts. Never verify, reconcile, reverse, or alter a payment. |
| Support | `platform.support_tickets`, comments, events, attachments | Create/read client tickets and public comments only. Internal notes and operational records stay unavailable. |
| Private files | `platform.private_files`, versions, download audits | Request an authorized, short-lived download/upload capability after project/customer checks. |
| Provisioning | `platform.provisioning_requests`, steps | Show a customer-safe status projection only; no internal owner, risk, cost or failure detail. |
| Communications/activity | commercial communications and delivery audits | Render only allow-listed, client-relevant event types. |

## Client visibility matrix

| Record | Client-visible fields | Always internal / never returned |
| --- | --- | --- |
| Project (new Phase 15 projection) | Name, approved scope summary, published milestone status/dates, deliverable labels, client-visible risks/decisions | Internal estimates, margins, private tasks, staff assignment, internal comments, unapproved dates, operational risk detail. |
| Proposal | Title, current published version, currency, line items, totals, validity window, published/accepted/rejected/expired state, client acceptance evidence belonging to the client | Draft versions, approval requests, staff notes, internal pricing rationale, other leads/opportunities, public token hash, raw IP/user-agent evidence. |
| Contract | Client-safe template name, linked proposal version, sent/signed/cancelled state, signer identity for that client, signed artifact metadata/download | Template body history not issued to client, provider callback payloads, callback signatures, retries/errors, staff verification notes, other signers. |
| Invoice | Number, status, currency, totals, issued/due dates, line items, approved payment instructions, receipt availability | Approval records, tax configuration internals, staff creator/issuer identities, payment-provider secrets, fees, reconciliation state/details, internal credit notes. |
| Payment | Client's submitted instruction/reference status (`pending`, `verified`, `rejected`), amount/currency, receipt when issued | Payer contact, receiving account/till, proof location, duplicate detection, verifier identity, reconciliation/audit/event data, provider transaction details. |
| Support ticket | Subject, description, category, client-safe priority/status/SLA target, public comments, client-owned attachments, client-visible timestamps | `internal` comments, escalation records, pause reasons, staff owner, internal severity, internal attachments, staff-only events. |
| File/deliverable | Display name, version label, content type, size, published date, approved project folder, client-safe retention notice | Storage key, checksum, classification, scan internals, legal-hold flags, storage quota, audit identifiers, another customer's files. |
| Provisioning | Customer-safe step label, pending/in-progress/completed/blocked state, explicitly published next action | Worker trace, retry counters, failure reason, owner, privileged/high-cost flags, approval requests. |
| Activity/notification | Invitation, deliverable published, review requested, proposal/contract/invoice published, payment confirmation, public support update | Delivery errors, internal recipients, raw audit metadata, staff-only activity, any event without an explicit mapping. |

## Client roles and permitted actions

| Action | Client member | Client administrator | Staff |
| --- | --- | --- | --- |
| View organization-approved project projection | Assigned project only | Organization projects granted to the organization | Per staff authorization |
| Invite/remove client members | No | Only within own customer organization | Per staff authorization |
| View commercial documents | Assigned customer only | Customer organization | Per staff authorization |
| Accept/reject review | Assigned reviewer only | May designate reviewer; cannot override an existing decision | Per staff authorization |
| Upload/download deliverables | Explicit project grant only | Explicit project grant only | Per staff authorization |
| Create/comment on support ticket | Own customer tickets, public comments only | Customer tickets, public comments only | Staff can use public/internal channels by role |
| Record/verify/reconcile payments | No | No | Segregated staff authorization only |
| Change commercial canonical records | No | No | Per Phase 14 workflow authorization |

## API projection rules

1. Portal endpoints live under a distinct `/api/v1/portal` namespace.
2. They call dedicated portal projection services; they do not serialize staff
   service objects directly.
3. Every response is DTO/allow-list based. SQL `SELECT *` is forbidden.
4. Object access is evaluated before creating any signed file URL, and the URL
   carries a short expiry and an audit record.
5. Search accepts no unscoped global terms. It searches only the current
   portal principal's permitted projection.
6. Activity is generated from an explicit event-type allow-list and strips
   private metadata before persistence or delivery.
7. All client mutations use idempotency keys and audit the actor, exact target
   version, and authorization decision.

## Version-bound approvals

- A review or proposal acceptance stores the exact `proposal_version_id` or
  deliverable version identifier that was presented to the client.
- A later version invalidates outstanding review links and requires a new
  request. It cannot silently overwrite or reinterpret an earlier decision.
- Contract signing binds to the rendered document checksum and exact template
  and proposal version.

## Feature flags and rollback

- Portal access is disabled by default per customer organization.
- Independent flags control portal home, projects, commercial views, files,
  approvals, support and notifications.
- Disabling a flag removes access to the portal projection only. It never
  deletes canonical Phase 14 records.
- A security rollback revokes active portal sessions and stops issuing new
  signed URLs; staff retains the canonical operational workflows.

## Verification contract

Before this document is frozen, Phase 15 must add tests proving:

1. Cross-organization and cross-customer identifiers return no data.
2. Internal support notes, escalation records and attachments cannot be
   retrieved by portal API, search, activity or notifications.
3. Invoice/payment internal fields and staff approval details cannot leak.
4. Revoked users cannot obtain a new page, API response or signed URL.
5. Decisions against stale proposal/deliverable versions are rejected.
6. Each portal DTO contains only the allow-listed fields above.

## Approval record

| Field | Value |
| --- | --- |
| Contract version | `0.1` |
| Product-owner approval | Workspace-owner delegation recorded 2026-08-30 |
| Security-owner review | Implementation security review recorded 2026-08-30; amendments require a named owner review |
| Canonical-module owners | Phase 14 commercial/support/files owners |
| Approval date | 2026-08-30 |
