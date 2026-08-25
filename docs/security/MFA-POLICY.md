# Staff MFA Policy

## Requirements by role

| Role    | MFA requirement            | Enforcement                                                                |
| ------- | -------------------------- | -------------------------------------------------------------------------- |
| owner   | required immediately       | denied at login/session use until satisfied; no grace                      |
| admin   | required immediately       | denied at login/session use until satisfied; no grace                      |
| manager | required with grace window | grace starts at enrollment start (`mfaEnrolledAt`); hard-deny after expiry |
| member  | optional                   | never blocked by this policy                                               |

The machine-readable source of truth is `StaffMfaPolicy` and `evaluateMfaRequirement` in `packages/contracts/src/mfa.ts`. The decision function is pure, holds no crypto and no provider logic, and fails closed: an unknown or unsatisfied state for a required role denies.

## Grace window semantics

- A role listed in `requiredRoles` without a configured grace period is denied immediately when MFA is unsatisfied.
- When `gracePeriodDays` is set, denial remains `deny_mfa_required` until `mfaEnrolledAt + gracePeriodDays`, then becomes `deny_mfa_enforcement_grace_expired`.
- The boundary is inclusive: at exactly the expiry timestamp enforcement is expired.
- If enrollment never started for a staff member in a grace-enabled policy, there is nothing to count from and the deny is immediate.
- Managers must begin enrollment on first login after the policy activates. The default grace window for managers is 14 days.

## Provider responsibilities

- TOTP enrollment, QR provisioning, token verification and clock skew handling stay inside the identity provider (Keycloak).
- Recovery codes are single-use and provider-managed. The application never stores, generates, logs or validates them; it only consumes the resulting satisfaction signal (`mfaSatisfied`) from verified sessions.
- MFA secrets are Secret-class data: never log them, never include them in errors or audit payloads.

## Audit

Enforcement decisions that block access record actor, organization, decision outcome, policy snapshot reference and correlation ID. Decisions never include TOTP seeds, recovery codes or device fingerprints beyond what the provider already exposes.
