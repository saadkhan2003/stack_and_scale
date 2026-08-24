#!/usr/bin/env sh

set -eu

compose_file="infra/compose.yaml"
database_name="${POSTGRES_DB:-stack_and_scale}"
database_user="${POSTGRES_USER:-stack_and_scale}"

docker compose -f "$compose_file" up -d postgres
docker compose -f "$compose_file" exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U "$database_user" -d postgres \
  -c "DROP DATABASE IF EXISTS \"$database_name\";" \
  -c "CREATE DATABASE \"$database_name\" OWNER \"$database_user\";"
