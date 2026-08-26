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
  echo "== disk I/O counters =="
  cat /proc/diskstats 2>&1 || true
  echo
  echo "== host filesystem =="
  df -h 2>&1 || true
  echo
  echo "== database connections and size =="
  docker exec "${DATABASE_CONTAINER:-stack-and-scale-database-postgres-1}" \
    psql -U "${POSTGRES_USER:-stack_and_scale}" -d "${POSTGRES_DB:-stack_and_scale}" -c \
    "select count(*) as connections from pg_stat_activity; select pg_size_pretty(pg_database_size(current_database())) as database_size;" 2>&1 || true
  echo
  echo "== backup volume =="
  docker system df -v 2>&1 || true
} > "${output}"
echo "Wrote ${output}"
