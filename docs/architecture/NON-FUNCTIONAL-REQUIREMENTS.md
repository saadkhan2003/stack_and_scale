# Non-Functional Requirements

## Initial service objectives

| Area               | V1 requirement                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Availability       | public web and API designed for 99.5% monthly availability; planned maintenance announced where material                                                             |
| Recovery           | target RPO: 24 hours until point-in-time recovery is proven; target RTO: 8 hours for full service restoration; tighter objectives require evidence and cost approval |
| Public performance | mobile-first, cached public content; no required 3D; validate Core Web Vitals at the 75th percentile before launch                                                   |
| API performance    | define endpoint budgets in implementation; expensive reports/search are asynchronous or paginated                                                                    |
| Accessibility      | WCAG 2.2 AA target; keyboard, focus and reduced-motion support are release criteria                                                                                  |
| Data location      | primary production/data region London, United Kingdom (OVHcloud VPS-2); a region change requires privacy and operational review                                      |
| Observability      | structured logs, metrics, errors and traces with correlation IDs; privacy filtering and bounded retention                                                            |
| Audit              | security/sensitive business actions append-oriented and retained for 2 years unless a hold/requirement says otherwise                                                |
| Dependencies       | pinned lockfile; regular dependency/container review; critical security patches expedited                                                                            |
| Containers         | minimal images, non-root where practical, image provenance/scan before production                                                                                    |
| Cost               | external platform budget must remain within the initial USD 50/month guardrail; prefer self-hosted/open standards                                                    |

## Operational budgets

- No production schema change without version control, staging validation, backup/readiness check, and roll-forward/rollback plan.
- No preview environment inherits production credentials or production personal data.
- Telemetry retains only allow-listed fields; error and trace retention begins at 30 days, subject to implementation evidence and legal needs.
- Every alert has a severity, owner, actionable condition and linked runbook; alerts without an owner are defects.
- AI is optional: core workflows must remain functional when any AI provider is unavailable.

## Review cadence

Reassess objectives before public launch and quarterly thereafter. Raising an objective requires monitoring, load/restore evidence and a cost impact review; lowering it requires a documented decision and stakeholder acceptance.
