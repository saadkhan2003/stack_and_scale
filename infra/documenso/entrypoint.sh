#!/bin/sh
set -eu

export NEXTAUTH_SECRET="$(cat /run/secrets/documenso_nextauth_secret)"
export NEXT_PRIVATE_ENCRYPTION_KEY="$(cat /run/secrets/documenso_encryption_key)"
export NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY="$(cat /run/secrets/documenso_encryption_secondary_key)"

exec "$@"
