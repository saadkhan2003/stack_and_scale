# Phase 09 — Lead Engine, Demo Booking and CRM

## Outcome

Convert product and service interest into structured, attributable and permission-controlled opportunities with reliable confirmations and follow-up.

## Execution profile

- **Model tier:** strongest for workflows/data; default for forms and screens
- **Mode:** parallel with Phase 08 after shared route and analytics contracts stabilize
- **External-platform spend:** $0 initially
- **Depends on:** Phases 04, 05 and 07
- **Unlocks:** Phases 12 and 13

## Work packages

### 09.1 Intent-specific forms

- Product-demo form.
- Custom-project inquiry.
- General contact.
- Progressive fields and accessible validation.
- Consent, privacy notice, spam controls and rate limiting.

### 09.2 Lead intake

- Server-side validation and deduplication.
- Attribution: source, campaign, landing page, product/service and CTA.
- Idempotent creation.
- Audit event and staff notification.
- Safe handling when email delivery fails.

### 09.3 Demo booking

- Available-slot selection plus alternate-time request.
- Timezone-aware storage and display.
- Conflict prevention and booking confirmation.
- Calendar adapter contract without requiring a paid scheduler.

### 09.4 Structured WhatsApp handoff

- User selects intent before redirect.
- Generate a non-sensitive prefilled message.
- Record handoff attribution.
- Provide staff workflow to match/create the resulting lead.
- Do not integrate official paid messaging in V1.

### 09.5 CRM core

- Lead and opportunity records.
- Product and custom-service pipeline templates.
- Ownership, stage, value, probability, next action and lost reason.
- Notes, tasks and activity events.
- Shared pool plus manual assignment.

### 09.6 Staff V1 screens

- Secure minimal lead inbox.
- Lead detail and timeline.
- Assignment, stage update, follow-up and notes.
- No full staff operations platform yet.

### 09.7 Transactional email

- Provider-neutral email adapter.
- Branded lead receipt and demo confirmation.
- Development capture adapter.
- Free external delivery allowance for production.
- SPF, DKIM and DMARC setup requirements.

### 09.8 Critical tests

- Duplicate submission and replay.
- Spam/rate limiting.
- Timezone and booking collision.
- Unauthorized lead access.
- Email-provider failure.
- Attribution preservation.
- Form accessibility.

## Exit criteria

- Every public conversion creates one correct CRM record.
- Visitors receive a clear success/failure state.
- Staff can own and progress a lead securely.
- Bookings cannot double-book the same slot.
- Failed email does not lose the lead.
- No paid CRM or scheduling subscription is required.

## Rollback and recovery

Forms must support a temporary safe fallback that stores leads and alerts staff even if scheduling or email adapters are disabled. Never fall back to silently dropping submissions.

## Cold-start handoff

Read Questions 3, 12–18, 33, 36, 39, 40, 54, 55, 70 and 91–95. CRM is the sales source of truth; WhatsApp and email are channels.
