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

export type StorageClassification = "internal" | "confidential" | "restricted";

export type StorageObjectMetadata = Readonly<{
  id: string;
  organizationId: string;
  storageKey: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  classification: StorageClassification;
  uploadedByActorId: string;
  createdAt: string;
  checksumSha256: string;
  access: "private";
}>;

export type CreateStorageObjectMetadataInput = Omit<
  StorageObjectMetadata,
  "access"
> & {
  access?: string;
};

const storageClassifications = new Set<StorageClassification>([
  "internal",
  "confidential",
  "restricted",
]);
const sha256Pattern = /^[a-f0-9]{64}$/;
const mediaTypePattern = /^[^\s/]+\/[^\s/]+$/;

function requireNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${field} must not be empty`);
  }
}

function requireTimestamp(value: string, field: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be an ISO-8601 timestamp`);
  }
}

function requireBoundedScope(scope: readonly string[]): void {
  if (
    scope.length === 0 ||
    scope.some((domain) => domain.trim().length === 0)
  ) {
    throw new Error("scope must contain at least one data domain");
  }
}

export function createStorageObjectMetadata(
  input: CreateStorageObjectMetadataInput,
): StorageObjectMetadata {
  requireNonEmpty(input.id, "id");
  requireNonEmpty(input.organizationId, "organizationId");
  requireNonEmpty(input.uploadedByActorId, "uploadedByActorId");
  requireNonEmpty(input.originalFilename, "originalFilename");
  requireTimestamp(input.createdAt, "createdAt");

  if (
    input.storageKey.trim().length === 0 ||
    input.storageKey.startsWith("/") ||
    input.storageKey.includes("..")
  ) {
    throw new Error("storageKey must be a relative object key");
  }

  if (!mediaTypePattern.test(input.contentType)) {
    throw new Error("contentType must be a valid media type");
  }

  if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error("sizeBytes must be a positive safe integer");
  }

  if (!storageClassifications.has(input.classification)) {
    throw new Error(
      "classification must be internal, confidential or restricted",
    );
  }

  if (!sha256Pattern.test(input.checksumSha256)) {
    throw new Error("checksumSha256 must be a lowercase SHA-256 hex digest");
  }

  if (input.access !== undefined && input.access !== "private") {
    throw new Error("access must be private");
  }

  return {
    ...input,
    access: "private",
  };
}

export type PrivacyRequestType =
  | "access"
  | "export"
  | "correction"
  | "restriction"
  | "objection"
  | "consent_withdrawal"
  | "erasure";

export type PrivacyRequesterKind =
  | "data_subject"
  | "authorized_representative"
  | "legal_delegate";

export type PrivacyRequestStatus =
  | "received"
  | "identity_verified"
  | "scoped"
  | "approved"
  | "refused"
  | "executing"
  | "completed"
  | "exception_held";

export type PrivacyVerificationStatus = "pending" | "verified" | "rejected";

export type PrivacyRequest = Readonly<{
  id: string;
  organizationId: string;
  subjectId: string;
  requesterKind: PrivacyRequesterKind;
  requestTypes: readonly PrivacyRequestType[];
  status: PrivacyRequestStatus;
  verificationStatus: PrivacyVerificationStatus;
  scope: readonly string[];
  dueAt: string;
  correlationId: string;
  createdAt: string;
}>;

const privacyRequestTypes = new Set<PrivacyRequestType>([
  "access",
  "export",
  "correction",
  "restriction",
  "objection",
  "consent_withdrawal",
  "erasure",
]);
const requesterKinds = new Set<PrivacyRequesterKind>([
  "data_subject",
  "authorized_representative",
  "legal_delegate",
]);
const verificationStatuses = new Set<PrivacyVerificationStatus>([
  "pending",
  "verified",
  "rejected",
]);
const privacyRequestTransitions: Readonly<
  Record<PrivacyRequestStatus, readonly PrivacyRequestStatus[]>
> = {
  received: ["identity_verified", "refused"],
  identity_verified: ["scoped", "refused"],
  scoped: ["approved", "refused"],
  approved: ["executing", "exception_held"],
  refused: [],
  executing: ["completed", "exception_held"],
  completed: [],
  exception_held: ["executing", "refused"],
};

