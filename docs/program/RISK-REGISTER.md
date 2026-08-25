# Program Risk Register

| ID | Risk | Trigger | Mitigation | Contingency | Owner |
|---|---|---|---|---|---|
| R-01 | Content/proof not approved | Missing client rights, screenshots or verified outcomes | Use content inventory and approval workflow | Omit or clearly label non-customer demonstrations | Business/content owner |
| R-02 | Scope inflation | Portal/payment/AI work appears in V1 branch | Enforce V1 scope and phase gates | Defer through plan change | Program owner |
| R-03 | Budget overrun | Projected recurring/usage cost approaches 75% of ceiling | Capacity ledger, spend alerts, no paid convenience services | Disable nonessential services or request approval | Infrastructure owner |
| R-04 | Tenant/privacy leakage | Authorization, query or export failure | Deny-by-default policy, privacy matrix and tests | Stop affected writes/access, investigate and notify under incident policy | Security owner |
| R-05 | Backup failure | Missed job, failed restore or shared failure domain | Separate credentials/location and restore rehearsals | Stop risky deployment; restore from protected copy | Infrastructure owner |
| R-06 | Secret compromise/loss | Secret exposed, unaudited access or inaccessible decryption key | ADR, rotation, custody and break-glass procedure | Revoke/rotate, recover through approved escrow path | Security owner |
| R-07 | Deliverability failure | Bounces, spam placement or quota limit | Email adapter, domain authentication and lead retention | Queue/retry; use approved fallback provider | Sales operations owner |
| R-08 | Single-maintainer operations burden | Monitoring/identity/backup maintenance exceeds capacity | Keep service set minimal, document runbooks | Defer optional self-hosted modules or approve managed alternative | Program owner |
| R-09 | Unsafe release | Migration/deployment smoke test fails | Immutable promotion, rollback rehearsal and launch gate | Halt traffic change, revert image, preserve data | Delivery owner |
| R-10 | AI premature dependency | Core work requires model/API or unmeasured spend | Keep AI deferred and optional | Disable feature and use deterministic workflow | Product owner |

