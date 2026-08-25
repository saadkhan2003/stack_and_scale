# WS08 — Security test matrix expansion

Goal: pure-contract privilege escalation matrix + direct-API access tests.

Owns: packages/contracts/test/authorization-matrix.test.ts,
apps/api/test/direct-api-access.test.ts.

Requirements:

- authorization-matrix: exhaustive table test over every StaffRole x every
  Permission asserting exact grant/deny vs permissionsForRole(); plus
  assigningRole elevation matrix (member cannot escalate self/peer; admin
  cannot create admin/owner; owner can do all). >= 20 assertions total.
- direct-api-access: against AppModule/Fastify (pattern from
  tenant-authorization.integration.test.ts), verify hidden UI routes do not
  imply API access: unknown /api/v1/\* paths return the same 403/404 envelope
  for outsider vs member where applicable, and method mismatch (POST to GET
  route) is rejected without leaking internals. >= 3 tests.
