export const PRODUCT_INTEGRATION_CONTRACT_VERSION = "1.0" as const;

export type ProductIntegrationErrorCode =
  | "integration.authentication_required"
  | "integration.installation_revoked"
  | "integration.invalid_request"
  | "integration.idempotency_conflict"
  | "integration.lease_rejected"
  | "integration.conflict";

export type ProductIntegrationEvent<TPayload = Record<string, unknown>> =
  Readonly<{
    contractVersion: typeof PRODUCT_INTEGRATION_CONTRACT_VERSION;
    eventId: string;
    type: string;
    source: "platform";
    subject: Readonly<{ kind: "installation" | "account"; id: string }>;
    occurredAt: string;
    payloadVersion: 1;
    payload: TPayload;
    keyId: string;
    signature: string;
  }>;

export type EntitlementLease = Readonly<{
  contractVersion: typeof PRODUCT_INTEGRATION_CONTRACT_VERSION;
  keyId: string;
  installationId: string;
  accountOrganizationId: string;
  sequence: number;
  issuedAt: string;
  expiresAt: string;
  graceUntil: string;
  entitlements: Record<string, unknown>;
  signature: string;
}>;

export type SyncMutation = Readonly<{
  mutationId: string;
  localSequence: number;
  entityKind: string;
  baseVersion?: string;
  payload: Record<string, unknown>;
}>;

function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new Error("canonical JSON cannot contain a non-finite number");
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
      .join(",")}}`;
  }
  throw new Error(
    "canonical JSON cannot contain undefined, bigint, symbol or function values",
  );
}

/** Stable bytes for Ed25519 signatures on integration events and leases. */
export function canonicalProductIntegrationJson(value: unknown): string {
  return canonicalize(value);
}

export function unsignedIntegrationEvent<TPayload>(
  event: Omit<ProductIntegrationEvent<TPayload>, "signature">,
): Omit<ProductIntegrationEvent<TPayload>, "signature"> {
  if (
    event.contractVersion !== PRODUCT_INTEGRATION_CONTRACT_VERSION ||
    !event.eventId ||
    !event.type ||
    !event.subject.id ||
    Number.isNaN(Date.parse(event.occurredAt))
  )
    throw new Error("integration event is invalid");
  return event;
}

export function unsignedEntitlementLease(
  lease: Omit<EntitlementLease, "signature">,
): Omit<EntitlementLease, "signature"> {
  if (
    lease.contractVersion !== PRODUCT_INTEGRATION_CONTRACT_VERSION ||
    !lease.installationId ||
    !lease.accountOrganizationId ||
    !Number.isSafeInteger(lease.sequence) ||
    lease.sequence < 1 ||
    Number.isNaN(Date.parse(lease.issuedAt)) ||
    Number.isNaN(Date.parse(lease.expiresAt)) ||
    Number.isNaN(Date.parse(lease.graceUntil))
  )
    throw new Error("entitlement lease is invalid");
  if (
    Date.parse(lease.expiresAt) <= Date.parse(lease.issuedAt) ||
    Date.parse(lease.graceUntil) < Date.parse(lease.expiresAt)
  )
    throw new Error("entitlement lease time window is invalid");
  return lease;
}
