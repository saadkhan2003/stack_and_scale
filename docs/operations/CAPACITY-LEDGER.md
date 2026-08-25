# Capacity Ledger

## Status

Planning allocation only. No infrastructure has been provisioned; these caps are an architecture estimate to be measured and revised in Phase 10B before V1 launch and after every capacity-affecting phase.

## Initial cost envelope

| Component | Budget target | Capacity responsibility |
|---|---:|---|
| Application node (16 GB planned maximum) | $18.50/month | Public web, CMS, API, workers, identity and lightweight V1 operations only |
| Private database node (8 GB planned maximum) | $10.50/month | PostgreSQL only; no public port |
| Automated node backups | $5.80/month | Convenience recovery only; not the sole protected copy |
| Geographic backup target | $4.00/month | Encrypted independent recovery copy |
| IPv4/domain/object-storage/staging reserve | $3.60/month | Controlled caps; staging is ephemeral |
| Taxes/exchange/contingency | $4.50/month | Planned total $46.90, leaving $3.10 hard buffer |

## Service budget table

| Service | Phase enabled | CPU/memory/disk/IO baseline | Retention/limit | Safe headroom | Degradation control | Scale trigger and next cost |
|---|---|---|---|---|---|---|
| Public web/CMS/API | V1 | App node cap: 4.0 GiB RAM, 3 vCPU steady-state planning budget, 30 GB local writable data | Public assets use object storage/cached delivery; no unbounded local uploads | 4.0 GiB RAM and 5 vCPU remain for all other approved services before OS/cache reserve | Cache public content; disable nonessential previews/jobs | Sustained 70% of assigned RAM/CPU or latency budget breach; price next topology before change |
| Workers/Valkey-compatible queue | V1 | App node cap: 1.0 GiB RAM, 1 vCPU, 5 GB disk | Queue payloads short-lived; dead-letter retention capped at 7 days | Included in app-node remaining capacity | Pause noncritical jobs; retain critical lead/email jobs | Queue lag/retention exceeds cap; add capacity only with cost approval |
| PostgreSQL | V1 | Database node cap: 5.0 GiB RAM, 3 vCPU, 45 GB data/WAL planning allocation | Daily backup; WAL/PITR policy finalized in 10B | 3.0 GiB RAM, 1 vCPU and 35 GB disk planning headroom | Throttle reports/jobs; reject runaway queries | Sustained 70% allocation, disk 70% or I/O/query breach |
| Identity | V1 | App node cap: 1.0 GiB RAM, 1 vCPU, 5 GB disk | Session/audit retention configured by policy | Included in remaining app capacity | Defer federation/optional admin features | Exceeds cap or affects primary web/API |
| Analytics | V1 | App node cap: 0.35 GiB RAM, 0.5 vCPU, 5 GB disk | Aggregated/event retention capped at 30 days initially | Included in remaining app capacity | Disable analytics collection before core workloads degrade | Storage or latency cap breach |
| Monitoring/status | V1 | App node cap: 1.0 GiB RAM, 1 vCPU, 10 GB disk | Metrics 14 days; logs 7 days; traces sampled/disabled unless measured safe | Remaining app-node capacity and OS/cache reserve are reviewed in 10B | Reduce tracing, then logs/metrics; preserve audit/security evidence | Any core-service impact; use independent public status path |
| Staff operations | 13 | Not authorized yet | Defined by Phase 13 plan | TBD | Disable optional widgets/indexing | Phase 13 measured trigger/cost |
| Commercial/files/support | 14 | Not authorized yet | File quota/lifecycle policy | TBD | Queue PDF/file work; limit uploads | Phase 14 measured trigger/cost |
| Portals/control plane/integrations | 15–17 | Not authorized yet | Per phase | TBD | Organization rollout, rate/batch limits | Per-phase measured trigger/cost |

## Measurement protocol

Record timestamp, workload, version, data scale, CPU, memory, disk, disk I/O, network, database connections/query latency, queue latency, backup volume and telemetry retention. A phase may claim no recurring-cost increase only when its measurements show safe headroom and its rollback/degradation controls work.

## Cost alerts

Set alerts at 50%, 75%, 90% and 100% of the USD 50 ceiling. Usage-based services default to capped or stopped overage, not unlimited billing.
