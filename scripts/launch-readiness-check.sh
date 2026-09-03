#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "    Stack & Scale — Launch & Quality Readiness Check    "
echo "========================================================"

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "[1/6] Verifying toolchain & environment..."
command -v node >/dev/null || { echo "ERROR: node is required" >&2; exit 1; }
command -v pnpm >/dev/null || { echo "ERROR: pnpm is required" >&2; exit 1; }
echo "  Node: $(node --version)"
echo "  pnpm: $(pnpm --version)"

echo "[2/6] Verifying local Docker services..."
if docker ps --format '{{.Names}}' | grep -q "stack-and-scale-postgres"; then
  echo "  Postgres container: RUNNING"
else
  echo "  Postgres container: STOPPED (run 'pnpm db:up')"
fi

if docker ps --format '{{.Names}}' | grep -q "stack-and-scale-keycloak"; then
  echo "  Keycloak container: RUNNING"
else
  echo "  Keycloak container: STOPPED (run 'docker compose -f infra/compose.yaml up -d keycloak')"
fi

if docker ps --format '{{.Names}}' | grep -q "stack-and-scale-mailpit"; then
  echo "  Mailpit container: RUNNING"
else
  echo "  Mailpit container: STOPPED (run 'docker compose -f infra/compose.yaml up -d mailpit')"
fi

echo "[3/6] Running repository formatting & linting..."
pnpm format:check
pnpm lint

echo "[4/6] Running TypeScript typecheck across all workspace packages..."
pnpm typecheck

echo "[5/6] Running test suites..."
pnpm test

if docker ps --format '{{.Names}}' | grep -q "stack-and-scale-keycloak"; then
  echo "  Running live Keycloak E2E suite..."
  pnpm test:keycloak
fi

echo "[6/6] Verifying production build..."
pnpm build

echo ""
echo "========================================================"
echo "  ALL IN-REPO CODE CHECKS & TESTS PASSED SUCCESSFULLY!  "
echo "========================================================"
echo ""
echo "--- Remaining External Operations & Launch Gates ---"
echo "[ ] Cloudflare SSL Mode: Verify 'Full (strict)' is enabled on stackandscale.org"
echo "[ ] Resend Email: Add RESEND_API_KEY and verify SPF/DKIM/DMARC in Resend dashboard"
echo "[ ] Alertmanager: Confirm test alert email receipt in operator inbox"
echo "[ ] Off-Server Backup: Configure restic S3 bucket target and record rehearsal restore"
echo "[ ] Secret Custodians: Record second operator identity in docs/security/SECRET-CUSTODIANS.md"
echo "[ ] Phase 14 Storage (Optional): Run 'ENABLE_PHASE14_STORAGE=1 bash scripts/bootstrap-phase14-storage.sh' on host"
echo "========================================================"
