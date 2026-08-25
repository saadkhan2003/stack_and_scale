import type { Queryable } from "./queryable.js";

const sensitiveKeyPattern = /password|token|secret/i;
const identityActionPrefix = "identity.";

export class AuditEventError extends Error {
  readonly reason:
    | "missing_id"
    | "missing_correlation_id"
    | "missing_event_name"
    | "invalid_event_name"
    | "sensitive_metadata_key";

  constructor(reason: AuditEventError["reason"], message: string) {
    super(message);
    this.name = "AuditEventError";
    this.reason = reason;
  }
}

export type IdentityAuditEventInput = Readonly<{
  id: string;
  eventName: string;
  correlationId: string;
  organizationId?: string | null;
  actorId?: string | null;
  occurredAt?: Date;
  metadata?: Readonly<Record<string, unknown>>;
}>;

function hasSensitiveKey(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some(hasSensitiveKey);
  }
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => sensitiveKeyPattern.test(key) || hasSensitiveKey(nested),
  );
}

export function containsSensitiveMetadataKey(
  metadata: Readonly<Record<string, unknown>>,
): boolean {
  return hasSensitiveKey(metadata);
}

export function normalizeIdentityAction(eventName: string): string {
  if (eventName.trim().length === 0) {
    throw new AuditEventError(
      "missing_event_name",
      "identity audit event name must not be empty",
    );
  }
  const trimmed = eventName.trim();
  if (
    trimmed.includes(".") ||
    trimmed.startsWith(identityActionPrefix) ||
    trimmed.toLowerCase() === identityActionPrefix.trim()
  ) {
    throw new AuditEventError(
      "invalid_event_name",
      `identity audit event name must be a bare event, got "${eventName}"`,
    );
  }
  return `${identityActionPrefix}${trimmed}`;
}

type AuditEventRow = {
  id: string;
};

export async function recordIdentityAuditEvent(
  db: Queryable,
  input: IdentityAuditEventInput,
): Promise<AuditEventRow> {
  if (input.id.trim().length === 0) {
    throw new AuditEventError("missing_id", "audit event id must not be empty");
  }

  if (input.correlationId.trim().length === 0) {
    throw new AuditEventError(
      "missing_correlation_id",
      "audit event correlation id must not be empty",
    );
  }

  const action = normalizeIdentityAction(input.eventName);

  const metadata = input.metadata ?? {};
  if (containsSensitiveMetadataKey(metadata)) {
    throw new AuditEventError(
      "sensitive_metadata_key",
      "audit event metadata contains a password/token/secret key and is refused",
    );
  }

  const organizationId =
    input.organizationId !== undefined && input.organizationId !== null
      ? input.organizationId
      : null;
  const actorId =
    input.actorId !== undefined && input.actorId !== null
      ? input.actorId
      : null;
  const occurredAt = input.occurredAt ?? new Date();

  const result = await db.query(
    `INSERT INTO platform.audit_events
       (id, organization_id, actor_id, action, correlation_id, occurred_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING id`,
    [
      input.id,
      organizationId,
      actorId,
      action,
      input.correlationId,
      occurredAt,
      JSON.stringify(metadata),
    ],
  );

  const row = result.rows[0] as AuditEventRow | undefined;
  return { id: row?.id ?? input.id };
}
