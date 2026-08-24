# Event and Webhook Standards

## Domain events

Events are facts named `domain.entity.action` in lower-case dot notation, for example `crm.lead.created`, `billing.payment.verified` and `product.subscription.activated`. The owner publishes an event only after its transaction commits.

```json
{
  "eventId": "evt_...",
  "eventType": "crm.lead.created",
  "schemaVersion": 1,
  "occurredAt": "2026-08-24T18:00:00.000Z",
  "organizationId": "org_...",
  "correlationId": "req_...",
  "payload": {}
}
```

The reusable envelope is implemented in `packages/contracts`. Payload schemas are owned and versioned by their producing domain. Consumers must ignore unknown additive fields and process duplicate event IDs safely.

## Transactional outbox and jobs

A command persists its domain change and outbox entry in one database transaction. A worker claims, delivers and records the outbox item. At-least-once delivery is expected: every consumer is idempotent using event ID or a domain-specific idempotency key. Retries use exponential backoff with jitter; after the configured limit an item enters a dead-letter queue with owner, error classification and manual replay record. Replay never silently changes source data.

## Webhooks

Inbound and outbound webhooks include an event ID, timestamp and version. Outbound deliveries are HMAC signed over the exact body with a per-endpoint secret. Receivers reject invalid signatures, timestamps outside a five-minute replay window and unsupported versions. Secrets rotate with an overlap period and delivery audit.

Outbound retries use bounded exponential backoff, delivery logs and endpoint disablement after repeated permanent failure. Manual replay is authorized, audited and uses the original event ID. Providers and internal consumers must tolerate duplicates and out-of-order delivery.

## Failure ownership

The producer owns durable event creation; the worker owner owns retries/DLQ; the endpoint owner owns webhook configuration and recovery. A failed critical payment, provisioning, email or webhook delivery emits a visible operational signal with its correlation ID.
