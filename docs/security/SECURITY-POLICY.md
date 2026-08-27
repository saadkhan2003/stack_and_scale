# Security Policy

## Scope

This policy applies to the Stack & Scale platform, its infrastructure, and all
personnel with access to production systems, source code, or customer data.

## Principles

1. **Least privilege** — every person and service receives only the access
   necessary to perform their function.
2. **Defence in depth** — security controls are layered across the edge,
   application, data, and identity boundaries.
3. **No secrets in code** — secrets are never committed to source control,
   logged, or transmitted through insecure channels.
4. **Secure by default** — new features ship with security controls enabled;
   opt-out requires explicit justification and review.
5. **Audit and accountability** — sensitive actions create append-only audit
   records with actor, action, target, and timestamp.

## Access control

- Production access requires SSH key authentication. Password authentication
  is disabled.
- Staff access to internal tools (CMS, CRM, Grafana) is authenticated through
  Keycloak with role-based access control.
- Multi-factor authentication is required for owner and admin roles; managers
  have a 14-day grace window. See `MFA-POLICY.md`.
- Staff access is reviewed quarterly and revoked on role change or departure.

## Infrastructure security

- **Edge**: Cloudflare manages DDoS protection, WAF rules, and TLS termination.
  Origin servers accept traffic only from Cloudflare IP ranges.
- **Host**: UFW firewall restricts ports 80 and 443 to Cloudflare IPs only.
  SSH is key-only with fail2ban.
- **Containers**: all services run with `read_only: true`, `no-new-privileges`,
  and `cap_drop: [ALL]` with minimal `cap_add` where required.
- **Networks**: internal services communicate over isolated Docker networks
  (`application`, `database`). Only Caddy and web are on the `edge` network.
- **PostgreSQL**: no public host port; accessible only from the `database`
  internal network.

## Data protection

- Data is classified into five tiers: Public, Internal, Confidential,
  Restricted, and Secret. See `DATA-CLASSIFICATION.md`.
- All data is encrypted in transit (TLS 1.2+) and at rest (disk encryption
  on the production host).
- Backups are encrypted with a separate Restic password stored independently
  from the production host.
- Personal data is retained per the retention schedule and deleted on request
  within 30 days.

## Application security

- Input validation at API boundaries using class-validator and Zod schemas.
- Output encoding prevents XSS in rendered CMS content.
- CSRF protection on state-changing endpoints.
- Rate limiting on authentication, form submission, and CRM endpoints.
- Content Security Policy headers served through Caddy.
- Supply chain: dependencies are pinned, CI runs Trivy scans on container
  images, and critical findings are triaged before merge.

## Monitoring and incident response

- Structured logs with correlation IDs; no secrets or personal data in logs.
- Prometheus metrics with bearer-token authentication.
- Grafana dashboards for API availability, host resources, and backup health.
- Alert rules for API 5xx, disk pressure, memory pressure, and missed backups.
- Incident workflow: detect → contain → communicate → remediate → review.
- Public status page maintained independently of the primary host.

## Backup and recovery

- Daily encrypted Restic backups with 14-day retention.
- PostgreSQL logical dumps with 8-day retention.
- Backups stored in a geographically separate repository with independent
  credentials.
- Restore drills performed quarterly; RPO and RTO measured and recorded.

## Vulnerability management

- CI pipeline runs Trivy security scans on every push to `main`.
- Critical and high findings are triaged and remediated before production
  promotion.
- Dependency updates reviewed for security advisories weekly.
- Immutable container images are scanned before promotion; scan results are
  attached as CI artifacts.

## Policy review

This policy is reviewed quarterly or on any significant change to the platform,
infrastructure, or team composition. Review date and reviewer are recorded
below.

| Date | Reviewer | Changes |
|---|---|---|
| 28 Aug 2026 | Stack & Scale | Initial policy created |
