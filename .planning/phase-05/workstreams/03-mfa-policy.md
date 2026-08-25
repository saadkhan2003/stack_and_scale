# WS03 — Staff MFA policy contract

Goal: enforceable MFA policy types + decision function, plus policy doc.

Owns: docs/security/MFA-POLICY.md, packages/contracts/src/mfa.ts,
packages/contracts/test/mfa.test.ts.

Requirements:

- mfa.ts: StaffMfaPolicy { requiredRoles, gracePeriodDays? } and
  evaluateMfaRequirement({ role, mfaEnrolledAt, mfaSatisfied, now, policy })
  returning allow | deny_mfa_required | deny_mfa_enforcement_grace_expired.
  Pure functions, no crypto, TOTP enrollment stays provider-side (Keycloak).
- Doc: which staff roles require MFA immediately (owner/admin), manager grace
  window, member optional; recovery codes are single-use, provider-managed.
- Tests >= 6 covering each branch incl. grace expiry boundary.
