# Phase 11 — Security, Observability and Recovery Operations

## Purpose and boundaries

This runbook activates the Phase 11 local implementation. It does not claim a
live production deployment, a configured backup provider, an alert recipient,
or a successful restore drill. Those must be recorded as evidence after the
owner completes the OVH, Cloudflare, domain, backup and notification setup.

Telemetry must contain correlation IDs, route templates, status codes and
timing only. Never log request bodies, form content, cookies, authorization
headers, access tokens, email addresses, phone numbers, passwords or secrets.

## Monitoring installation

The production Compose base is extended with `infra/compose.observability.yaml`.
It keeps Prometheus, Loki, Promtail, Grafana and host/container exporters on an
internal Docker network. Grafana is accessed by an SSH tunnel; it is not a
public Caddy route. `/metrics` is explicitly denied at the public API proxy and
is scraped only over the Docker network with a secret bearer token.

Before enabling it on the server:

1. Generate a 32-byte-or-longer metrics token and a separate Grafana admin
   password. Store each in the protected server files below with `0600`
   permission, owned by `root`. The Compose services read them through Docker
   secrets; do not place either value in `.env.production`.
2. Create `/opt/stack-and-scale/secrets/metrics-bearer-token` and
   `/opt/stack-and-scale/secrets/grafana-admin-password`.
3. Change the two Compose secret `file:` paths to these protected paths if the
   checked-out deployment root differs from the standard host path.
4. Start with:

   ```bash
   IMAGE_TAG=COMMIT_SHA IMAGE_REGISTRY=ghcr.io/OWNER/LOWERCASE_REPOSITORY \
     docker compose --env-file /opt/stack-and-scale/.env.production \
     -f /opt/stack-and-scale/infra/compose.production.yaml \
     -f /opt/stack-and-scale/infra/compose.observability.yaml up -d
   ```

   Set `ENABLE_OBSERVABILITY=1` in the protected deployment environment for
   subsequent `scripts/deploy-promote.sh` promotions. The script refuses to
   enable monitoring unless both secret files exist on the target host.

5. Tunnel Grafana rather than expose it:

   ```bash
   ssh -L 3001:127.0.0.1:3001 ubuntu@SERVER_IP
   ```

   If Grafana is internal-only, use Docker's internal service access through an
   authenticated administrative tunnel or a separate restricted edge route;
   never publish an anonymous dashboard.

The current allocation is a maximum of 1.25 GiB RAM and 1.15 vCPU across the
monitoring containers. Measure it under representative traffic before treating
it as safe on the OVH VPS-2; reduce traces first, then log retention, then metrics
retention if core services are affected.

## Alerts

Prometheus rules cover API unavailability, API 5xx bursts, host disk pressure,
host memory pressure and a missed verified backup. Before launch, connect an
alert receiver controlled by the named platform owner and test delivery.

| Severity | Owner                                            | Target         | Initial response                                                    |
| -------- | ------------------------------------------------ | -------------- | ------------------------------------------------------------------- |
| Critical | Platform on-call — **assign name before launch** | 15 minutes     | Acknowledge, open incident, protect evidence/status, contain impact |
| High     | Platform on-call — **assign name before launch** | 4 hours        | Investigate, mitigate, record decision and follow-up                |
| Medium   | Service owner — **assign name before launch**    | 1 business day | Triage in operations backlog                                        |

Deduplicate by alert name and affected environment. Put alerts in a maintenance
window before an approved deployment/migration and remove the window after
readiness and business smoke checks pass. A missing alert destination means the
alert policy is not operationally complete.

Required business alert checks before launch: lead intake failure, email
delivery/dead-letter failure, booking collision/job failure, backup miss,
repeated authentication failure and repeated authorization denial. The API now
exports only route/status counters plus durable outbox-status gauges; the alert
rules cover API 5xx, dead-letter events, repeated booking collisions and
repeated `401`/`403` denials. Do not use form content or personal data as metric
labels.

## Backup and restore

`scripts/backup-production.sh` creates a PostgreSQL-consistent logical export,
captures deployment/IaC/monitoring artifacts, encrypts them with Restic and
prunes to 14 daily, 8 weekly and 12 monthly recovery points. Its Restic
repository and password file must use a provider/account or credentials
independent from OVH. Provider server backups are useful convenience copies,
not a substitute.

