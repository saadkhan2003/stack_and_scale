# Phase 16 Execution Plan — product-customer account control plane

## Outcome

Deliver a separate, feature-flagged product-customer account/control plane for
catalogue, product organizations, subscriptions, entitlements, licenses,
billing, releases and product support. It consumes Phase 14 commercial truth
and the frozen portal contract; it never becomes a product runtime dependency.

## Entry gate

- The portal shared contract is frozen at version `0.1`.
- Phase 14 commercial, support, documents and provisioning modules remain
  canonical and read-only inputs.
- Phase 15 rollout evidence is complete, including an approved QA-client
  journey, capacity capture and organization-level flag rollback/recovery.

## Serialized work order

1. `16.0-contracts`: freeze account-domain boundaries and four independent
   state-machine contracts: subscription, payment, entitlement and license.
2. `16.1-catalog-organizations`: product catalogue, versioned plans and
   explicit product-customer organizations, branches and roles.
3. `16.2-subscriptions`: audited subscription lifecycle and manual override
   policy, separate from invoices and payments.
4. `16.3-entitlements`: deterministic versioned entitlement resolver and
   downstream snapshot contract.
5. `16.4-licenses-installations`: installation identity, leases, revocation,
   signing-key metadata and offline-grace controls.
6. `16.5-billing-account`: bounded customer views over Phase 14 invoices,
   receipts, payment instructions and billing contacts.
7. `16.6-releases-downloads`: signed/checksummed release registry and
   authorization/audit boundary for downloads.
8. `16.7-support-notifications`: product-scoped support/status projections and
   notification preferences without private operational disclosure.
9. `16.8-assurance-capacity`: isolation, outage, duplicate-event, key-rotation,
   browser, rollback and capacity evidence.

## Write ownership

| Step | Owns | Must not modify |
| --- | --- | --- |
| 16.0 | Account contracts and state diagrams | Portal shared contract, canonical Phase 14 modules |
| 16.1 | Product catalogue and account-organization modules | Billing, licenses, canonical customer records |
| 16.2 | Subscription state and events | Invoice/payment state, entitlement resolver |
| 16.3 | Entitlement definitions, resolver and snapshots | Subscription transitions, product runtime databases |
| 16.4 | License, installation and key-metadata modules | Signing-key secrets, billing truth |
| 16.5 | Account billing projections | Phase 14 invoice/payment mutation flows |
| 16.6 | Release metadata, authorization and download audit | Storage provider activation, permanent object URLs |
| 16.7 | Product support/status projections and preferences | Internal support notes, transport-provider configuration |
| 16.8 | Evidence, capacity and rollback artifacts | Business-domain semantics |

## Non-negotiable rules

- Product accounts are distinct from the Phase 15 custom-development portal.
- Subscription, payment, entitlement and license state are separate and
  reconcilable; a paid invoice alone never grants product access.
- Product runtimes cache time-bounded entitlement snapshots and tolerate a
  control-plane outage within the defined lease/grace policy.
- Signing keys and credentials stay outside application tables and Git.
- Downloads require authorization, checksum/signature verification and audit;
  no permanent public object URL is permitted.

## Capacity and rollout

The existing OVH node remains the initial host only after `16.8` records CPU,
memory, disk, database, backup and release-storage measurements. Account,
catalogue, automated billing, downloads and license enforcement must each be
flagged independently. No paid platform is introduced by default.

## Evidence and merge order

Each step records non-sensitive evidence in
`docs/evidence/phase-16/<step-id>/`. Merge only in the listed order. A later
step may consume a frozen prior contract but may not alter it; amendments are a
new serialized `16.0` revision with product and security review.
