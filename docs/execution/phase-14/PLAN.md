# Phase 14 Execution Plan

## Outcome

Extend the staff platform into provider-neutral commercial, support, document
and customer-provisioning workflows without hard-coding jurisdictional or
financial assumptions.

## Work order

1. Define money, currency, tax, numbering, document version and state contracts.
2. Build proposals with immutable versions, approvals, publication and acceptance.
3. Build contracts behind an e-sign adapter gate; retain controlled upload fallback.
4. Build invoices, payment records, reconciliation and compensating corrections.
5. Build support tickets and SLA clocks with internal/public content separation.
6. Build private file metadata, versioning, signed access and retention hooks.
7. Build idempotent customer provisioning and provider-neutral communications.
8. Verify scenarios, capacity, provider cost and recovery behavior.

## External decision gates

- Legal owner approves proposal/contract language and acceptance semantics.
- Tax owner approves jurisdiction, tax rates and invoice numbering policy.
- Finance owner approves payment methods and reconciliation authority.
- E-sign provider must be legally suitable, affordable and operationally tested.
- Object storage and malware scanning must be selected before customer uploads.

Until these decisions exist, code uses explicit configuration and manual fallback;
it does not claim legal signature, payment settlement or tax compliance.

## Ownership

- 14.1 owns shared commercial contracts and money tests.
- 14.2-14.5 own proposal, contract, invoice/payment and accounting adapters.
- 14.6-14.7 own support and private-file boundaries.
- 14.8-14.9 own provisioning and communications.
- 14.10-14.11 own verification and capacity evidence.

## Cost and capacity

Use PostgreSQL and the existing OVH host initially. Provider usage must have
explicit caps. No payment or e-sign provider is enabled by default.

## Safety

Issued documents and financial events are append-only. Corrections use versions,
credits, voids or reversals. Browser redirects never establish payment truth.
