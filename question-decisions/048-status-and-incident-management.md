# Question 048 — Status and incident management

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Should the company operate a public status page?

## Your chosen direction

Provide status.company.com and internal incident management using mature monitoring/status tooling.

## Why this was chosen

Customers need transparent service communication and the team needs a repeatable incident workflow.

## Why it is a strong fit

- Builds trust during incidents
- Separates status from affected systems
- Improves post-incident learning

## Tradeoffs and safeguards

A status page must be updated honestly and cannot depend solely on the failing platform.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 48 — Status page and incident management

Since you want to become known as a **trusted software provider**, I recommend eventually having a public service-status system.

For example:

```text
status.company.com

All Systems Operational

Retail POS Cloud        Operational
Account Platform        Operational
Client Portal           Operational
API                     Operational
Authentication          Operational
File Storage            Operational
Email Notifications     Operational
```

If something fails:

```text
Retail POS Sync
Degraded Performance

14:20 — Investigating
14:38 — Issue identified
15:05 — Fix deployed
15:18 — Monitoring
15:42 — Resolved
```

Inside `staff.company.com`, your team would have an incident area:

```text
Incidents
├── Severity
├── Affected service
├── Started at
├── Assigned staff
├── Internal notes
├── Public updates
├── Resolution
└── Post-incident review
```

I recommend **a public `status.company.com` + internal incident management**, but we should use a mature monitoring/status solution underneath rather than building all monitoring infrastructure ourselves.

Would you like to lock **Question 48 = public status page + internal incident management**?

#### Your response

> yes agreed

#### Explanation or resolution

Locked: **Question 48 = public `status.company.com` + internal incident management**, using mature monitoring/status tooling underneath rather than reinventing the whole monitoring stack ourselves.

So:

```text
status.company.com
→ public service health
→ incidents
→ maintenance notices
→ historical uptime

staff.company.com
→ internal incidents
→ severity
→ owner
→ affected services
→ internal notes
→ public updates
→ resolution
→ postmortem
```

The public page should expose only what customers need to know; internal technical details remain private.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
