export type HealthContract = Readonly<{
  service: string;
  status: "ok";
  version: string;
}>;

export function createHealthContract(
  service: string,
  version: string,
): HealthContract {
  if (service.trim().length === 0) {
    throw new Error("service must not be empty");
  }

  if (version.trim().length === 0) {
    throw new Error("version must not be empty");
  }

  return {
    service,
    status: "ok",
    version,
  };
}

export type EventEnvelope<TPayload = unknown> = Readonly<{
  eventId: string;
  eventType: string;
  schemaVersion: 1;
  occurredAt: string;
  organizationId?: string;
  payload: TPayload;
  correlationId: string;
}>;

export type CreateEventEnvelopeInput<TPayload> = Omit<
  EventEnvelope<TPayload>,
  "schemaVersion"
>;

const eventTypePattern = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;

export function createEventEnvelope<TPayload>(
  input: CreateEventEnvelopeInput<TPayload>,
): EventEnvelope<TPayload> {
  if (!eventTypePattern.test(input.eventType)) {
    throw new Error("eventType must use domain.action format");
  }

  if (input.eventId.trim().length === 0) {
    throw new Error("eventId must not be empty");
  }

  if (input.correlationId.trim().length === 0) {
    throw new Error("correlationId must not be empty");
  }

  if (Number.isNaN(Date.parse(input.occurredAt))) {
    throw new Error("occurredAt must be an ISO-8601 timestamp");
  }

  return {
    ...input,
    schemaVersion: 1,
  };
}

export type TenantContext = Readonly<{
  organizationId: string;
  placementId: string;
  actorId: string;
  correlationId: string;
}>;

export function createTenantContext(input: TenantContext): TenantContext {
  const requiredFields = [
    "organizationId",
    "placementId",
    "actorId",
    "correlationId",
  ] as const;

  for (const field of requiredFields) {
    if (input[field].trim().length === 0) {
      throw new Error(`${field} must not be empty`);
    }
  }

  return input;
}
