import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import {
  calculateRetryDelayMs,
  createContractTemplateVersion,
  createContractVersionBinding,
  createSignedArtifactMetadata,
  hashContractContent,
  verifyESignCallback,
  type ESignProviderAdapter,
  type SignerIdentityEvidence,
  type SignedArtifactMetadata,
} from "@stack-and-scale/contracts";
import { createCanonicalPdf } from "@stack-and-scale/storage";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { CanonicalArtifactService } from "../files/canonical-artifact.service.js";
import { documentBrand } from "../files/document-brand.js";

export const ESIGN_PROVIDER_ADAPTER = Symbol("ESIGN_PROVIDER_ADAPTER");

export type ContractSignerInput = SignerIdentityEvidence;

@Injectable()
export class ContractService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(ESIGN_PROVIDER_ADAPTER)
    private readonly adapter: ESignProviderAdapter | undefined,
    @Inject(CanonicalArtifactService)
    @Optional()
    private readonly artifacts?: CanonicalArtifactService,
  ) {}

  public async createTemplate(
    organizationId: string,
    actorId: string,
    name: string,
    description: string,
  ) {
    if (!name.trim())
      throw new BadRequestException("Template name is required.");
    const result = await this.database.query(
      "INSERT INTO platform.contract_templates (id, organization_id, name, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, organization_id, name, description, status, created_at",
      [
        `contract_template_${randomUUID()}`,
        organizationId,
        name.trim(),
        description.trim(),
        actorId,
      ],
    );
    return { data: result.rows[0] };
  }

  public async createTemplateVersion(
    organizationId: string,
    actorId: string,
    templateId: string,
    body: string,
    variables: readonly string[],
  ) {
    const template = await this.database.query(
      "SELECT id FROM platform.contract_templates WHERE id = $1 AND organization_id = $2 AND status <> 'archived'",
      [templateId, organizationId],
    );
    if (!template.rows[0])
      throw new NotFoundException("Contract template not found.");
    const current = await this.database.query(
      "SELECT COALESCE(MAX(version), 0) AS version FROM platform.contract_template_versions WHERE template_id = $1 AND organization_id = $2",
      [templateId, organizationId],
    );
    const version = Number(current.rows[0]?.["version"] ?? 0) + 1;
    const checked = createContractTemplateVersion({
      templateId,
      organizationId,
      version,
      body,
      variables,
      status: "draft",
    });
    const result = await this.database.query(
      "INSERT INTO platform.contract_template_versions (id, template_id, organization_id, version, body, variables, content_sha256, created_by) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8) RETURNING id, template_id, version, content_sha256, status, created_at",
      [
        `contract_template_version_${randomUUID()}`,
        templateId,
        organizationId,
        checked.version,
        checked.body,
        JSON.stringify(checked.variables),
        checked.contentSha256,
        actorId,
      ],
    );
    return { data: result.rows[0] };
  }

  public async approveTemplateVersion(
    organizationId: string,
    actorId: string,
    templateId: string,
    version: number,
  ) {
    const result = await this.database.query(
      "UPDATE platform.contract_template_versions SET status = 'approved', approved_by = $4, approved_at = now() WHERE template_id = $1 AND organization_id = $2 AND version = $3 AND status = 'draft' RETURNING id, template_id, version, status, approved_at",
      [templateId, organizationId, version, actorId],
    );
    if (!result.rows[0])
      throw new ConflictException(
        "Only a draft template version can be approved.",
      );
    await this.database.query(
      "UPDATE platform.contract_templates SET status = 'approved', approved_by = $3, approved_at = now(), updated_at = now() WHERE id = $1 AND organization_id = $2",
      [templateId, organizationId, actorId],
    );
    return { data: result.rows[0] };
  }

  public async createContract(
    organizationId: string,
    actorId: string,
    input: {
      templateId: string;
      templateVersion: number;
      proposalId: string;
      proposalVersion: number;
      variables: Record<string, unknown>;
    },
  ) {
    const source = await this.database.query(
      "SELECT tv.id AS template_version_id, tv.template_id, tv.status AS template_status, tv.body, p.id AS proposal_id, pv.id AS proposal_version_id, pv.status AS proposal_status FROM platform.contract_template_versions tv JOIN platform.proposal_versions pv ON pv.version = $5 AND pv.proposal_id = $4 AND pv.organization_id = $1 JOIN platform.proposals p ON p.id = pv.proposal_id AND p.organization_id = $1 WHERE tv.template_id = $2 AND tv.version = $3 AND tv.organization_id = $1",
      [
        organizationId,
        input.templateId,
        input.templateVersion,
        input.proposalId,
        input.proposalVersion,
      ],
    );
    const row = source.rows[0];
    if (!row)
      throw new NotFoundException(
        "Approved template or proposal version not found in this tenant.",
      );
    if (
      row["template_status"] !== "approved" ||
      row["proposal_status"] !== "issued"
    )
      throw new ConflictException(
        "Contracts require an approved template and issued proposal version.",
      );
    const rendered = renderTemplate(String(row["body"]), input.variables);
    const binding = createContractVersionBinding({
      contractId: `contract_${randomUUID()}`,
      organizationId,
      templateId: String(row["template_id"]),
      templateVersionId: String(row["template_version_id"]),
      proposalId: String(row["proposal_id"]),
      proposalVersionId: String(row["proposal_version_id"]),
      renderedSha256: hashContractContent(rendered),
    });
    const result = await this.database.query(
      "INSERT INTO platform.contracts (id, organization_id, template_id, template_version_id, proposal_id, proposal_version_id, status, variables, rendered_sha256, created_by) VALUES ($1, $2, $3, $4, $5, $6, 'ready', $7::jsonb, $8, $9) RETURNING id, organization_id, template_id, template_version_id, proposal_id, proposal_version_id, status, rendered_sha256, created_at",
      [
        binding.contractId,
        organizationId,
        binding.templateId,
        binding.templateVersionId,
        binding.proposalId,
        binding.proposalVersionId,
        JSON.stringify(input.variables),
        binding.renderedSha256,
        actorId,
      ],
    );
    return { data: result.rows[0] };
  }

  public async addSigner(
    organizationId: string,
    contractId: string,
    signer: ContractSignerInput,
  ) {
    if (!signer.name.trim() || !signer.email.trim())
      throw new BadRequestException("Signer name and email are required.");
    const contract = await this.database.query(
      "SELECT id FROM platform.contracts WHERE id = $1 AND organization_id = $2",
      [contractId, organizationId],
    );
    if (!contract.rows[0]) throw new NotFoundException("Contract not found.");
    const result = await this.database.query(
      "INSERT INTO platform.contract_signers (id, contract_id, organization_id, name, email, identity_method, identity_evidence) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) ON CONFLICT (contract_id, email) DO NOTHING RETURNING id, contract_id, name, email, identity_method, identity_evidence",
      [
        `contract_signer_${randomUUID()}`,
        contractId,
        organizationId,
        signer.name.trim(),
        signer.email.trim().toLowerCase(),
        signer.identityMethod,
        JSON.stringify(signer.evidence),
      ],
    );
    if (!result.rows[0])
      throw new ConflictException("Signer already exists for this contract.");
    return { data: result.rows[0] };
  }

  public async startSigning(
    organizationId: string,
    actorId: string,
    contractId: string,
    correlationId: string,
  ) {
    if (
      process.env["ESIGN_PROVIDER_ENABLED"] !== "true" ||
      process.env["ESIGN_PROVIDER_APPROVED"] !== "true" ||
      !this.adapter
    )
      throw new ServiceUnavailableException(
        "E-sign provider is disabled pending legal/provider approval.",
      );
    const contract = await this.database.query(
      "SELECT id, rendered_sha256 FROM platform.contracts WHERE id = $1 AND organization_id = $2 AND status IN ('ready', 'failed')",
      [contractId, organizationId],
    );
    if (!contract.rows[0])
      throw new ConflictException("Contract is not ready for signing.");
    const signers = await this.database.query(
      "SELECT name, email, identity_method, identity_evidence FROM platform.contract_signers WHERE contract_id = $1 AND organization_id = $2",
      [contractId, organizationId],
    );
    if (!signers.rows.length)
      throw new ConflictException("At least one signer is required.");
    const attemptId = `contract_attempt_${randomUUID()}`;
    const attempt = await this.database.query(
      "INSERT INTO platform.contract_signing_attempts (id, contract_id, organization_id, provider, attempt_count) VALUES ($1, $2, $3, $4, 1) RETURNING id",
      [attemptId, contractId, organizationId, this.adapter.provider],
    );
    const attemptRow = attempt.rows[0];
    if (!attemptRow)
      throw new ConflictException("Could not create signing attempt.");
    try {
      const envelope = await this.adapter.createEnvelope({
        contractId,
        documentSha256: String(contract.rows[0]["rendered_sha256"]),
        signers: signers.rows.map((row) => ({
          name: String(row["name"]),
          email: String(row["email"]),
          identityMethod: String(
            row["identity_method"],
          ) as SignerIdentityEvidence["identityMethod"],
          evidence: row["identity_evidence"] as Record<string, unknown>,
        })),
      });
      await this.database.query(
        "UPDATE platform.contract_signing_attempts SET status = 'sent', provider_envelope_id = $2, updated_at = now() WHERE id = $1",
        [attemptRow["id"], envelope.providerEnvelopeId],
      );
      await this.database.query(
        "UPDATE platform.contracts SET status = 'sent', updated_at = now() WHERE id = $1 AND organization_id = $2",
        [contractId, organizationId],
      );
      return {
        data: {
          contractId,
          attemptId,
          provider: this.adapter.provider,
          providerEnvelopeId: envelope.providerEnvelopeId,
          status: "sent",
          correlationId,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Provider request failed";
      await this.database.query(
        "UPDATE platform.contract_signing_attempts SET status = 'retryable_failure', last_error = $2, next_retry_at = now() + ($3 * interval '1 millisecond'), updated_at = now() WHERE id = $1",
        [attemptRow["id"], message, calculateRetryDelayMs(1)],
      );
      await this.database.query(
        "UPDATE platform.contracts SET status = 'failed', updated_at = now() WHERE id = $1 AND organization_id = $2",
        [contractId, organizationId],
      );
      throw new ConflictException(
        "E-sign provider request failed and is retryable.",
      );
    }
  }

  public async handleCallback(
    rawBody: string,
    signature: string,
    payload: {
      provider: string;
      eventId: string;
      eventType: string;
      organizationId: string;
      contractId: string;
      status: "sent" | "partially_signed" | "signed" | "failed";
    },
  ) {
    if (
      process.env["ESIGN_PROVIDER_CALLBACK_SECRET"] === undefined ||
      !verifyESignCallback(
        rawBody,
        signature,
        process.env["ESIGN_PROVIDER_CALLBACK_SECRET"] ?? "",
      )
    )
      throw new BadRequestException("Invalid e-sign callback signature.");
    const payloadHash = createHash("sha256")
      .update(rawBody, "utf8")
      .digest("hex");
    const inserted = await this.database.query(
      "INSERT INTO platform.contract_provider_callbacks (id, organization_id, provider, provider_event_id, event_type, signature_valid, payload_sha256) VALUES ($1, $2, $3, $4, $5, true, $6) ON CONFLICT (provider, provider_event_id) DO NOTHING RETURNING id",
      [
        `contract_callback_${randomUUID()}`,
        payload.organizationId,
        payload.provider,
        payload.eventId,
        payload.eventType,
        payloadHash,
      ],
    );
    if (!inserted.rows[0])
      return { data: { duplicate: true, eventId: payload.eventId } };
    const result = await this.database.query(
      "UPDATE platform.contracts SET status = $4, updated_at = now() WHERE id = $1 AND organization_id = $2 AND status IN ('sent', 'partially_signed') RETURNING id, status",
      [
        payload.contractId,
        payload.organizationId,
        payload.eventId,
        payload.status,
      ],
    );
    if (!result.rows[0])
      throw new NotFoundException(
        "Callback contract not found or state is no longer actionable.",
      );
    await this.database.query(
      "UPDATE platform.contract_provider_callbacks SET processed_at = now() WHERE id = $1",
      [inserted.rows[0]["id"]],
    );
    return {
      data: {
        duplicate: false,
        eventId: payload.eventId,
        contract: result.rows[0],
      },
    };
  }

  public async recordUploadedFallback(
    organizationId: string,
    actorId: string,
    contractId: string,
    metadata: SignedArtifactMetadata,
  ) {
    const checked = createSignedArtifactMetadata({
      ...metadata,
      kind: "uploaded_signed_fallback",
      legalHold: metadata.legalHold ?? false,
    });
    const contract = await this.database.query(
      "SELECT id FROM platform.contracts WHERE id = $1 AND organization_id = $2",
      [contractId, organizationId],
    );
    if (!contract.rows[0]) throw new NotFoundException("Contract not found.");
    const result = await this.database.query(
      "INSERT INTO platform.contract_artifacts (id, contract_id, organization_id, kind, storage_key, original_filename, content_type, size_bytes, checksum_sha256, retention_until, legal_hold, uploaded_by) VALUES ($1, $2, $3, 'uploaded_signed_fallback', $4, $5, $6, $7, $8, $9::timestamptz, $10, $11) RETURNING id, contract_id, kind, storage_key, checksum_sha256, retention_until, legal_hold",
      [
        `contract_artifact_${randomUUID()}`,
        contractId,
        organizationId,
        checked.storageKey,
        checked.originalFilename,
        checked.contentType,
        checked.sizeBytes,
        checked.checksumSha256,
        checked.retentionUntil ?? null,
        checked.legalHold,
        actorId,
      ],
    );
    return { data: { ...result.rows[0], completionSubstitute: false } };
  }

  public async artifact(
    organizationId: string,
    actorId: string,
    contractId: string,
  ) {
    const result = await this.database.query(
      "SELECT c.id, c.template_version_id, c.proposal_version_id, c.rendered_sha256, tv.body, p.title, pv.currency, pv.issued_at, pv.valid_until FROM platform.contracts c JOIN platform.contract_template_versions tv ON tv.id = c.template_version_id JOIN platform.proposals p ON p.id = c.proposal_id JOIN platform.proposal_versions pv ON pv.id = c.proposal_version_id WHERE c.id = $1 AND c.organization_id = $2 AND c.status IN ('ready','sent','partially_signed','signed')",
      [contractId, organizationId],
    );
    const row = result.rows[0];
    if (!row)
      throw new NotFoundException("Contract artifact source not found.");
    const signers = await this.database.query(
      "SELECT name, email, identity_method FROM platform.contract_signers WHERE contract_id = $1 AND organization_id = $2 ORDER BY email",
      [contractId, organizationId],
    );
    const body = createCanonicalPdf({
      brand: documentBrand(),
      title: String(row["title"]),
      documentNumber: contractId,
      currency: String(row["currency"]),
      issuedAt: new Date(String(row["issued_at"])).toISOString(),
      validUntil: new Date(String(row["valid_until"])).toISOString(),
      notes: String(row["body"]),
      lineItems: [
        {
          description: "Contract document",
          quantity: 1,
          unitPriceMinorUnits: 0,
          totalMinorUnits: 0,
        },
      ],
      evidence: [
        {
          label: "Template version",
          value: String(row["template_version_id"]),
        },
        {
          label: "Proposal version",
          value: String(row["proposal_version_id"]),
        },
        {
          label: "Rendered content SHA-256",
          value: String(row["rendered_sha256"]),
        },
        ...signers.rows.map((signer) => ({
          label: "Signer evidence",
          value: `${String(signer["name"])} <${String(signer["email"])}> via ${String(signer["identity_method"])}`,
        })),
        {
          label: "Signature status",
          value: "E-sign evidence is not a qualified digital signature",
        },
      ],
    });
    if (!this.artifacts)
      throw new ConflictException(
        "Document artifact storage is not configured.",
      );
    return this.artifacts.retain({
      organizationId,
      actorId,
      resourceType: "contract",
      resourceId: contractId,
      resourceVersionId: contractId,
      filename: `${contractId}.pdf`,
      body: body.body,
      checksumSha256: body.checksumSha256,
    });
  }

  public async artifactAccess(
    organizationId: string,
    actorId: string,
    contractId: string,
  ) {
    const contract = await this.database.query(
      "SELECT id FROM platform.contracts WHERE id = $1 AND organization_id = $2 AND status IN ('ready','sent','partially_signed','signed')",
      [contractId, organizationId],
    );
    if (!contract.rows[0]) throw new NotFoundException("Contract not found.");
    if (!this.artifacts)
      throw new ConflictException(
        "Document artifact storage is not configured.",
      );
    return this.artifacts.signedAccess(
      organizationId,
      actorId,
      "contract",
      contractId,
    );
  }
}

function renderTemplate(
  body: string,
  variables: Record<string, unknown>,
): string {
  return body.replace(
    /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g,
    (_match, key: string) => {
      const value = variables[key];
      if (value === undefined || value === null)
        throw new BadRequestException(`Missing contract variable: ${key}`);
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean")
        return String(value);
      return JSON.stringify(value) ?? "";
    },
  );
}
