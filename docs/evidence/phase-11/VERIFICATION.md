# Phase 11 Verification — Security, Observability and Recovery

## Local implementation evidence

Implemented locally in the Phase 11 operations foundation:

- API correlation-aware structured logs and a redacted, bearer-token-protected
  Prometheus endpoint.
- Prometheus, Grafana, Loki, Promtail, node/container exporter, retention and
  resource-limit Compose configuration.
- Alert rules for API availability/5xx, host disk/memory pressure and missed
  verified backups.
- Encrypted Restic backup job, daily system timer template and a status metric
  written only after backup plus sampled repository validation succeeds.
- Static status-page artifact intended for independently hosted publication.
- CI branch correction and dependency/configuration security-scan workflow.
- Operations runbook, capacity allocation and incident/restore instructions.

## Local verification performed

| Check                                    | Result              | Evidence                                                                                             |
| ---------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| API TypeScript                           | Passed              | `tsc -p apps/api/tsconfig.json --noEmit`                                                             |
| Worker TypeScript                        | Passed              | `tsc -p apps/workers/tsconfig.json --noEmit`                                                         |
| Metrics unit/integration suite           | Passed              | 3 tests: redacted route labels, unauthorized scrape denial, authenticated scrape                     |
| Bash syntax                              | Passed              | `bash -n scripts/backup-production.sh scripts/deploy-promote.sh`                                     |
| YAML/JSON configuration parse            | Passed              | Ruby YAML parser and `python -m json.tool`                                                           |
| Production + observability Compose merge | Passed              | `docker compose ... config --no-interpolate`                                                         |
| Full API foundation readiness test       | Environment-blocked | The sandbox cannot access Docker PostgreSQL; `/ready` returned 503. This is not production evidence. |

## External launch-gate tests still required

None of the following may be marked complete until performed against the real
production/staging accounts. Record date, operator, environment, command or
browser evidence, result and follow-up in this file or a dated linked record.

### Infrastructure and monitoring

- [ ] Create an isolated staging environment from OpenTofu and destroy it
      afterwards; record plan/apply/destroy and no orphaned paid resources.
- [ ] Verify Cloudflare is the only accepted origin source for ports 80/443;
      verify SSH is limited to approved operator IPs.
- [ ] Confirm PostgreSQL has no public host port and is unreachable from an
      external network while application services retain internal access.
- [ ] Enable observability using protected token files; prove `/metrics` is
      publicly denied and Prometheus can scrape it on the internal Docker network.
- [ ] Verify Grafana authentication, Prometheus/Loki retention, disk limits and
      dashboard values under real traffic.
- [ ] Configure an alert receiver to a named owner; trigger and acknowledge API
      outage, 5xx, disk/memory and backup-miss alerts. Test deduplication and an
      approved maintenance window.
- [ ] Configure an independent external uptime check that detects a primary
      server outage.
- [ ] Publish `status.DOMAIN` from Cloudflare Pages or another independent
      origin; prove it remains editable/readable while the application host is off.

### Backup, recovery and security operations

- [ ] Create a geographically separate Restic repository under credentials or
      account separation from OVHcloud; confirm primary-host credentials cannot
      delete it.
- [ ] Install and run the backup system timer. Verify encryption, retention,
      sampled integrity check and the `backup_last_success` metric.
- [ ] Restore the database, identity data, application configuration, media,
      IaC state and monitoring/status configuration into an isolated environment.
      Do not restore over live production.
- [ ] Measure and record actual RPO/RTO, data reconciliation, Keycloak session
      invalidation and security/privacy/lead/CMS smoke results.
- [ ] Add named secret custodians, rotation register, quarterly access review,
      break-glass approval and lost/compromised-key recovery evidence.
- [ ] Run the GitHub security workflow and triage any critical/high findings;
      add immutable-image scanning before production promotion.

### Phase 12 production journey tests that remain blocked by external setup

- [ ] CMS draft → review → publish → public cache/metadata verification.
- [ ] Product demo → CRM lead/opportunity/task → real transactional email.
- [ ] Custom-project inquiry/attribution → authenticated staff access.
- [ ] WhatsApp attribution → staff lead matching.
- [ ] Failed email/job → retained lead → retry, alert and recovery.
- [ ] Unauthorized public/staff request → denial and audit evidence.
- [ ] Privacy access/export/correction/restriction/erasure propagation and legal
      hold expiry across every configured processor.
- [ ] Deployment, migration, rollback, incident/status, budget-alert and
      browser/mobile/accessibility/load/Core Web Vitals rehearsals.

## Verdict

**Local Phase 11 implementation: complete.**

**Phase 11 production exit criteria: not complete.** The unchecked live gates
above are launch blockers and must be completed before Phase 12 can claim a
production launch review.
