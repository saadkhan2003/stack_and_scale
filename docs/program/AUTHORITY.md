# Authority and Change Control

## Purpose

This file is the binding source-of-truth map for Stack & Scale. It prevents a later agent, developer, or conversation from quietly changing an approved decision.

## Precedence

When sources conflict, apply this order:

1. The final **Your chosen direction** in the relevant record under `question-decisions/`.
2. `STACK_AND_SCALE_PLATFORM_BLUEPRINT_V1.md` for the approved target architecture.
3. `plans/MASTER_IMPLEMENTATION_PLAN.md`, the relevant numbered phase, budget guardrails and execution-decomposition standard for delivery order and controls.
4. Accepted implementation ADRs under `docs/decisions/` for a justified, recorded technical choice.
5. Code, tests, configuration and evidence.
6. Older conversational alternatives, drafts and examples are context only, never implementation scope.

## Non-negotiable program rules

- Initial external-platform recurring cost must not exceed USD 50/month without explicit user approval.
- Open source or free-tier tools are preferred, but self-hosted services require capacity and operational evidence.
- V1 is the public platform, CMS, lead engine, basic CRM, identity, delivery, security, recovery and observability foundation—not portals, product control plane, payments, AI, or advanced operations.
- PostgreSQL is the central transactional source of truth; the backend begins as a modular NestJS monolith.
- Authorization is server-side, deny-by-default, and enforced at the query boundary.
- Privacy-by-design, recoverability, accessibility and production-grade testing are launch requirements.
- AI remains optional and cannot block any core workflow before its separately approved later phase.
- No real client, customer result, testimonial, pricing, legal claim or product capability is invented to fill a content gap.

## Change-control procedure

An approved direction may change only through a record in `docs/program/PLAN-CHANGES.md` and, when architecture is affected, an ADR in `docs/decisions/`.

Every change must state:

- date, proposer and approver;
- affected decision IDs, requirements and phase steps;
- evidence and reason for change;
- previous and replacement direction;
- dependency, security/privacy, data and budget impact;
- migration, rollback and verification plan.

No code change is allowed to silently change an approved requirement.

## Read-before-work checklist

Before any implementation step, read this file, `docs/program/V1-SCOPE.md`, the active phase file, the relevant question records, the active ADRs, `plans/BUDGET_GUARDRAILS.md`, and the execution step plan. Stop for an amendment when these sources conflict.

