# Data Classification and Handling Rules

## Classes

| Class | Examples | Storage/access | Logging | Default retention |
|---|---|---|---|---|
| Public | published pages, approved case studies, public status | cacheable public delivery | normal operational metadata only | until superseded, then archive/review |
| Internal | drafts, internal process notes, non-sensitive metrics | authenticated staff access | identifiers permitted if needed | 2 years after supersession unless needed longer |
| Confidential | leads, contacts, invoices, proposals, project records | organization/role-scoped encrypted storage | redact content and minimize identifiers | contract/business lifecycle + 2 years |
| Restricted | portal documents, payment proofs, support attachments, security investigations | explicit business need, signed file access, download audit | no file content or unnecessary personal data | shortest documented operational/contract period |
| Secret | passwords, API keys, private keys, webhook secrets, recovery keys | dedicated secrets system only; least privilege | never log or include in errors/audit payloads | until rotated/revoked; rotation register retained |

The schedule is an engineering default, not legal advice. A validated legal, contractual or accounting requirement may extend a record's retention only through the exception process.

## General controls

- Encrypt data in transit and at rest through platform/storage controls.
- Do not place credentials, full card/payment secrets, production database exports or unusually sensitive client datasets in ordinary portal uploads.
- Validate file size/type, scan untrusted uploads when the feature is introduced, store privately, and issue short-lived signed access URLs after authorization.
- Logs, traces, analytics and error reports are privacy-filtered. They use correlation IDs, pseudonymous identifiers and allow-listed fields rather than request/body dumps.
- Analytics requires consent where required; consent status controls collection and later deletion propagation.

## Audit and legal hold

Sensitive actions create append-oriented audit records with actor, action, target, organization, timestamp, origin, correlation ID and minimal before/after context. Audit records exclude secrets and excess personal data.

A legal/required-retention hold includes scope, reason, authority, start date, expiry/review date and approving owner. It blocks destructive deletion only for the bounded scope, is visible to the privacy workflow, and is itself audited. Expired holds require explicit review before removal.
