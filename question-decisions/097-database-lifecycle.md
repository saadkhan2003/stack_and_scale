# Question 097 — Database lifecycle

**Status:** Locked  
**Implementation:** Phase 0 onward  
**Source:** Stack & Scale 100-question architecture interview

> The original conversational wording has been normalized for clarity. This record preserves the final decision after later refinements.

## Question

How should schema changes reach production?

## Your chosen direction

Use version-controlled migrations reviewed and tested in staging, with backup readiness and rollback or roll-forward planning.

## Why this was chosen

Database changes are part of software releases and need the same traceability and verification.

## Why it is a strong fit

- Repeatable schema evolution
- Lower production risk
- Clear release history

## Tradeoffs and safeguards

Large migrations may require multi-release compatibility and background backfills rather than simple rollback.

## Decision rule

This decision remains valid unless real implementation evidence, a legal requirement, or a material business-model change justifies revisiting it. Any revision should be recorded as a new architecture decision rather than silently changing this file.


---

## Full brainstorming record

This section preserves the detailed planning discussion for this question. The material comes from the source conversation, with interface-only citation markers removed and clarification exchanges kept in chronological order.

### Discussion round 1

#### Question, options, and recommendation

# Question 97 — Database lifecycle and migrations

Recommended:

## Locked: Production-grade database lifecycle

Architecture:

```text

Application

↓

Migration System

↓

PostgreSQL

```

Rules:

```text

Database Changes

Developer creates migration

↓

Review

↓

Test on staging

↓

Backup check

↓

Production migration

```

Includes:

✓ Version-controlled migrations
✓ Rollback strategy
✓ Schema reviews
✓ Backup before major changes
✓ Migration testing

No manual database editing in production.

---

#### Your response

> for the remaining questions do what is recommended

#### Explanation or resolution

# Question 97 — Database lifecycle and migrations

Recommended:

## Locked: Production-grade database lifecycle

Architecture:

```text

Application

↓

Migration System

↓

PostgreSQL

```

Rules:

```text

Database Changes

Developer creates migration

↓

Review

↓

Test on staging

↓

Backup check

↓

Production migration

```

Includes:

✓ Version-controlled migrations
✓ Rollback strategy
✓ Schema reviews
✓ Backup before major changes
✓ Migration testing

No manual database editing in production.

---

### Final interpretation for AI-assisted implementation

- Treat **Your chosen direction** near the top of this file as the final decision.
- Use the full discussion to understand the alternatives, intent, examples, concerns and tradeoffs.
- When a clarification changed or narrowed an earlier idea, the later explanation is authoritative.
- Read this record together with the approved platform blueprint; implementation must follow the phase boundary stated above.
