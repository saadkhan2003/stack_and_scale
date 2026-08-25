# WS07 — Rate-limiting hooks

Goal: in-memory sliding-window limiter as an interceptor/hook ready for auth
routes.

Owns: apps/api/src/common/http/rate-limit.interceptor.ts,
rate-limit.store.ts, rate-limit.module.ts,
apps/api/test/rate-limit.test.ts.

Requirements:

- Sliding window per key (route + actor/ip), configurable limit/windowMs via
  constructor defaults (e.g. 30 req / 60s); over-limit throws
  HttpException 429 with standard envelope text "Too many requests."
- Store interface injectable so tests use a fake clock/store; no timers left
  running after module destroy.
- Unit tests >= 5: allows under limit, blocks over limit, window slides,
  independent keys, cleanup on destroy. No Nest app bootstrapping needed.
