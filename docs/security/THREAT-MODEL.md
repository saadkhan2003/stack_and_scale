# Threat Model

## Method

Each critical threat has prevention, detection, response and a verification requirement. The table is a release gate: controls are not treated as complete until their test/evidence exists.

| Threat | Prevention | Detection/response | Verification |
|---|---|---|---|
| Account takeover | OIDC, MFA readiness, recovery controls, rate limiting, secure sessions, staff policy | suspicious-login audit, revoke sessions, reset/review | session/recovery/rate-limit tests |
| Cross-tenant access | required TenantContext, centralized authorization, scoped files/caches | deny audit and alert on mismatch | negative read/write/file/cache tier tests |
| Staff privilege escalation | least-privilege roles, explicit overrides, approval/audit | privileged action review, revoke and investigate | role/override regression tests |
| CMS publishing abuse | authenticated workflow, role separation, preview/review, audit | publication audit and rollback | unauthorized publish and revision tests |
| Form spam/injection | schema validation, edge/rate controls, output encoding | anomaly metrics, quarantine | invalid payload and abuse-limit tests |
| File upload abuse | allow-list, size limits, private storage, signed access, scanning workflow | malware/failed-scan alerts, revoke links | type/size/access-control tests |
| Webhook spoof/replay | HMAC, timestamp window, event ID deduplication, rotated secrets | signature/replay failure logs, endpoint disablement | forged/replayed/duplicate delivery tests |
| Payment/provisioning duplication | idempotency key, unique business constraint, outbox | duplicate command alert and reconciliation | concurrent retry integration test |
| Secret exposure | SOPS/age baseline, env separation, scanning, log redaction | secret-scan and exposure procedure | scan gate and redaction test |
| Supply-chain compromise | pinned dependencies, review, CI scanning, minimal builds | vulnerability alerts, lockfile review | dependency/container scan gate |
| Backup destruction | independent failure domain, least delete privilege, encrypted/versioned copies | backup health/restore alert | scheduled isolated restore drill |
| Origin bypass/DoS | managed edge, WAF, firewall/reverse-proxy allow-list, rate limits | edge/origin anomaly alerts, incident runbook | origin direct-access and rate-limit test |

## Residual risk

V1 accepts normal internet-facing risk only with the controls above. It does not accept handling unrestricted secrets or highly sensitive customer datasets through ordinary portal workflows. New payment, file, identity or public integration features require a targeted threat-model update before release.
