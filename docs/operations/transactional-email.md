# Transactional email operations

Lead intake is stored before an outbox event is created. The worker claims that event and only marks it delivered after the email adapter succeeds. Provider failures are retried and ultimately sent to the existing dead-letter queue; the lead and its CRM history remain intact throughout.

## Development

With `NODE_ENV` other than `production`, outbound messages are captured as JSON Lines in `EMAIL_CAPTURE_PATH` (default: `/tmp/stack-and-scale-email-capture.jsonl`). This keeps local verification private and does not relay email.

## Production

The built-in adapter uses Resend's free tier. Configure `RESEND_API_KEY`, `TRANSACTIONAL_EMAIL_FROM`, and `CRM_NOTIFICATION_EMAIL`; run the worker on its normal schedule. The sender domain must be verified with the provider. Publish the provider-supplied SPF and DKIM records, then add a DMARC record such as `v=DMARC1; p=none; rua=mailto:dmarc@your-domain` before gradually enforcing the policy after monitoring reports. Do not put secrets in source control.

No booking, CRM, or lead-record operation depends on successful email delivery.

## Demo slots

Set `DEMO_AVAILABLE_SLOTS` to a comma-separated list of future UTC ISO-8601 timestamps to publish no-cost local calendar availability. The API removes already-confirmed times atomically at booking, and visitors can always submit an alternate-time request when no public slot is suitable. This adapter deliberately avoids a paid scheduling service; replace the configuration source with a calendar integration only after its privacy review.
