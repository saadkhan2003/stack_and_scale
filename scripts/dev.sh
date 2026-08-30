#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "node_modules missing - install dependencies first" >&2
  exit 1
fi

docker compose -f infra/compose.yaml up -d --wait postgres keycloak

bash scripts/migrate-local-database.sh

cleanup() {
  kill 0 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "== Starting API on http://127.0.0.1:3100 =="
(
  cd apps/api
  STACK_AND_SCALE_OIDC_ISSUER=http://localhost:8084/realms/stack-and-scale \
  STACK_AND_SCALE_OIDC_AUDIENCE=web \
  STACK_AND_SCALE_OIDC_REDIRECT_URI=http://localhost:3000/api/auth/oidc/callback \
    ../../node_modules/.bin/tsx src/main.ts
) &

echo "== Starting web on http://localhost:3000 =="
(
  cd apps/web
  ./node_modules/.bin/next dev
) &

echo
echo "Web:      http://localhost:3000"
echo "API:      http://127.0.0.1:3100/health"
echo "Keycloak: http://localhost:8084 (admin / local-development-only)"
echo "Press Ctrl+C to stop everything."
wait
