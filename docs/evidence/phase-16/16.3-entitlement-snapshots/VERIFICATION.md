# Phase 16.3 — deterministic entitlement snapshots

- Plan-version entitlements, add-ons and expiring per-account overrides are
  resolved into sequenced, bounded snapshots.
- The integration suite verifies the resolved plan/add-on output, Ed25519
  signature validity, and refusal to issue a snapshot after key revocation.
- Snapshots persist their expiry and sequence; consumers can therefore retain
  only the bounded snapshot supplied during a temporary control-plane outage.
