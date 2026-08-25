import type { Queryable } from "./queryable.js";

export type PrivacyRequesterKind =
  | "account_holder"
  | "lead"
  | "representative"
  | "delegate";

export type PrivacyRequestType =
  | "access"
  | "export"
  | "correction"
  | "restriction"
  | "erasure";

export type PrivacyRequestStatus =
  | "received"
  | "identity_verified"
  | "scoped"
  | "approved"
  | "refused"
  | "executing"
  | "completed"
  | "exception_held";

export type CreatePrivacyRequestRecordInput = Readonly<{
  id: string;
  requesterKind: PrivacyRequesterKind;
  requesterContactId: string | null;
  organizationId: string | null;
  requestType: PrivacyRequestType;
  identityVerified: boolean;
  scope: Record<string, unknown>;
  targets: readonly string[];
  actorId: string;
  correlationId: string;
}>;

export type CreatePrivacyRequestRecordResult = Readonly<{
  id: string;
  status: "identity_verified";
  targetCount: number;
}>;

const transitions: ReadonlyMap<
  PrivacyRequestStatus,
  ReadonlySet<PrivacyRequestStatus>
> = new Map([
  ["received", new Set(["identity_verified", "refused"])],
  ["identity_verified", new Set(["scoped", "refused"])],
  ["scoped", new Set(["approved", "refused", "exception_held"])],
  ["approved", new Set(["executing", "exception_held"])],
  ["executing", new Set(["completed", "exception_held"])],
  ["exception_held", new Set(["executing", "refused"])],
  ["refused", new Set<PrivacyRequestStatus>()],
  ["completed", new Set<PrivacyRequestStatus>()],
]);

export function transitionPrivacyRequestStatus(
  current: PrivacyRequestStatus,
  next: PrivacyRequestStatus,
): PrivacyRequestStatus {
  if (!transitions.get(current)?.has(next)) {
    throw new Error("invalid privacy request status transition");
  }

  return next;
}

export async function createPrivacyRequestRecord(
  client: Queryable,
  input: CreatePrivacyRequestRecordInput,
): Promise<CreatePrivacyRequestRecordResult> {
  if (!input.identityVerified) {
    throw new Error("privacy request identity must be verified");
  }

  if (input.targets.length === 0) {
    throw new Error("privacy request must include at least one target");
  }

  const minimizedScope = {
    keys: Object.keys(input.scope).sort(),
  };

  await client.query(
    `INSERT INTO platform.privacy_requests (
      id,
      requester_kind,
      requester_contact_id,
      organization_id,
      request_type,
      status,
      identity_verified_at,
      scope,
      correlation_id
    ) VALUES ($1, $2, $3, $4, $5, 'identity_verified', now(), $6::jsonb, $7)
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      scope = EXCLUDED.scope,
      correlation_id = EXCLUDED.correlation_id,
      updated_at = now()`,
    [
      input.id,
      input.requesterKind,
      input.requesterContactId,
      input.organizationId,
      input.requestType,
      JSON.stringify(minimizedScope),
      input.correlationId,
    ],
  );

  for (const target of input.targets) {
    await client.query(
      `INSERT INTO platform.privacy_request_targets (
        request_id,
        target,
        status
      ) VALUES ($1, $2, 'pending')
      ON CONFLICT (request_id, target) DO NOTHING`,
      [input.id, target],
    );
  }

  await client.query(
    `INSERT INTO platform.audit_events (
      id,
      organization_id,
      actor_id,
      action,
      correlation_id,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    ON CONFLICT (id) DO NOTHING`,
    [
      `${input.id}:identity_verified`,
      input.organizationId,
      input.actorId,
      "privacy_request.identity_verified",
      input.correlationId,
      JSON.stringify({
        requestId: input.id,
        requestType: input.requestType,
        targetCount: input.targets.length,
        scopeKeys: minimizedScope.keys,
      }),
    ],
  );

  return {
    id: input.id,
    status: "identity_verified",
    targetCount: input.targets.length,
  };
}
