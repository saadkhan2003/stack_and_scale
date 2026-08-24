#!/usr/bin/env sh

# Source this file before local development to keep transient tool caches off
# the Ubuntu system partition. The repository itself is already on Data.
export XDG_CACHE_HOME=/media/saad/Data/.cache
export npm_config_cache=/media/saad/Data/.npm-cache
export PNPM_HOME=/media/saad/Data/.pnpm-home
