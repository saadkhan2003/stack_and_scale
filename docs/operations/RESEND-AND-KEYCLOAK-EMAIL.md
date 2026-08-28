# Production email: Resend and Keycloak

This runbook enables two separate delivery paths:

- the Stack & Scale worker sends lead and demo messages through the Resend API;
- Keycloak sends password-reset and verification messages through Resend SMTP.

It does not create an inbox. A sender address can send mail without being a
mailbox, but the business should later arrange a reply-capable address if it
expects people to reply to transactional messages.

## 1. Verify a sending domain in Resend

In the Resend dashboard, add either:

- **recommended while Namecheap email forwarding exists:**
  `send.stackandscale.org`; use a sender such as
  `Stack & Scale <notifications@send.stackandscale.org>`; or
- `stackandscale.org` if the business specifically needs an address ending in
  `@stackandscale.org`.

Copy Resend's exact generated DNS records into **Cloudflare → DNS → Records**.
Email records are always DNS-only; do not proxy them. Use the exact host,
record type, target/value and priority shown by Resend.

The root domain already has Namecheap forwarding MX and SPF records. Do not
add a second SPF TXT record at the same hostname: multiple SPF TXT records make
SPF invalid. If Resend asks for a root-host SPF record, stop and merge the
existing and Resend mechanisms into one reviewed record before saving it. A
dedicated `send` subdomain avoids that conflict.

Wait for Resend to show the domain as **Verified**. Resend can then send from
an address at that verified domain; it does not require that address to be an
inbox. Keep existing root MX records unless the business intentionally changes
its inbound-email provider.

## 2. Create a restricted Resend API key

Create a production API key in Resend with only the permission needed to send
email. Copy it directly into the password manager, then immediately onto the
production host. Never put it in chat, a screenshot, GitHub Actions, source
control or a normal note.

On the OVH server, edit the protected environment file:

```bash
nano /opt/stack-and-scale/.env.production
```

Set these values, replacing the examples locally:

```text
RESEND_API_KEY=the-secret-key-from-Resend
TRANSACTIONAL_EMAIL_FROM=Stack & Scale <notifications@send.stackandscale.org>
CRM_NOTIFICATION_EMAIL=your-approved-alert-inbox
```

Save the file, confirm its permissions remain `0600`, and restart only the
worker so it receives the configuration:

```bash
cd /opt/stack-and-scale
docker compose --env-file .env.production -f infra/compose.production.yaml \
  up -d --force-recreate workers
```

Do not run a test production lead until the sender domain is verified.

## 3. Configure Keycloak SMTP

Sign in at `https://identity.stackandscale.org/admin/` with the stored
Keycloak administrator account. Select the **stack-and-scale** realm, then
open **Realm settings → Email**. Use:

| Field               | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| Host                | `smtp.resend.com`                                             |
| Port                | `465`                                                         |
| Encryption          | Enable SSL/TLS                                                |
| Authentication      | On                                                            |
| Authentication type | Password                                                      |
| Username            | `resend`                                                      |
| Password            | The same Resend API key, entered only in the Keycloak console |
| From                | The verified sender address used above                        |
| From display name   | `Stack & Scale`                                               |

Save, then use Keycloak's **Test connection** / **Test authentication** actions
if the console exposes them. Do not enable self-registration merely to test
email; create one controlled test user instead.

## 4. Record the two controlled tests

1. Send a password-reset or verification email from the controlled Keycloak
   user and confirm it arrives at the intended mailbox and links to the HTTPS
   identity host.
2. Submit one clearly labelled test contact/demo request. Confirm there is one
   lead, one related CRM record/outbox event, and the expected Resend email.

Record date/time, sender domain, non-secret Resend message ID, release SHA and
result in `docs/evidence/phase-05/VERIFICATION.md` and
`docs/evidence/phase-12/LAUNCH-TRACE.md`. Delete test leads only through the
normal privacy/retention workflow; do not use direct database deletion.

## References

- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)
- [Resend SMTP credentials](https://resend.com/docs/send-with-smtp)
- [Keycloak realm email settings](https://www.keycloak.org/docs/latest/server_admin/)
