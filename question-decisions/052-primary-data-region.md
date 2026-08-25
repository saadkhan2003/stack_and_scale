# Question 052 — Primary data region

**Status:** Locked  
**Implementation:** Phase 1  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

Where should production data primarily live?

## Your chosen direction

Use Germany/EU as the primary production and data region with geographically separate encrypted backups.

## Why this was chosen

This aligns with Hetzner, international positioning and a strong privacy posture.

## Why it is a strong fit

- Clear data-residency baseline
- Good European connectivity
- Supports EU-oriented trust

## Tradeoffs and safeguards

Backup location, processor terms and customer-specific residency needs must be documented.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

### Question 52 — Where should your main production data live?

Since you already chose **Hetzner**, I recommend putting the core production infrastructure in an **EU Hetzner location**, most likely **Germany**.

Hetzner currently operates EU locations in Falkenstein and Nuremberg, Germany, and Helsinki, Finland.

My preferred initial setup would be:

```text
Primary production
→ Hetzner Germany

Primary PostgreSQL
→ Germany

Redis / queues
→ Germany

Application servers
→ Germany

Private backups
→ separate location/provider

Public media/CDN
→ object storage + CDN

Sensitive/private documents
→ EU storage with controlled access
```

Then Cloudflare can still serve/cache appropriate **public** assets globally, including Pakistan, without us casually spreading sensitive customer data across unnecessary regions.

Later, if latency genuinely becomes an issue, we can introduce regional services selectively rather than moving the whole system.

**Question 52: Shall we lock the primary production/data region as Germany/EU, with geographically separate encrypted backups?**

#### Your response

> ye

#### Explanation or resolution

Locked: **Question 52 = primary production/data region in Germany/EU, with geographically separate encrypted backups.**

So the initial infrastructure policy is:

- Primary app servers: Hetzner Germany
- Primary PostgreSQL: Germany
- Redis/queues/workers: Germany
- Private files: EU-region object storage
- Encrypted backups: separate location/provider from primary infrastructure
- Public static assets: CDN-distributed where safe
- Sensitive customer data: not globally replicated by default

This also fits the GDPR-first architecture we already locked.

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
