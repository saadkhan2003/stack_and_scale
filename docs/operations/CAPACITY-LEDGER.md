# Capacity Ledger

## Status

Planning allocation only. No infrastructure has been provisioned; these caps are an architecture estimate to be measured and revised in Phase 10B before V1 launch and after every capacity-affecting phase.

## Initial cost envelope

| Component                                  |                   Budget target | Capacity responsibility                                            |
| ------------------------------------------ | ------------------------------: | ------------------------------------------------------------------ |
| One Hetzner CX33 application node (8 GB)   | About $10/month before IPv4/VAT | Public web, CMS, API, workers, identity and PostgreSQL on one host |
| Automated node backups                     |             20% of server price | Convenience recovery only; not the sole protected copy             |
| Geographic backup target                   |                     $4.00/month | Encrypted independent recovery copy                                |
| IPv4/domain/object-storage/staging reserve |                     $3.60/month | Controlled caps; staging is ephemeral                              |
| Taxes/exchange/contingency                 |                     $4.50/month | Planned total $46.90, leaving $3.10 hard buffer                    |

## Service budget table

| Service                            | Phase enabled | CPU/memory/disk/IO baseline                                     | Retention/limit                                                              | Safe headroom                                                        | Degradation control                                                 | Scale trigger and next cost                                 |
| ---------------------------------- | ------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Public web/CMS/API                 | V1            | Combined cap: 2.3 GiB RAM, 2.25 vCPU, 30 GB local writable data | Public assets use object storage/cached delivery; no unbounded local uploads | Retain at least 2 GiB for PostgreSQL, identity and host cache        | Cache public content; disable previews first                        | Sustained 70% host RAM/CPU or latency budget breach         |
| Workers/queue                      | V1            | 256 MiB RAM, 0.35 vCPU, 5 GB disk                               | Queue payloads short-lived; dead-letter retention capped at 7 days           | Stop noncritical jobs first                                          | Pause noncritical jobs; retain lead/email jobs                      | Queue lag/retention exceeds cap                             |
| PostgreSQL                         | V1            | 2.0 GiB RAM, 1.5 vCPU, 35 GB data/WAL planning allocation       | Daily backup; WAL/PITR policy finalized in 10B                               | Host memory/disk alarms protect all services                         | Throttle reports/jobs; reject runaway queries                       | Sustained 70% allocation, disk 70% or I/O/query breach      |
| Identity                           | V1            | 768 MiB RAM, 0.75 vCPU, 5 GB disk                               | Session/audit retention configured by policy                                 | Included in one-host budget                                          | Defer federation/optional admin features                            | Exceeds cap or affects primary web/API                      |
| Analytics                          | V1            | App node cap: 0.35 GiB RAM, 0.5 vCPU, 5 GB disk                 | Aggregated/event retention capped at 30 days initially                       | Included in remaining app capacity                                   | Disable analytics collection before core workloads degrade          | Storage or latency cap breach                               |
| Monitoring/status                  | V1            | App node cap: 1.25 GiB RAM, 1.15 vCPU, 10 GB disk               | Metrics 14 days; logs 7 days; traces sampled/disabled unless measured safe   | Remaining app-node capacity and OS/cache reserve are reviewed in 11B | Reduce tracing, then logs/metrics; preserve audit/security evidence | Any core-service impact; use independent public status path |
| Staff operations                   | 13            | Not authorized yet                                              | Defined by Phase 13 plan                                                     | TBD                                                                  | Disable optional widgets/indexing                                   | Phase 13 measured trigger/cost                              |
| Commercial/files/support           | 14            | Not authorized yet                                              | File quota/lifecycle policy                                                  | TBD                                                                  | Queue PDF/file work; limit uploads                                  | Phase 14 measured trigger/cost                              |
| Portals/control plane/integrations | 15–17         | Not authorized yet                                              | Per phase                                                                    | TBD                                                                  | Organization rollout, rate/batch limits                             | Per-phase measured trigger/cost                             |

## Measurement protocol

Record timestamp, workload, version, data scale, CPU, memory, disk, disk I/O, network, database connections/query latency, queue latency, backup volume and telemetry retention. A phase may claim no recurring-cost increase only when its measurements show safe headroom and its rollback/degradation controls work.

## Cost alerts

Set alerts at 50%, 75%, 90% and 100% of the USD 50 ceiling. Usage-based services default to capped or stopped overage, not unlimited billing.