Install the timer only after `backup.env` has independently protected
credentials:

```bash
sudo install -m 0644 infra/backup/stack-and-scale-backup.service /etc/systemd/system/
sudo install -m 0644 infra/backup/stack-and-scale-backup.timer /etc/systemd/system/
sudo install -d -m 0700 /etc/stack-and-scale
sudoedit /etc/stack-and-scale/backup.env
sudo chmod 0600 /etc/stack-and-scale/backup.env
sudo systemctl daemon-reload
sudo systemctl enable --now stack-and-scale-backup.timer
sudo systemctl start stack-and-scale-backup.service
```

`/etc/stack-and-scale/backup.env` contains only protected references such as
`RESTIC_REPOSITORY` and `RESTIC_PASSWORD_FILE`; it is never committed. The
systemd unit intentionally runs as root so it works on the OVH host (which has
an `ubuntu` operator account rather than a `deployer` account), can access the
Docker daemon, and can safely write the host-level metric. The job writes a
Prometheus timestamp only after Restic backup and sampled integrity check
succeed.

Restore only into an isolated environment. Follow the complete order in
[RESTORE-ORDER.md](./RESTORE-ORDER.md), including identity, configuration,
monitoring/status and deletion-ledger reconciliation. Record start/end time,
backup timestamp, data gap, integrity checks, identity/session checks,
security/privacy/lead/CMS smoke outcomes and actual RPO/RTO in a dated evidence
file. Do not overwrite the live database during a drill.

## Security operations

- The `Security scanning` GitHub workflow scans dependencies, infrastructure and
  configuration on pull requests, `main` pushes and weekly. It retains the
  critical/high SARIF report as a workflow artifact, which works on a private
  repository without GitHub Advanced Security. The immutable delivery workflow
  also blocks production promotion when any of the four built container images
  contains a known critical or high vulnerability. Triage critical findings
  before release and high findings within the patch cadence.
- Patch the host and base images monthly, and urgently for actively exploited
  critical vulnerabilities; use immutable image promotion and rollback.
- Review staff memberships, privileged roles, SSH keys, deploy keys and
  Cloudflare/OVH access every quarter and on staff departure.
- Rotate application, backup, identity, webhook and recovery secrets under
  [the secrets ADR](../decisions/ADR-SECRETS-MANAGEMENT.md). Preserve access,
  approval and rotation evidence without preserving secret values.
- Preserve incident evidence: deployment record, immutable image digest/tag,
  correlation IDs, minimal relevant logs, audit-event identifiers and a time
  line. Restrict access and avoid copying personal data into tickets.

## Incident and public status workflow

1. Detect and acknowledge the alert; assign a severity and incident owner.
2. Contain: stop unsafe writes/jobs, revoke compromised access or roll back a
   verified compatible release as appropriate.
3. Publish an initial status update within the severity target.
4. Recover using the documented runbook, then run security and business smoke
   checks before resuming traffic/writes.
5. Publish resolution and create a blameless post-incident review within five
   business days.

Deploy `infra/status/` to an independently hosted Cloudflare Pages project or
another separate provider at `status.DOMAIN`. It must not be served by the
OVH application origin. Keep a separate Cloudflare administrator/recovery
path and test it during a simulated primary-host outage.

Status template:

```text
Investigating | YYYY-MM-DD HH:MM UTC
We are investigating an issue affecting [component]. Customer impact: [plain language].
Next update by: [time].

Resolved | YYYY-MM-DD HH:MM UTC
Service has been restored. Impact window: [start–end]. Follow-up: [link or date].
```

Post-incident review: summary, customer impact, timeline, detection gap,
containment/recovery actions, measured RPO/RTO when relevant, contributing
conditions, corrective actions, owner and due date.

## Launch evidence checklist

- [ ] Metrics endpoint rejects public access and Prometheus scrapes internally.
- [ ] Grafana authentication, retention and resource limits are verified.
- [ ] Alert routing reaches the named owner and maintenance deduplication works.
- [ ] At least one independent external uptime check detects an origin outage.
- [ ] Status page remains editable/readable during an origin outage.
- [ ] Off-server encrypted backup, retention and deletion resistance are configured.
- [ ] Isolated full-system restore meets recorded RPO/RTO.
- [ ] Secret rotation, break-glass/lost-key recovery and access review have evidence.
