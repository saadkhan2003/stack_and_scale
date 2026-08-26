#!/usr/bin/env bash
set -euo pipefail

output="${1:-docs/evidence/phase-10/capacity-$(date -u +%Y%m%dT%H%M%SZ).txt}"
mkdir -p "$(dirname "${output}")"
{
  echo "captured_at=$(date -u +%FT%TZ)"
  echo "commit=$(git rev-parse HEAD)"
  echo
  echo "== docker compose services =="
  docker compose -f infra/compose.production.yaml ps 2>&1 || true
  echo
  echo "== docker resource usage =="
  docker stats --no-stream 2>&1 || true
  echo
  echo "== host filesystem =="
  df -h 2>&1 || true
} > "${output}"
echo "Wrote ${output}"
