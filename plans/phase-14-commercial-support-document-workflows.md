# Phase 14 — Commercial, Support, and Document Workflows

## Outcome

Turn the staff platform into an end-to-end business operations system for proposals, contracts, invoices, payments, support, files, and customer provisioning.

## Why this phase exists

Leads become customers through commercial documents, agreement, payment, support, and provisioning. These workflows must share customer truth and audit history while allowing replaceable integrations for legally or financially specialized services.

## Dependencies

- Phase 13: staff operations platform
- Phase 11: secure files, monitoring, recovery, and audit operations

## Execution profile

- **Primary workstream:** commercial operations and customer service
- **Can run in parallel with:** low-risk content work and infrastructure cost optimization
- **Must serialize:** commercial state-machine and shared document-schema changes
- **Initial external platform cost:** determined by the e-sign/payment provider gate; transaction charges occur only when used and must have a cap
- **Gate:** legal, tax, payment and signature rules must be configured, not hard-coded; the execution and capacity plans must pass before implementation

## Source decisions

Questions 12–17, 32–47, 51–54, 58–60, 65, 70, 79 and 88.

## Execution decomposition gate

Create `docs/execution/phase-14/PLAN.md` and independently reviewable step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). Freeze money, document-version, payment, signature, file and support contracts before UI work. Assign exact domain/migration ownership and evidence under `docs/evidence/phase-14/`.

## Work packages

### 14.1 Shared commercial primitives

- Define money, currency, tax, discount, line-item, numbering, organization, contact, address, and status primitives.
- Store monetary values in minor units with explicit currencies.
- Make documents immutable after issuance; corrections create a new version, credit, cancellation, or replacement.
- Establish jurisdiction-aware configuration points for future legal review.

### 14.2 Proposal workflow

- Build proposal drafting, line items, optional items, validity dates, approvals, versioning, publication, viewing, and acceptance.
- Generate branded PDFs from canonical structured data.
- Record delivery and acceptance evidence without claiming this is a qualified digital signature.
- Link proposals to leads, opportunities, customers, products, services, and projects.

### 14.3 Contract workflow and e-sign boundary

- Support approved templates, variables, versions, review, and signed-document storage.
- Create an adapter boundary for external or self-hosted e-signature systems.
- Deliver one operational external or self-hosted e-signature integration before this phase exits, including signer identity/evidence, document-version binding, provider callbacks, failure/retry and signed-artifact retention.
- Evaluate self-hosted Documenso and suitable external services for legal suitability, resource use, data location, export and cost; if no option can satisfy the locked decision and budget, stop and record a user-approved decision amendment rather than silently deferring it.
- Retain uploaded signed contracts as a controlled fallback, not as the completion substitute for the integration.

### 14.4 Invoice and payment workflow

- Build draft, approval, issue, due, partial payment, paid, overdue, void, refund, and reconciliation states.
- Keep invoices separate from payment attempts and provider transactions.
- Support bank transfer, Easypaisa, JazzCash, Raast and authorized staff-recorded cash as explicit payment methods.
- Capture proof, reference, sender/payer details where legally appropriate, received time, amount and receiving account/till; new payments remain pending until authorized verification.
- Enforce segregation of duties for recording/verification where configured, detect duplicate proof/reference use and audit overrides.
- Support allocation across invoices, partial allocation, reversal/correction and receipt generation without deleting the original financial event.
- Integrate payment providers through adapters and verified webhooks; never trust browser redirects as payment truth.
- Capture provider fees and references for reconciliation.

### 14.5 Accounting integration readiness

- Define versioned accounting export and adapter contracts for customers, invoices, credits, payments, fees, taxes and reconciliation events.
- Provide a deterministic export before selecting a paid accounting integration.
- Record mappings, export periods, correction behavior and duplicate-import protection.

### 14.6 Support operations

- Deliver ticket intake, category, severity, priority, ownership, status, SLA target, comments, attachments, and escalation.
- Allow creation by staff and, later, clients through the same domain model.
- Separate public/client comments from internal notes.
- Track first-response and resolution clocks with pause rules.

### 14.7 Documents and files

- Create access-controlled file metadata, versioning, ownership, retention, malware-scanning hook, and download audit.
- Store blobs outside the relational database through an S3-compatible abstraction.
- Use time-limited signed access and verify authorization before issuing it.
- Define quotas and lifecycle policies before customers upload files.

### 14.8 Customer provisioning baseline

- Convert an accepted commercial outcome into a customer, project or product-account provisioning request.
- Make provisioning idempotent and resumable.
- Show each step, failure, retry, and responsible owner.
- Require approval before provisioning high-cost or privileged resources.

### 14.9 Communications

- Create template-controlled notifications for proposal publication, acceptance, invoice issue, payment receipt, overdue reminders, ticket updates, and provisioning.
- Respect consent and notification preferences where applicable.
- Keep a delivery log and human-readable resend path.

### 14.10 Verification

- Test document version immutability, rounding, currencies, webhook signatures, duplicate events, partial payments, access controls, and audit history.
- Conduct scenario walkthroughs for correction, cancellation, refund, dispute, expired proposal, and failed provisioning.
- Verify restore of document metadata and blob storage references.
- Test every local payment method, pending/verified state, segregation, duplicate evidence, allocation, reversal and receipt.
- Test e-sign callback authenticity, duplicate callbacks, signer/document version binding, failure recovery and artifact export.

### 14.11 Capacity and cost validation

- Measure PDF generation, file storage/scanning, support, e-sign and payment workloads; update the capacity ledger.
- Record transaction/usage caps and the next safe topology/provider cost.
- Do not claim zero additional cost unless measured headroom supports the selected e-sign service and workloads.

## Deliverables

- Shared commercial model
- Proposal and contract workflows
- Invoice, payment, and reconciliation workflows
- Support ticket system
- Secure document/file service
- Idempotent provisioning workflow
- Commercial communications
- Scenario and security test evidence

## Exit criteria

- Staff can move a qualified lead through proposal, acceptance, invoice, payment record, customer creation, and provisioning.
- Issued commercial documents remain historically reproducible.
- Payment truth comes from verified provider events or authorized reconciliation.
- Client-visible and internal support content are strictly separated.
- Files are private by default, recoverable, and audited.
- All five approved local payment methods operate with evidence, verification, reconciliation and receipts.
- One legally suitable e-sign integration operates end to end; any recurring provider cost is explicitly approved within the active budget.
- No paid CRM or support desk is required for the baseline.

## Rollback and recovery

- Gate each workflow module independently.
- Preserve issued documents and financial event history through rollbacks.
- Use compensating actions rather than deleting commercial records.
- Fall back to controlled manual reconciliation for all approved methods and uploaded signed documents during an integration outage without declaring the e-sign integration requirement complete.
- Pause provisioning without losing its state and resume after correction.

## Cold-start handoff

Read the master plan, budget guardrails, execution decomposition standard, Phases 11 and 13, and the source decisions above. First produce the commercial state diagrams, money/rounding rules, provider gate and exact step/write-ownership plan. Obtain business and jurisdiction-specific confirmation before production use. Finish only after every exit criterion has evidence under `docs/evidence/phase-14/`.
