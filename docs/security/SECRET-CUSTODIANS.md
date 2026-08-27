# Secret Custodians and Rotation Register

## Custodians

A secret custodian is a named individual with least-privilege access to a specific
set of secrets. Two custodians are required before production secrets exist.

| Custodian | Secrets in scope | Access method | Date appointed |
|---|---|---|---|
| _TBD — first custodian_ | All production application secrets | OVH VPS SSH + Bitwarden | _TBD_ |
| _TBD — second custodian_ | Backup and recovery secrets | OVH VPS SSH + Bitwarden | _TBD_ |

### Access rules

- Custodians access secrets through the production host SSH (key-only auth) or
  Bitwarden vault entries.
- No secret value is ever transmitted over chat, email, or ticketing systems.
- Access is logged in the operational access log (requester, purpose, environment,
  approver, expiry) without recording secret values.
- Quarterly access review: verify all custodians still have legitimate business
  need. Remove access on role change or departure.

## Rotation Register

Each secret has a named rotation owner, a trigger condition, and a recorded
rotation date. The register is updated after every rotation event.

| Secret | Rotation owner | Last rotated | Next review | Trigger conditions |
|---|---|---|---|---|
| `POSTGRES_PASSWORD` | _TBD_ | _TBD_ | _TBD_ | Compromise, staff departure, scheduled quarterly |
| `PAYLOAD_SECRET` | _TBD_ | _TBD_ | _TBD_ | Compromise, staff departure, scheduled quarterly |
| `CMS_PREVIEW_SECRET` | _TBD_ | _TBD_ | _TBD_ | Compromise, staff departure, scheduled quarterly |
| `KEYCLOAK_BOOTSTRAP_ADMIN_PASSWORD` | _TBD_ | _TBD_ | _TBD_ | Compromise, staff departure, after initial bootstrap |
| `RESEND_API_KEY` | _TBD_ | _TBD_ | _TBD_ | Provider rotation, compromise |
| `METRICS_BEARER_TOKEN` | _TBD_ | _TBD_ | _TBD_ | Compromise, scheduled quarterly |
| `GRAFANA_ADMIN_PASSWORD` | _TBD_ | _TBD_ | _TBD_ | Compromise, scheduled quarterly |
| Cloudflare Origin Certificate | _TBD_ | _TBD_ | _TBD_ | Certificate expiry, compromise |
| `DEPLOY_SSH_PRIVATE_KEY` | _TBD_ | _TBD_ | _TBD_ | Staff departure, compromise, scheduled quarterly |
| `REGISTRY_READ_TOKEN` | _TBD_ | _TBD_ | _TBD_ | Staff departure, compromise, scheduled quarterly |
| `RESTIC_PASSWORD` | _TBD_ | _TBD_ | _TBD_ | Compromise, scheduled quarterly |
| `HCLOUD_TOKEN` | _TBD_ | _TBD_ | _TBD_ | Compromise, staff departure |
| Keycloak admin password (via console) | _TBD_ | _TBD_ | _TBD_ | After initial bootstrap, compromise |

## Rotation procedure

1. Generate the new secret: `openssl rand -hex 32` (or provider dashboard for
   API keys and certificates).
2. Update the secret on the production host (`.env.production`, secrets files,
   or provider dashboard as applicable).
3. Restart affected services: `docker compose -f compose.production.yaml restart <service>`.
4. Verify service health: `docker compose -f compose.production.yaml ps`.
5. Record the rotation in this register (date, operator, reason).
6. If the rotation was due to compromise: rotate all secrets that shared the
   same access path, audit access logs, and notify affected parties.

## Break-glass procedure

If normal rotation paths are unavailable (e.g., compromised credentials block
SSH access):

1. Create an incident record with timestamp, operator, and reason.
2. Use the OVH console rescue mode or out-of-band access to reach the host.
3. Rotate all secrets in scope.
4. Post-use: rotate again through normal procedure once access is restored.
5. Preserve incident record and rotation evidence without preserving secret values.

## Quarterly access review

Every 90 days, or on any staff departure:

- [ ] Verify all custodians still have legitimate business need.
- [ ] Verify all SSH keys, deploy keys, and API tokens are still valid and
      belong to active team members.
- [ ] Rotate any secrets past their review date.
- [ ] Update this register with review date and reviewer name.
