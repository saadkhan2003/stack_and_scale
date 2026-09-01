# 17.5 Sync and conflict verification

Sync accepts only 1–100 mutations within 1 MiB, deduplicates on the stable
installation/mutation ID and preserves durable outcome evidence. Operational
notes are append-only; financial, inventory, permission and contractual kinds
produce a server-authoritative conflict record instead of silent last-write-
wins. The focused integration suite verifies duplicate replay and an inventory
conflict.
