# Question 027 — Production DevOps baseline

**Status:** Locked  
**Implementation:** Phase 0 and Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How much deployment and operations automation is required?

## Your chosen direction

Establish a full production DevOps foundation from the beginning.

## Why this was chosen

The platform will eventually handle customer, subscription, project and payment data and cannot rely on one manually maintained server.

## Why it is a strong fit

- Repeatable releases
- Safer recovery
- Clear separation of environments

## Tradeoffs and safeguards

The baseline requires early investment in automation, monitoring and runbooks.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 27 — How much infrastructure automation do you want?

This affects how professionally we manage Hetzner.

**A. Mostly manual**
Create server manually, SSH in, install Docker, deploy.

**B. Automated deployments only**
Server created manually, but GitHub automatically deploys applications.

**C. Infrastructure as Code**
Server/firewall/network configuration represented in code using something like Terraform/OpenTofu, plus automated application deployments.

**D. Full production DevOps foundation**
C plus automated backups, monitoring, error tracking, uptime checks, log aggregation, secrets management, staging, rollback strategy and documented disaster recovery.

For the “production-level and scalable” website you've asked for, I recommend **D**.

It doesn't mean making the infrastructure enormous. It means even a small initial deployment is **reproducible, observable and recoverable** rather than being one mysterious Hetzner server that only works because someone configured it manually.

Would you like to lock **D**?

#### Your response

> D

#### Explanation or resolution

Locked: **Question 27 = D — full production DevOps foundation**.

That means from day one we will treat the platform like a real production system, not “one server with Docker Compose and hope.”

The baseline should include Infrastructure as Code, automated CI/CD, separate staging/production, backups, monitoring, logs, error tracking, secrets management, health checks, rollback capability, firewall/network rules, and a documented recovery procedure.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
