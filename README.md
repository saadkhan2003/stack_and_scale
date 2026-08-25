# Stack & Scale

Production-oriented software-company platform. The authoritative product and delivery decisions are in [`docs/program/AUTHORITY.md`](./docs/program/AUTHORITY.md).

## Runtime

- Node.js 24.18.0 LTS
- pnpm 11.19.0

Use a Node 24 environment before installing dependencies. The repository enforces that range through `package.json` and `.npmrc`.

Before local development, run `source scripts/development-environment.sh` to keep package and tool caches on the Data partition.

## Current phase

Phases 00-06 are complete (program foundation through CMS platform). See
[status.md](./status.md) for the authoritative handoff state. No production
infrastructure, provider accounts, or production credentials belong in this
repository yet.

## Database package

`@stack-and-scale/database` contains dependency-free policy helpers for reviewing migration plans and managing transactional-outbox state transitions. It does not connect to PostgreSQL, run migrations, or deliver events. Database access and worker integrations are implemented only in their approved Phase 04 steps.
