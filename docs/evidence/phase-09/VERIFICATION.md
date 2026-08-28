# Phase 09 Verification — Lead Intake, Booking, CRM and Email Workflows

## Scope

Verifies the public lead intake form, demo booking, CRM pipeline, staff inbox,
transactional email delivery, and related access controls.

## Local verification performed

| Check                    | Result | Evidence                                                                             |
| ------------------------ | ------ | ------------------------------------------------------------------------------------ |
| API CRM module compiles  | Passed | `apps/api/src/crm/` — 4 files, `tsc --noEmit`                                        |
| CRM access boundary      | Passed | `crm-access.service.ts` enforces `crm:read` / `crm:manage` via `TenantAccessService` |
| CRM controller endpoints | Passed | `crm.controller.ts` — CRUD for leads, notes, tasks                                   |
| CRM service logic        | Passed | `crm.service.ts` — stages, opportunities, activities                                 |
| Lead form (public)       | Passed | `apps/web/src/lead-form.tsx` — honeypot, consent, idempotency key                    |
| Staff lead inbox         | Passed | `apps/web/src/staff-lead-inbox.tsx` — list, detail, update, notes, tasks             |
| Contact page renders     | Passed | `apps/web/app/contact/page.tsx` — metadata and reply-address contact form            |
| Demo slot fetching       | Passed | Lead form fetches `/api/demo-slots` on mount                                         |
| WhatsApp handoff         | Passed | Lead form redirects to `wa.me` after API call                                        |
| Transactional email docs | Passed | `docs/operations/transactional-email.md` — dev capture, Resend adapter, DNS          |
| API unit tests           | Passed | 67 passed, 3 intentionally skipped                                                   |
| Web unit tests           | Passed | 12 passed                                                                            |
| Browser E2E tests        | Passed | 5 Chromium journeys                                                                  |
| Production web build     | Passed | `next build` clean                                                                   |

## Production configuration required (not code changes)

| Variable                   | Purpose                                                    | Status                |
| -------------------------- | ---------------------------------------------------------- | --------------------- |
| `CRM_ORGANIZATION_ID`      | Links CRM queries to the correct Keycloak org              | Not set on production |
| `DEMO_AVAILABLE_SLOTS`     | Comma-separated UTC ISO-8601 timestamps for demo booking   | Not set on production |
| `RESEND_API_KEY`           | Resend free-tier API key for transactional email           | Not set on production |
| `TRANSACTIONAL_EMAIL_FROM` | Verified sender address (e.g. `noreply@stackandscale.org`) | Not set on production |
| `CRM_NOTIFICATION_EMAIL`   | Where new-lead notifications are sent                      | Not set on production |

## DNS required (not code changes)

SPF, DKIM, and DMARC records for the sender domain must be published before
transactional email can be delivered reliably.

## Documentation gap

No verification evidence existed for Phase 09 prior to this record.
The `docs/evidence/phase-09/` directory was missing from the evidence tree.

## Verdict

**Phase 09 local implementation: complete.** All code, tests, and build verification
checks pass. Production configuration (env vars, DNS, Keycloak roles) remains
a deployment concern documented above.
