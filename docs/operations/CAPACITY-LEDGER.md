# Capacity Ledger

## Status

The OVH production host has been provisioned, but these caps remain planning
allocations until measured under a representative release workload. Revise them
in Phase 10B before V1 launch and after every capacity-affecting phase.

## Initial cost envelope

| Component                                  |           Budget target | Capacity responsibility                                            |
| ------------------------------------------ | ----------------------: | ------------------------------------------------------------------ |
| One OVHcloud VPS-2 application node (8 GB) | USD 10/month before tax | Public web, CMS, API, workers, identity and PostgreSQL on one host |
| Included daily node backup                 |                Included | Convenience recovery only; not the sole protected copy             |
| Geographic backup target                   |             $4.00/month | Encrypted independent recovery copy                                |
| IPv4/domain/object-storage/staging reserve |             $3.60/month | Controlled caps; staging is ephemeral                              |
| Taxes/exchange/contingency                 |             $4.50/month | Planned total $46.90, leaving $3.10 hard buffer                    |

## Service budget table

| Service                            | Phase enabled | CPU/memory/disk/IO baseline                                                                                                     | Retention/limit                                                                                              | Safe headroom                                                                   | Degradation control                                                                                              | Scale trigger and next cost                                                                                                              |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Public web/CMS/API                 | V1            | Combined cap: 2.3 GiB RAM, 2.25 vCPU, 30 GB local writable data                                                                 | Public assets use object storage/cached delivery; no unbounded local uploads                                 | Retain at least 2 GiB for PostgreSQL, identity and host cache                   | Cache public content; disable previews first                                                                     | Sustained 70% host RAM/CPU or latency budget breach                                                                                      |
| Workers/queue                      | V1            | 256 MiB RAM, 0.35 vCPU, 5 GB disk                                                                                               | Queue payloads short-lived; dead-letter retention capped at 7 days                                           | Stop noncritical jobs first                                                     | Pause noncritical jobs; retain lead/email jobs                                                                   | Queue lag/retention exceeds cap                                                                                                          |
| PostgreSQL                         | V1            | 2.0 GiB RAM, 1.5 vCPU, 35 GB data/WAL planning allocation                                                                       | Daily backup; WAL/PITR policy finalized in 10B                                                               | Host memory/disk alarms protect all services                                    | Throttle reports/jobs; reject runaway queries                                                                    | Sustained 70% allocation, disk 70% or I/O/query breach                                                                                   |
| Identity                           | V1            | 768 MiB RAM, 0.75 vCPU, 5 GB disk                                                                                               | Session/audit retention configured by policy                                                                 | Included in one-host budget                                                     | Defer federation/optional admin features                                                                         | Exceeds cap or affects primary web/API                                                                                                   |
| Analytics                          | V1            | App node cap: 0.35 GiB RAM, 0.5 vCPU, 5 GB disk                                                                                 | Aggregated/event retention capped at 30 days initially                                                       | Included in remaining app capacity                                              | Disable analytics collection before core workloads degrade                                                       | Storage or latency cap breach                                                                                                            |
| Monitoring/status                  | V1            | App node cap: 1.25 GiB RAM, 1.15 vCPU, 10 GB disk                                                                               | Metrics 14 days; logs 7 days; traces sampled/disabled unless measured safe                                   | Remaining app-node capacity and OS/cache reserve are reviewed in 11B            | Reduce tracing, then logs/metrics; preserve audit/security evidence                                              | Any core-service impact; use independent public status path                                                                              |
| Staff operations                   | 13            | Shared host budget: 4 vCPU, 8 GB RAM, 75 GB NVMe; runtime snapshot reports bounded CPU, memory, disk and PostgreSQL connections | Metrics 14 days; logs 7 days; traces disabled unless measured safe; deployment history bounded to 25 records | Keep at least 30% host CPU/memory headroom and 30% database connection headroom | Disable optional widgets/indexing; throttle reports and noncritical jobs; reduce traces then telemetry retention | Sustained >70% CPU or memory, disk >70%, connection headroom <30%, or core latency breach; next topology is a separate app/database node |
| Commercial/files/support           | 14            | Not authorized yet                                                                                                              | File quota/lifecycle policy                                                                                  | TBD                                                                             | Queue PDF/file work; limit uploads                                                                               | Phase 14 measured trigger/cost                                                                                                           |
| Portals/control plane/integrations | 15–17         | Not authorized yet                                                                                                              | Per phase                                                                                                    | TBD                                                                             | Organization rollout, rate/batch limits                                                                          | Per-phase measured trigger/cost                                                                                                          |

## Measurement protocol

Record timestamp, workload, version, data scale, CPU, memory, disk, disk I/O, network, database connections/query latency, queue latency, backup volume and telemetry retention. A phase may claim no recurring-cost increase only when its measurements show safe headroom and its rollback/degradation controls work.

## Phase 13.12 snapshot and projection

The staff **Release & capacity** surface reads these values without changing
infrastructure. CPU is the one-minute host load normalized by vCPU count;
memory is host used memory; disk is used space on the configured filesystem;
connections is `pg_stat_activity` against PostgreSQL. Each projected value is a
bounded 2x current-load estimate capped at its declared limit, not a forecast
or a scale commitment.

| Resource               | Current source                    |                            Limit | Projection rule              | Control threshold |
| ---------------------- | --------------------------------- | -------------------------------: | ---------------------------- | ----------------- |
| CPU                    | Host load average / 4 vCores      |                             100% | 2x current, capped at 100%   | 70% sustained     |
| Memory                 | Host total minus free memory      |                            8 GiB | 2x current, capped at 8 GiB  | 70% sustained     |
| Disk                   | Configured filesystem used blocks |                           75 GiB | 2x current, capped at 75 GiB | 70%               |
| PostgreSQL connections | `pg_stat_activity`                | `max_connections` (100 fallback) | 2x current, capped at limit  | 70%               |

The current code baseline is runtime-derived rather than a fabricated live
measurement: production values appear only when the authenticated API can read
the host and database. Local/test runs report their own bounded runtime and use
synthetic or unavailable deployment records. The next priced topology is a
separate application/database node; no infrastructure write is performed by
the visibility endpoint.

## Cost alerts

Set alerts at 50%, 75%, 90% and 100% of the USD 50 ceiling. Usage-based services default to capped or stopped overage, not unlimited billing.
