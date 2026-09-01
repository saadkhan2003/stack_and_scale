# 17.8 Capacity and rollout verification

`docs/operations/CAPACITY-LEDGER.md` now fixes initial controls: 100 mutations
or 1 MiB per batch, five-minute heartbeat rate, five delivery attempts and
30-day telemetry/delivered-event retention. Integration, telemetry and sync
are independent disabled-by-default flags. Production rollout must use the
protected immutable delivery workflow and a synthetic Phase 17 installation;
no real customer account is enabled by this evidence.
