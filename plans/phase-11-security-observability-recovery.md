# Phase 11 — Security Operations, Observability and Recovery

## Outcome

Make the V1 platform diagnosable, recoverable and defensible through self-hosted telemetry, actionable alerts, audit controls, backup validation and operational runbooks.

## Execution profile

- **Model tier:** strongest available reasoning model
- **Mode:** 11A after Phase 04; 11B only after completed Phase 05 and Phase 10B
- **External-platform spend:** $0 licence cost; storage included in budget
- **Depends on:** Phases 04, 05 and 10
- **Unlocks:** Phase 12

## Work packages

### 11A.1 Telemetry conventions

- OpenTelemetry-compatible correlation across web, API, jobs and integrations.
- Structured logs with redaction.
- Application and business metrics.
- Traces sampled within resource limits.
- Retention and disk-usage policies.

### 11B.1 Self-hosted monitoring

- Prometheus-compatible metrics.
- Grafana dashboards.
- Loki-compatible logs.
- Uptime Kuma status/heartbeat checks or equivalent.
- External free uptime checks so a failed server can still be detected.
- Operate a public `status.company.com` surface whose publishing path does not depend solely on the affected application origin.

### 11B.2 Alert policy

- Severity, owner and response target.
- Application unavailable.
- Database unavailable or storage nearing capacity.
- Backup missed.
- Lead intake, email, booking or job failure.
- Authentication anomaly and repeated authorization denial.
- Alert deduplication and maintenance windows.

### 11B.3 Security and secrets operations

- Dependency and container scanning.
- Patch cadence.
- Secret rotation.
- Staff access review.
- Upload and webhook abuse handling.
- Incident evidence preservation.
- Named production-secret access, access review/evidence, key custody, rotation, break-glass approval and compromised/lost-key recovery according to the accepted ADR.

### 11B.4 Backup implementation

- PostgreSQL base/logical backup strategy and point-in-time capability where feasible.
- Encrypted copies geographically separate from the primary Hetzner location and isolated by provider/account or independently protected credentials.
- Database-consistent base backups plus WAL/PITR where adopted and tested.
- Identity, CMS, media/files, application configuration, IaC state, monitoring/status configuration and protected recovery-key material.
- Backup credential separation and deletion resistance/immutability where practical.
- Retention and deletion policy.

### 11B.5 Restore exercises

- Restore database into an isolated environment.
- Restore application configuration and files.
- Rebuild infrastructure from code.
- Measure recovery point and recovery time.
- Record gaps and rerun until objectives pass.
- Restore in the documented complete-system order, including identity, secrets/key recovery, IaC state, monitoring and status.

### 11B.6 Incident and status workflow

- Detection, triage, severity, containment, recovery and communication.
- Public status update template.
- Post-incident review template.
- No status component depends solely on the affected origin.

### 11B.7 Resource and retention validation

- Measure monitoring CPU, memory, disk I/O and storage under representative V1 load.
- Set log/metric/trace retention and sampling to remain inside the capacity ledger.
- Define graceful degradation: reduce tracing, shorten nonessential telemetry retention and preserve critical audit/security evidence first.
- Record the scale trigger and cost before adding later portals or operations modules.

## Exit criteria

- Critical technical and business failures produce actionable alerts.
- Telemetry contains no known secrets or unnecessary form content.
- A full restore has succeeded from off-server backups.
- Recovery measurements meet Phase 03 targets.
- Security and incident runbooks have named owners.
- Monitoring fits node resources and the $50 budget.
- Status communication remains available during a primary-origin outage.
- A complete restoration, including identity, configuration, IaC state and key recovery, meets measured RPO/RTO.

## Rollback and recovery

Telemetry exporters are adapter-based and can be disabled independently. Security controls may be rolled back only when they cause a verified outage and an equivalent compensating control is active.

## Cold-start handoff

Read Questions 40, 48–54, 70, 79, 82 and 96–98 plus the Phase 03 threat model.
