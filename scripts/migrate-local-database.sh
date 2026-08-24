#!/usr/bin/env bash
set -euo pipefail

container_name="stack-and-scale-postgres"
database_name="${POSTGRES_DB:-stack_and_scale}"
database_user="${POSTGRES_USER:-stack_and_scale}"

for migration_file in packages/database/migrations/*.sql; do
  migration_name="$(basename "$migration_file")"
  already_applied="$(docker exec "$container_name" psql -U "$database_user" -d "$database_name" -tAc "SELECT EXISTS (SELECT 1 FROM platform.schema_migrations WHERE name = '$migration_name')" 2>/dev/null || true)"
  if [ "$already_applied" = "t" ]; then
    continue
  fi
  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 -U "$database_user" -d "$database_name" < "$migration_file"
  docker exec "$container_name" psql -v ON_ERROR_STOP=1 -U "$database_user" -d "$database_name" -c "INSERT INTO platform.schema_migrations (name) VALUES ('$migration_name')"
done
