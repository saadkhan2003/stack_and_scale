# 17.6 Heartbeat verification

Heartbeats allow only version, lease state, cursor and sync status; they accept
at most one record per installation every five minutes and never block offline
operation. The worker removes heartbeats and delivered events after 30 days;
lease and conflict evidence is not part of this deletion. Worker tests verify
the retention queries.
