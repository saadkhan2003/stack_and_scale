# Contributing to Stack & Scale

Thank you for your interest in contributing to **Stack & Scale**! This document provides guidelines, setup instructions, and development standards for team members and contributors.

---

## 1. Code of Conduct

We are committed to providing a professional, respectful, and collaborative environment. All contributors and maintainers are expected to uphold standards of mutual respect, constructive feedback, and ethical engineering practices.

---

## 2. Prerequisites & Tooling

Ensure the following tools are installed on your workstation:

- **Node.js:** `>= 24.18.0` (LTS recommended)
- **Package Manager:** `pnpm 11.19.0` (enforced via `packageManager` field in `package.json`)
- **Docker & Docker Compose:** For running local PostgreSQL, Keycloak, Mailpit, and Redis containers.
- **Git:** Version control with GPG commit signing recommended.

---

## 3. Local Development Setup

### 3.1 Clone the Repository
```bash
git clone https://github.com/saadkhan2003/stack_and_scale.git
cd stack_and_scale
```

### 3.2 Install Dependencies
```bash
pnpm install
```

### 3.3 Boot Local Infrastructure Services
Start the local PostgreSQL and supporting service containers:
```bash
pnpm db:up
# Or run complete reset if needed:
pnpm db:reset
```

### 3.4 Build Monorepo Packages
```bash
pnpm -r run build
```

---

## 4. Verification & Quality Gates

Before submitting a Pull Request, you must verify that all automated quality gates pass:

```bash
# 1. Check code formatting with Prettier
pnpm format:check

# 2. Run static analysis with ESLint
pnpm lint

# 3. Perform strict TypeScript type checking across all 11 packages
pnpm typecheck

# 4. Run the full unit and integration test suite
pnpm test

# 5. Run single-command verification gate
pnpm verify
```

---

## 5. Branching & Commit Conventions

### 5.1 Branch Naming
- `feature/[short-description]` — New business features or enhancements.
- `fix/[bug-description]` — Bug fixes or security remediations.
- `docs/[topic]` — Documentation, user manuals, and runbook updates.
- `infra/[change]` — Docker, Caddy, or deployment workflow modifications.

### 5.2 Conventional Commits
We follow the **Conventional Commits** specification:
- `feat(web): add real-time lead qualification badge`
- `fix(auth): enable id.token.claim for realm roles mapper`
- `docs(manuals): add incident response runbook`
- `refactor(api): optimize PostgreSQL tenant membership query`
- `chore(deps): bump vite to 5.4.1`

---

## 6. Pull Request Process

1. Fork the repo or create a feature branch off `main`.
2. Ensure new features or bug fixes include corresponding unit tests in `test/`.
3. Verify that `pnpm verify` passes with **0 errors**.
4. Open a Pull Request targeting `main` with a clear description of changes and verification evidence.
5. All PRs must pass the GitHub Actions **Continuous Integration** and **Security scanning** workflows before merging.
