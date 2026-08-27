#!/usr/bin/env bash
set -euo pipefail

# Run only on the production host. It generates first-deploy secrets locally
# and writes the untracked Compose environment file without printing secrets
# to the terminal or placing them in CI.

readonly app_root="${STACK_AND_SCALE_ROOT:-/opt/stack-and-scale}"
readonly env_file="${app_root}/.env.production"
readonly credentials_file="${app_root}/secrets/initial-keycloak-admin.txt"
readonly public_domain="${PUBLIC_DOMAIN:-stackandscale.org}"
readonly acme_email="${ACME_EMAIL:?set ACME_EMAIL to the administrator notification address}"
readonly notification_email="${CRM_NOTIFICATION_EMAIL:?set CRM_NOTIFICATION_EMAIL to the administrator notification address}"

if [[ -e "${env_file}" ]]; then
  echo "Refusing to overwrite existing ${env_file}. Rotate values through the documented procedure instead." >&2
  exit 2
fi

for command in install openssl; do
  command -v "${command}" >/dev/null || {
    echo "Refusing setup: ${command} is required." >&2
    exit 2
  }
done

secret() {
  openssl rand -hex 32
}

postgres_password="$(secret)"
payload_secret="$(secret)"
preview_secret="$(secret)"
keycloak_admin_password="$(secret)"

install -d -m 0750 "${app_root}" "${app_root}/secrets"
umask 077
cat >"${env_file}" <<EOF
# Generated locally by scripts/bootstrap-production-secrets.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ).
# Do not commit or copy this file into CI.
NODE_ENV=production
POSTGRES_USER=stack_and_scale
POSTGRES_PASSWORD=${postgres_password}
DATABASE_URL=postgresql://stack_and_scale:${postgres_password}@postgres:5432/stack_and_scale
CMS_DATABASE_URL=postgresql://stack_and_scale:${postgres_password}@postgres:5432/stack_and_scale
PAYLOAD_SECRET=${payload_secret}
CMS_PREVIEW_SECRET=${preview_secret}

KEYCLOAK_BOOTSTRAP_ADMIN_USERNAME=admin
KEYCLOAK_BOOTSTRAP_ADMIN_PASSWORD=${keycloak_admin_password}
STACK_AND_SCALE_OIDC_ISSUER=https://identity.${public_domain}/realms/stack-and-scale
STACK_AND_SCALE_OIDC_AUDIENCE=web
STACK_AND_SCALE_OIDC_CLIENT_ID=web
STACK_AND_SCALE_OIDC_REDIRECT_URI=https://${public_domain}/api/auth/oidc/callback
STACK_AND_SCALE_OIDC_POST_LOGOUT_REDIRECT=https://${public_domain}/

PUBLIC_DOMAIN=${public_domain}
ACME_EMAIL=${acme_email}
WEB_PUBLIC_URL=https://${public_domain}
CMS_PUBLIC_URL=https://cms.${public_domain}
API_PUBLIC_URL=https://api.${public_domain}
# The deployment workflow supplies IMAGE_REGISTRY and IMAGE_TAG at runtime.
IMAGE_REGISTRY=
CRM_NOTIFICATION_EMAIL=${notification_email}

# Configure these later when the corresponding operational provider is ready.
CRM_ORGANIZATION_ID=
DEMO_AVAILABLE_SLOTS=
RESEND_API_KEY=
TRANSACTIONAL_EMAIL_FROM=
EOF

cat >"${credentials_file}" <<EOF
Initial Keycloak administrator (store in your password manager, then remove this file):
username: admin
password: ${keycloak_admin_password}
identity URL: https://identity.${public_domain}
EOF
chmod 0600 "${env_file}" "${credentials_file}"

echo "Production environment created at ${env_file}."
echo "Initial Keycloak credentials were written to ${credentials_file}; save them in a password manager and then securely remove that file."
