# 17.7 Chaos and compatibility verification

The test matrix covers unavailable transport/retries, duplicate requests and
events, reordered events, corrupted signature rejection, expired/grace lease
state, revoked credentials, revoked signing keys, failed delivery, dead-letter
replay, protected-domain conflict, and partial safe outcomes. Contract `1.0`
is the supported initial compatibility baseline; additions are compatible only
when they preserve the frozen envelope and SDK behavior.
