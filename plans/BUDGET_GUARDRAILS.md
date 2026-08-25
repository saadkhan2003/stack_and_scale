# Initial External-Platform Budget Guardrails

**Monthly ceiling:** USD 50  
**Scope:** external platforms and infrastructure only  
**Excluded:** developer labor, devices, office expenses, internet and optional coding-assistant subscriptions

## Must-fit initial production envelope

| Item | Target monthly cost | Rule |
|---|---:|---|
| Hetzner application node | $18.50 maximum planned | One 16 GB shared cloud node; hosts only approved lightweight V1 services |
| Hetzner database node | $10.50 maximum planned | One 8 GB node on a private network; no public database exposure |
| Hetzner automated backups | $5.80 maximum planned | Budgeted at 20% of both nodes; convenience recovery only |
| Primary IPv4 | $0.60 maximum planned | Application edge only; database remains private |
| Geographically separate backup storage | $4.00 maximum planned | Required outside the primary location/failure domain; must be restore-tested |
| Domain and minimal object-storage reserve | $1.50 maximum planned | Annual domain normalized monthly; no paid storage scale-up without approval |
| Ephemeral staging reserve | $1.50 maximum planned | Created only for release validation, then deleted |
| Cloudflare | $0 | Free plan initially |
| Transactional email | $0 | Free allowance initially |
| Git hosting and CI | $0 | Free plan and strict usage budget |
| Analytics | $0 | Self-hosted or free allowance |
| Monitoring/status | $0 | Self-hosted plus free external uptime checks |
| Taxes, exchange spread and unallocated contingency | $4.50 maximum planned | Covers invoice variation; no paid-service overage is assumed |

**Planned maximum total:** USD 46.90/month. **Hard unallocated buffer:** USD 3.10/month. The Phase 10B purchase gate must re-check live official prices, taxes and exchange costs; if the projected total exceeds USD 50, reduce/cap staging or optional storage first, then stop for user approval rather than silently exceed the ceiling.

## Hard rules

1. No recurring platform is purchased merely because it is convenient.
2. A paid service requires a written reason, owner, monthly cap and exit path.
3. Cloudflare Pro, paid CRM, paid identity, paid analytics, paid status, paid search and paid marketing automation are prohibited during initial V1 unless the user explicitly changes the budget.
4. Transactional email may move to a paid plan only when real sending volume or deliverability requires it.
5. Staging servers are ephemeral: create for release validation and delete after the release window.
6. Database and backup safety may not be removed to fund visual or convenience tools.
7. Production budget alerts are set at 50%, 75%, 90% and 100% of the monthly ceiling.
8. Usage-based services default to a hard stop rather than unlimited overage.
9. AI API, official WhatsApp messaging and SMS costs belong to later phases and require customer or revenue justification. Phase 14 still requires the approved e-signature and local-payment capabilities; their provider or self-hosted operating cost must pass that phase's explicit budget gate.
10. “Self-hosted” means zero licence cost, not zero infrastructure cost. No later phase may claim a zero cost delta without measured spare capacity.

## Self-hosted defaults

- CRM: Stack & Scale application modules
- CMS: Payload CMS
- Database: PostgreSQL
- Cache/queue: Valkey or Redis-compatible service
- Identity: standards-based open-source identity service selected in Phase 05
- Analytics: Umami or an equivalently lightweight privacy-aware platform
- Monitoring: Prometheus, Grafana and Loki with OpenTelemetry conventions
- Status: Uptime Kuma or equivalent
- Search: PostgreSQL search initially; Meilisearch/Typesense only after evidence
- Secrets: unresolved until the Phase 00 ADR proves access audit, key custody, rotation and recovery; SOPS plus age is acceptable only with documented limitations and compensating controls
- Support: Stack & Scale ticket module
- Scheduling: simple internal booking first; self-hosted Cal.com only if needed

## Budget review gate

At the end of each launch-affecting phase, record:

- current monthly recurring cost;
- projected cost after deployment;
- usage-based exposure;
- service cancellation/export path;
- remaining contingency.

No phase may pass its exit gate if the projected initial total exceeds USD 50 without explicit user approval.

## Capacity ledger

Phase 00 creates `docs/operations/CAPACITY-LEDGER.md`. Phases 10–18 update it using measured values for:

- CPU baseline, peak and sustained saturation;
- memory working set, peak and out-of-memory margin;
- disk use, growth, I/O and backup volume;
- database connections, query latency and storage growth;
- log, metric, trace and analytics retention;
- network transfer and provider usage limits.

Every phase records current use, projected post-phase use, minimum safe headroom, degradation controls, a scale trigger and the exact monthly cost of the next safe topology. If the current nodes cannot carry a feature safely within USD 50, that feature remains disabled or the user approves a budget change.

## Recovery-cost rule

The backup target must be geographically separate from the primary Hetzner location and isolated by account or credentials so a primary compromise cannot delete both copies. The final provider is selected in Phase 00/10B. Cost estimates must include database-consistent backups, point-in-time logs where adopted, media, identity data, application configuration, IaC state, status configuration and protected recovery-key material.
