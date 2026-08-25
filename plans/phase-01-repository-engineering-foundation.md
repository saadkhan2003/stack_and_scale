# Phase 01 — Repository and Engineering Foundation

## Outcome

Create a reproducible pnpm monorepo with pinned runtimes, shared engineering standards, minimal deployable application shells, local dependencies and a fast verification pipeline.

## Execution profile

- **Model tier:** strongest for repository contracts; default for mechanical scaffolding
- **Mode:** serial foundation with isolated setup subtasks
- **External-platform spend:** $0
- **Depends on:** Phase 00
- **Unlocks:** Phases 02, 03 and 10

## Context brief

The target contains public web, CMS, staff, portal, account, API and worker applications, but only V1 applications should receive functional implementation now. Empty shells may reserve boundaries; they must not accumulate speculative dependencies.

## Work packages

### 01.1 Runtime and package policy

- Verify current official compatibility for Node.js, Next.js, Payload and NestJS.
- Pin a supported Node LTS and pnpm version through Corepack.
- Create lockfile policy and controlled dependency-update rules.
- Record native-binary and architecture constraints before selecting ARM servers.

### 01.2 Workspace skeleton

```text
apps/web
apps/cms
apps/api
apps/workers
packages/ui
packages/config
packages/contracts
packages/database
packages/auth
packages/observability
packages/email
packages/analytics
packages/testing
infrastructure
docs
```

- Reserve `apps/staff`, `apps/portal` and `apps/account` only when their phases open.
- Enforce dependency direction between apps and packages.

### 01.3 Shared configuration

- Strict TypeScript baseline.
- Linting, formatting and import-boundary checks.
- Environment-schema validation.
- Consistent path aliases and build outputs.
- Repository editor settings and line endings.

### 01.4 Local development environment

- Docker Compose for PostgreSQL and required local services.
- Seed/reset workflow using non-sensitive fixtures.
- One-command development startup.
- Health checks and deterministic ports.

### 01.5 Testing foundation

- Unit test runner and shared fixtures.
- Integration-test database lifecycle.
- Playwright browser harness.
- Accessibility smoke checks.
- Test categorization and time budgets.

### 01.6 Minimal application shells

- Next.js public application renders a health page.
- Payload application reaches an unconfigured admin route.
- NestJS API serves version and health endpoints.
- Worker entry point executes a no-op test job.
- No business feature is implemented.

### 01.7 CI workflow

- Install from lockfile.
- Cache safely.
- Run formatting, lint, types, unit tests and builds.
- Run integration/browser jobs only when relevant.
- Set usage budgets for free CI minutes.

## Verification commands

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Exact commands may be adjusted during scaffolding, but one root command must exist for each category.

## Exit criteria

- Clean clone can be started using documented commands.
- All application shells build.
- Dependency boundaries are enforced automatically.
- Local database reset is deterministic.
- No production secret exists in the repository.
- CI fits the free usage budget.

## Rollback and recovery

Revert scaffolding commits in reverse dependency order. Preserve the lockfile and compatibility record long enough to diagnose why the selected baseline failed.

## Cold-start handoff

Read Phase 00 outputs and the technology-stack section of the master blueprint. Do not add product features or visual polish in this phase.
