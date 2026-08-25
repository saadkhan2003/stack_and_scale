# Provider Decision Register

## Budget and selection rule

The USD 50/month ceiling is binding. No provider is purchased in Phase 00. Each decision needs an ADR or recorded provider assessment covering recurring/usage cost, data location, export, security, operational burden, failure mode, cancellation path and capacity impact.

| Capability | Initial direction | Decision status | Owner phase | Gate before activation |
|---|---|---|---|---|
| Compute/database | Hetzner application + private database nodes | Baseline approved; exact server/location validated in 10B | 10 | Capacity ledger, threat model, bill under $50 |
| Edge/DNS/CDN | Cloudflare Free | Baseline approved | 10B | Origin controls, privacy/cookie configuration, no Pro upgrade |
| CMS | Payload CMS self-hosted | Approved | 06 | Compatible supported versions, backup and access plan |
| Database | PostgreSQL self-hosted | Approved | 04, 10 | Migration, backup/PITR and restore evidence |
| Identity | Open-source standards-based provider | Unresolved ADR | 05 | MFA, recovery, backups, resource use, export and maintenance evidence |
| Transactional email | Free-tier provider behind adapter | Unresolved provider | 09 | Deliverability, domain authentication, quota/overage cap, export path |
| Object storage | S3-compatible provider/target | Unresolved provider | 10, 14 | Private access, lifecycle, backup, egress and restore test |
| Backup target | Geographic/failure-domain separation | Unresolved ADR | 00, 10B | Independent credentials/account, encryption, restore and deletion resistance |
| Secrets | SOPS + age constrained operating model | Selected for Phase 01; production validation in 10B | 00, 01, 10B | Named custodians/access evidence, separate recipients, rotation, break-glass and lost-key recovery |
| Analytics | Self-hosted Umami or approved equivalent | Baseline approved | 08, 11 | Consent, retention, capacity and deletion propagation |
| Monitoring/status | Self-hosted telemetry plus independent public status path | Baseline approved | 11 | Retention/capacity, alert and origin-outage proof |
| Scheduling | Simple internal booking initially | Approved direction | 09 | Calendar integration and cost gate before any hosted scheduler |
| E-signature | Self-hosted or external legally suitable integration | Deferred to Phase 14 | 14 | Legal suitability, signer evidence, callback security, capacity/cost approval |
| Payments | Local method adapters plus staff verification | Deferred to Phase 14 | 14 | Evidence, reconciliation, fraud controls and transaction-cost caps |

## Prohibited initial recurring purchases

Cloudflare Pro, paid CRM, paid identity, paid analytics, paid status, paid search and paid marketing automation. Any exception needs user approval through `PLAN-CHANGES.md`.
