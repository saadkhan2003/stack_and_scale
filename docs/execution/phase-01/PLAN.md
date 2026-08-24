# Phase 01 Execution Plan — Repository and Engineering Foundation

## Objective

Create a reproducible pnpm workspace with Node 24 LTS policy, strict TypeScript, minimal V1 application shells, local PostgreSQL, and test commands. This phase creates no product, CMS content model, identity integration, production infrastructure or provider account.

## Runtime decision

Pin Node.js 24 LTS. Current local Node 26 may be used only as a temporary bootstrap environment if dependency installation is compatible; all CI/production compatibility claims remain blocked until Node 24 is used and verified. Pin pnpm 11.19.0 because it is installed locally; review upgrades through normal dependency controls.

## Steps

| Step | Depends on | Write ownership | Verification |
|---|---|---|---|
| 01-01 | Phase 00 | Root policy/config files only | Runtime, workspace and secret-policy checks |
| 01-02 | 01-01 | `packages/config`, `packages/testing` | Unit test RED then GREEN; strict TypeScript/lint |
| 01-03 | 01-01, 01-02 | `apps/api`, `apps/workers`, `packages/contracts` | Health/version/no-op job unit and API tests |
| 01-04 | 01-01, 01-02 | `apps/web`, `apps/cms`, `packages/ui` | Browser/accessibility smoke tests |
| 01-05 | 01-01–01-04 | Docker/CI/docs/evidence only | Local database reset, root checks, CI dry run |

## Execution rules

- Every code behavior starts with an executed RED test and ends GREEN; checkpoint commits include only current-phase staged files.
- No production secrets, customer data, cloud resources, provider purchases, business features, identity provider, Payload schema or database migration is added.
- `apps/staff`, `apps/portal` and `apps/account` remain absent until their phases.
- Phase 01 owns no changes to the 100 question records or architecture blueprint.

## Evidence

Store non-secret evidence in `docs/evidence/phase-01/<step-id>/`. This plan will be refined only through `docs/program/PLAN-CHANGES.md`.

