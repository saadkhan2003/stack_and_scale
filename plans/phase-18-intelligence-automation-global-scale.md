# Phase 18 — Intelligence, Automation, and Global Scale

## Outcome

Add advanced intelligence, automation, developer capabilities, and scale only where production evidence demonstrates value and the recurring cost can be justified.

## Why this phase exists

The platform was designed to become more capable without forcing premature complexity into the first launch. This phase is deliberately conditional: it converts measured bottlenecks and validated opportunities into targeted upgrades rather than treating enterprise-scale technology as a checklist.

## Dependencies

- Phase 15: proven client-portal use
- Phase 16: proven product-account use
- Phase 17: stable product integration contracts
- At least one meaningful production evidence window with reliable measurements

## Execution profile

- **Primary workstream:** evidence-led platform evolution
- **Can run in parallel with:** mature product work when contracts and ownership are explicit
- **Must serialize:** changes to canonical event semantics, authorization, billing truth, and regional data ownership
- **Initial external platform cost:** none assumed or pre-approved
- **Gate:** Phase 18 is a portfolio, not a single implementation batch; each capability becomes a separately approved child phase with an evidence memo, cost ceiling, privacy/security assessment, success metric and rollback plan

## Source decisions

Questions 23–25, 30–31, 49–54, 61–70, 73, 79, 85–88 and 93–100.

## Child-phase decomposition gate

For each justified capability, create `docs/execution/phase-18/<capability>/PLAN.md` and step files using [`EXECUTION_DECOMPOSITION_STANDARD.md`](./EXECUTION_DECOMPOSITION_STANDARD.md). Give the child phase its own dependency graph, exact write ownership, verification commands, evidence directory, capacity delta, recurring cost ceiling and rollback. Capabilities are approved and completed independently; Phase 18 itself is never used as a blanket authorization.

## Work packages

### 18.1 Evidence and prioritization gate

- Gather production baselines for traffic, latency, database load, search quality, staff workload, lead conversion, support volume, sync behavior, and infrastructure cost.
- Define the specific problem, affected users, current cost, target improvement, and measurement method.
- Reject upgrades justified only by trend, prestige, or hypothetical future scale.

### 18.2 Advanced analytics and read models

- Add dedicated read models, queues, warehouse technology, or ClickHouse only after PostgreSQL-based reporting becomes a measured bottleneck.
- Preserve canonical source ownership and reproducible metric definitions.
- Build data-quality checks, lineage, retention, and deletion propagation.
- Separate operational analytics from customer-facing billing truth.

### 18.3 Search evolution

- Improve ranking, synonyms, typo tolerance, or faceting based on search telemetry and failure analysis.
- Move from PostgreSQL search to a self-hosted specialist engine only when indexed volume or relevance needs justify it.
- Maintain authorization filtering and deletion propagation in every index.

### 18.4 Marketing automation

- Introduce segmentation, campaigns, newsletters, journeys, lead scoring, attribution, and experimentation from consented first-party data.
- Keep CRM as the lead/customer source of truth.
- Start with self-hosted automation where operations remain manageable; buy a service only when deliverability or labor economics justify it.
- Require frequency limits, unsubscribe handling, suppression lists, and campaign audit.

### 18.5 Workflow automation platform

- Add a governed workflow engine for repetitive, reversible processes.
- Require ownership, versioning, retries, idempotency, timeout, approval boundaries, observability, and manual recovery.
- Keep high-impact financial, legal, access, and destructive actions human-approved unless separately authorized.

### 18.6 AI-assisted capabilities

- Consider support drafting, knowledge retrieval, content assistance, lead summarization, anomaly explanation, and developer help.
- Establish evaluation datasets, quality thresholds, human review, prompt/model versioning, privacy controls, cost limits, and kill switches before release.
- Never allow generated output to become financial, legal, access-control, or customer-account truth without deterministic validation and authorized review.
- Prefer retrieval from approved knowledge with source links over unconstrained generation.

### 18.7 Public developer platform

- Productize APIs only after internal integration contracts prove stable.
- Add developer accounts, scoped credentials, documentation, sandboxing, quotas, rate limits, webhook management, usage visibility, and abuse response.
- Establish compatibility and deprecation commitments before inviting external dependency.

### 18.8 Reliability and regional scale

- Scale vertically and optimize queries before adding distributed infrastructure.
- Introduce replicas, managed services, queue clusters, or regional deployments only from measured availability, latency, recovery, or residency requirements.
- Document data ownership, consistency, failover, backup, and failback for every region.
- Test recovery and failback; a second region is not useful merely because it exists.

### 18.9 Compliance maturity

- Expand evidence collection, vendor review, data mapping, retention enforcement, access reviews, incident exercises, and policy management according to customer and jurisdiction demands.
- Treat certifications as business programs with owners and evidence, not as application features.

### 18.10 Cost governance

- Attribute infrastructure and provider costs by capability where practical.
- Set alerts and monthly ceilings before activating usage-priced services.
- Record buy-versus-self-host reasoning including engineering and operational burden.
- Require an explicit budget change to exceed the current production ceiling.
- Update measured capacity before and after every child phase; include model/API usage caps for AI and storage/egress/replica cost for data or regional work.

## Deliverables

- Evidence memo and approved business case for each activated capability
- Targeted analytics/search/automation/AI/scale implementations
- Evaluation and quality evidence
- Updated threat, privacy, recovery, and cost models
- Developer-platform contracts if activated
- Regional runbooks if activated
- Updated architecture decisions and operational ownership

## Exit criteria

- Every activated capability solves a measured problem and meets its declared success metric.
- Recurring costs remain inside an explicitly approved budget.
- AI features pass task-specific evaluations and retain human/automatic safety boundaries.
- New data stores preserve authorization, retention, deletion, lineage, and recovery requirements.
- New regional or distributed components pass failover and failback exercises.
- Unjustified capabilities remain unbuilt without blocking the mature core platform.

## Rollback and recovery

- Launch each advanced capability behind independent flags or routing controls.
- Preserve the simpler baseline path until the replacement is proven.
- Cap usage-priced services and provide kill switches.
- Retain canonical records outside disposable indexes, models, or read stores.
- Revert regional routing only through tested failback procedures.

## Cold-start handoff

Read the entire master plan, budget guardrails, execution decomposition standard, Phases 15–17, operational reports, incidents, cost records and the source decisions above. Do not begin with implementation. First write an evidence memo naming the measured problem, baseline, target, cost, capacity, risks, owner, evaluation and rollback, then create a child-phase plan. If that memo cannot justify the capability, leave it unbuilt.
