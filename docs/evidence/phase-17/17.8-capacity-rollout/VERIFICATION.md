# 17.8 Capacity and rollout verification

`docs/operations/CAPACITY-LEDGER.md` now fixes initial controls: 100 mutations
or 1 MiB per batch, five-minute heartbeat rate, five delivery attempts and
30-day telemetry/delivered-event retention. Integration, telemetry and sync
are independent disabled-by-default flags. Production rollout must use the
protected immutable delivery workflow and a synthetic Phase 17 installation;
no real customer account is enabled by this evidence.

## Production evidence — 2026-09-02

Immutable application revision `033ff34896472ebbe202f41ac43867cee8487711`
was built, tested, scanned and promoted successfully by [delivery run
33535212880](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33535212880).
The protected signing-key assurance passed in [run
33537004563](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33537004563).

The protected synthetic installation then successfully exercised credential
authentication, signed lease issuance, verification-key discovery,
privacy-minimized heartbeat, idempotent offline-sync submission, signed-event
retrieval and acknowledgement in [run
33654053496](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33654053496).
Finally, [run
33654151750](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33654151750)
proved that disabling the integration flag rejects the credential, and [run
33654190227](https://github.com/saadkhan2003/stack_and_scale/actions/runs/33654190227)
proved that re-enabling restores access. The synthetic credential is random,
short-lived and stored only as its SHA-256 hash; no customer account or
credential was used.
