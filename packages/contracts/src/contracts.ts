import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type ContractTemplate = Readonly<{
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: "draft" | "approved" | "archived";
}>;

export type ContractTemplateVersion = Readonly<{
  templateId: string;
  organizationId: string;
  version: number;
  body: string;
  variables: readonly string[];
  contentSha256: string;
  status: "draft" | "approved";
}>;

export type ContractVersionBinding = Readonly<{
  contractId: string;
  organizationId: string;
  templateId: string;
  templateVersionId: string;
  proposalId: string;
  proposalVersionId: string;
  renderedSha256: string;
}>;

export type SignerIdentityEvidence = Readonly<{
  name: string;
  email: string;
  identityMethod: "email" | "provider_verified" | "staff_verified" | "other";
  evidence: Readonly<Record<string, unknown>>;
}>;

export type SignedArtifactMetadata = Readonly<{
  kind: "provider_signed" | "uploaded_signed_fallback";
  storageKey: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256: string;
  provider?: string;
  providerArtifactId?: string;
  retentionUntil?: string;
  legalHold: boolean;
}>;

export type ESignProviderAdapter = Readonly<{
  provider: string;
  createEnvelope(
    input: Readonly<{
      contractId: string;
      documentSha256: string;
      signers: readonly SignerIdentityEvidence[];
    }>,
  ): Promise<Readonly<{ providerEnvelopeId: string }>>;
  cancelEnvelope(providerEnvelopeId: string): Promise<void>;
}>;

const sha256Pattern = /^[a-f0-9]{64}$/;

function required(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} must not be empty`);
}

export function hashContractContent(content: string): string {
  required(content, "content");
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function createContractTemplateVersion(
  input: Omit<ContractTemplateVersion, "contentSha256">,
): ContractTemplateVersion {
  required(input.templateId, "templateId");
  required(input.organizationId, "organizationId");
  required(input.body, "body");
  if (!Number.isSafeInteger(input.version) || input.version <= 0)
    throw new Error("version must be a positive safe integer");
  if (input.variables.some((variable) => !/^[$A-Z_a-z][$\w]*$/.test(variable)))
    throw new Error("template variables must be valid identifiers");
  return Object.freeze({
    ...input,
    contentSha256: hashContractContent(input.body),
  });
}

export function createContractVersionBinding(
  input: ContractVersionBinding,
): ContractVersionBinding {
  for (const [field, value] of Object.entries(input))
    if (typeof value === "string" && !value.trim())
      throw new Error(`${field} must not be empty`);
  if (!sha256Pattern.test(input.renderedSha256))
    throw new Error("renderedSha256 must be a lowercase SHA-256 hex digest");
  return Object.freeze({ ...input });
}

export function createSignedArtifactMetadata(
  input: SignedArtifactMetadata,
): SignedArtifactMetadata {
  required(input.storageKey, "storageKey");
  required(input.originalFilename, "originalFilename");
  if (input.storageKey.startsWith("/") || input.storageKey.includes(".."))
    throw new Error("storageKey must be a relative object key");
  if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes <= 0)
    throw new Error("sizeBytes must be a positive safe integer");
  if (!sha256Pattern.test(input.checksumSha256))
    throw new Error("checksumSha256 must be a lowercase SHA-256 hex digest");
  if (
    input.retentionUntil !== undefined &&
    Number.isNaN(Date.parse(input.retentionUntil))
  )
    throw new Error("retentionUntil must be an ISO-8601 timestamp");
  if (input.kind === "provider_signed" && !input.provider?.trim())
    throw new Error("provider is required for provider artifacts");
  return Object.freeze({ ...input });
}

export function signESignCallback(body: string, secret: string): string {
  required(secret, "secret");
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

export function verifyESignCallback(
  body: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  const expected = Buffer.from(signESignCallback(body, secret), "utf8");
  const received = Buffer.from(signature, "utf8");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function calculateRetryDelayMs(
  attempt: number,
  baseMs = 1_000,
  maxMs = 86_400_000,
): number {
  if (!Number.isSafeInteger(attempt) || attempt < 0)
    throw new Error("attempt must be a non-negative safe integer");
  return Math.min(maxMs, baseMs * 2 ** attempt);
}
