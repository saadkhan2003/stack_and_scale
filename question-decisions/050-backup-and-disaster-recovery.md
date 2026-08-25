# Question 050 — Backup and disaster recovery

**Status:** Locked  
**Implementation:** Phase 1 and ongoing  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

What recovery capability is required?

## Your chosen direction

Use automated backups, encrypted off-server copies, point-in-time recovery where feasible, file versioning, infrastructure recovery and regular restore tests.

## Why this was chosen

Recovery must cover data, files, infrastructure and operating procedures—not merely produce untested backup archives.

## Why it is a strong fit

- Reduces catastrophic-loss risk
- Creates measurable recovery objectives
- Improves operational confidence

## Tradeoffs and safeguards

Backups add cost and are useful only when access, retention and restore procedures are tested.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 50 — Backup and disaster recovery

Because your platform will eventually hold customers, contracts, invoices, subscriptions, files, CRM data, and project information, backups need to be designed before production.

I recommend this approach:

```text
PostgreSQL
├── automated daily backups
├── frequent incremental / WAL backups
├── encrypted backup storage
├── backup copy outside the main Hetzner server
└── periodic restore testing

Files / R2
├── object versioning where appropriate
├── retention rules
└── separate recovery policy

Infrastructure
├── OpenTofu/Terraform definitions
├── Docker images
├── configuration backups
└── documented recovery procedure
```

And we should define two targets:

**RPO — how much data can we afford to lose?**
Example: maximum 15 minutes of database changes.

**RTO — how long can the system be unavailable before recovery?**
Example: restore critical services within 1–2 hours.

For your initial stage, I would recommend a pragmatic target:

> **RPO around 15–30 minutes for critical databases**
> **RTO around 1–2 hours for critical services**

We can tighten this later as revenue and customer count grow.

I also strongly recommend **automated backups + off-server copies + regular restore tests**, because a backup that has never been restored is not something we should blindly trust.

**Question 50: do you want to lock this production backup/disaster-recovery approach?**

#### Your response

> yes these all

#### Explanation or resolution

Locked: **Question 50 = full production backup + disaster recovery approach**, including automated backups, off-server copies, encrypted storage, database point-in-time style recovery where feasible, object/file versioning, infrastructure definitions in code, documented recovery steps, and periodic restore tests.

For the initial production target, we can use approximately **15–30 minute RPO** for critical databases and **1–2 hour RTO** for critical services, then tighten those targets as the platform grows.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