export function createPrivacyRequest(input: PrivacyRequest): PrivacyRequest {
  requireNonEmpty(input.id, "id");
  requireNonEmpty(input.organizationId, "organizationId");
  requireNonEmpty(input.subjectId, "subjectId");
  requireNonEmpty(input.correlationId, "correlationId");
  requireTimestamp(input.createdAt, "createdAt");
  requireTimestamp(input.dueAt, "dueAt");
  requireBoundedScope(input.scope);

  if (!requesterKinds.has(input.requesterKind)) {
    throw new Error("requesterKind must be a supported requester kind");
  }

  if (!verificationStatuses.has(input.verificationStatus)) {
    throw new Error("verificationStatus must be pending, verified or rejected");
  }

  if (
    input.requestTypes.length === 0 ||
    input.requestTypes.some((type) => !privacyRequestTypes.has(type))
  ) {
    throw new Error(
      "requestTypes must contain at least one supported request type",
    );
  }

  if (input.status !== "received") {
    throw new Error("new privacy requests must start in received status");
  }

  return input;
}

export function transitionPrivacyRequest(
  request: PrivacyRequest,
  nextStatus: PrivacyRequestStatus,
): PrivacyRequest {
  if (!privacyRequestTransitions[request.status].includes(nextStatus)) {
    throw new Error(
      `invalid privacy request transition from ${request.status} to ${nextStatus}`,
    );
  }

  if (
    nextStatus === "identity_verified" &&
    request.verificationStatus !== "verified"
  ) {
    throw new Error(
      "identity_verified requires verificationStatus to be verified",
    );
  }

  return {
    ...request,
    status: nextStatus,
  };
}

export type LegalHold = Readonly<{
  id: string;
  organizationId: string;
  subjectId: string;
  scope: readonly string[];
  authority: string;
  reason: string;
  approvedByActorId: string;
  startedAt: string;
  reviewAt: string;
  expiresAt: string;
  correlationId: string;
  status: "active";
}>;

export type CreateLegalHoldInput = Omit<LegalHold, "status"> & {
  status?: string;
};

export function createLegalHold(input: CreateLegalHoldInput): LegalHold {
  requireNonEmpty(input.id, "id");
  requireNonEmpty(input.organizationId, "organizationId");
  requireNonEmpty(input.subjectId, "subjectId");
  requireNonEmpty(input.authority, "authority");
  requireNonEmpty(input.reason, "reason");
  requireNonEmpty(input.approvedByActorId, "approvedByActorId");
  requireNonEmpty(input.correlationId, "correlationId");
  requireBoundedScope(input.scope);
  requireTimestamp(input.startedAt, "startedAt");
  requireTimestamp(input.reviewAt, "reviewAt");
  requireTimestamp(input.expiresAt, "expiresAt");

  if (Date.parse(input.reviewAt) < Date.parse(input.startedAt)) {
    throw new Error("reviewAt must not be before startedAt");
  }

  if (Date.parse(input.expiresAt) <= Date.parse(input.startedAt)) {
    throw new Error("expiresAt must be after startedAt");
  }

  if (input.status !== undefined && input.status !== "active") {
    throw new Error("new legal holds must be active");
  }

  return {
    ...input,
    status: "active",
  };
}

export {
  authorize,
  isStaffRole,
  permissionsForRole,
  type AuthorizationDecision,
  type AuthorizeInput,
  type MembershipSnapshot,
  type Permission,
  type StaffRole,
} from "./authorization.js";
export {
  evaluateMfaRequirement,
  type EvaluateMfaInput,
  type MfaRequirementDecision,
  type MfaRequirementOutcome,
  type StaffMfaPolicy,
} from "./mfa.js";
export {
  addMoney,
  createAddress,
  calculateCommercialTotals,
  canTransitionCommercialStatus,
  createContact,
  createCurrencyCode,
  createIssuedDocumentVersion,
  createMoney,
  createOrganization,
  DocumentNumberRegistry,
  formatDocumentNumber,
  multiplyMoney,
  roundDecimal,
  subtractMoney,
  transitionCommercialStatus,
  createProposalVersion,
  type CalculatedLineItem,
  type CommercialLineItem,
  type CommercialStatus,
  type CommercialTotals,
  type ProposalStatus,
  type ProposalVersion,
  type Contact,
  type CurrencyCode,
  type DiscountConfiguration,
  type DocumentNumberInput,
  type IssuedDocumentVersion,
  type Money,
  type Address,
  type Organization,
  type RoundingMode,
  type TaxConfiguration,
} from "./commercial.js";
