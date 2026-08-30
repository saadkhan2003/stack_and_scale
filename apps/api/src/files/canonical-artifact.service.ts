import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type {
  PrivateObjectStorage,
  SignedPrivateAccess,
} from "@stack-and-scale/storage";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { PRIVATE_STORAGE } from "./private-files.service.js";

@Injectable()
export class CanonicalArtifactService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(PRIVATE_STORAGE) private readonly storage: PrivateObjectStorage,
  ) {}

  public async retain(input: {
    organizationId: string;
    actorId: string;
    resourceType: "proposal" | "contract";
    resourceId: string;
    resourceVersionId: string;
    filename: string;
    body: Buffer;
    checksumSha256: string;
  }) {
    const objectKey = `documents/${input.resourceType}/${input.resourceId}/${input.resourceVersionId}.pdf`;
    await this.storage.putObject({
      organizationId: input.organizationId,
      objectKey,
      contentType: "application/pdf",
      body: input.body,
    });
    const inserted = await this.database.query(
      `INSERT INTO platform.canonical_document_artifacts (id, organization_id, resource_type, resource_id, resource_version_id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, retention_until, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, 'application/pdf', $8, $9, now() + ($10 * interval '1 day'), $11) ON CONFLICT (organization_id, resource_type, resource_version_id) DO NOTHING RETURNING id, resource_type, resource_id, resource_version_id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, retention_until, legal_hold, created_at`,
      [
        `canonical_artifact_${randomUUID()}`,
        input.organizationId,
        input.resourceType,
        input.resourceId,
        input.resourceVersionId,
        objectKey,
        input.filename,
        input.body.byteLength,
        input.checksumSha256,
        Number(process.env["DOCUMENT_ARTIFACT_RETENTION_DAYS"] ?? 2555),
        input.actorId,
      ],
    );
    if (inserted.rows[0]) return { data: inserted.rows[0] };
    return this.metadata(
      input.organizationId,
      input.resourceType,
      input.resourceVersionId,
    );
  }

  public async metadata(
    organizationId: string,
    resourceType: "proposal" | "contract",
    resourceVersionId: string,
  ) {
    const result = await this.database.query(
      "SELECT id, resource_type, resource_id, resource_version_id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, retention_until, legal_hold, created_at FROM platform.canonical_document_artifacts WHERE organization_id = $1 AND resource_type = $2 AND resource_version_id = $3",
      [organizationId, resourceType, resourceVersionId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Document artifact not found.");
    return { data: result.rows[0] };
  }

  public async signedAccess(
    organizationId: string,
    actorId: string,
    resourceType: "proposal" | "contract",
    resourceVersionId: string,
  ): Promise<{ data: SignedPrivateAccess }> {
    const artifact = await this.metadata(
      organizationId,
      resourceType,
      resourceVersionId,
    );
    const access = await this.storage.createSignedAccess(
      { organizationId, objectKey: String(artifact.data.storage_key) },
      300,
    );
    await this.database.query(
      "INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata) VALUES ($1, $2, $3, 'commercial.document_artifact_accessed', 'document-artifact-access', $4::jsonb)",
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        JSON.stringify({
          resourceType,
          resourceVersionId,
          expiresAt: access.expiresAt,
        }),
      ],
    );
    return { data: access };
  }

  public async retainPaymentReceipt(input: {
    organizationId: string;
    actorId: string;
    receiptId: string;
    paymentAttemptId: string;
    receiptNumber: string;
    body: Buffer;
    checksumSha256: string;
  }) {
    const objectKey = `receipts/${input.paymentAttemptId}/${input.receiptNumber}.pdf`;
    const existing = await this.database.query(
      `SELECT id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, access, created_at
       FROM platform.payment_receipt_artifacts WHERE organization_id=$1 AND receipt_id=$2`,
      [input.organizationId, input.receiptId],
    );
    if (existing.rows[0]) return { data: existing.rows[0] };
    await this.storage.putObject({
      organizationId: input.organizationId,
      objectKey,
      contentType: "application/pdf",
      body: input.body,
    });
    const inserted = await this.database.query(
      `INSERT INTO platform.payment_receipt_artifacts (id, organization_id, receipt_id, payment_attempt_id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,'application/pdf',$7,$8,$9)
       ON CONFLICT (organization_id, receipt_id) DO NOTHING
       RETURNING id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, access, created_at`,
      [
        `receipt_artifact_${randomUUID()}`,
        input.organizationId,
        input.receiptId,
        input.paymentAttemptId,
        objectKey,
        `${input.receiptNumber}.pdf`,
        input.body.byteLength,
        input.checksumSha256,
        input.actorId,
      ],
    );
    if (inserted.rows[0]) return { data: inserted.rows[0] };
    const retained = await this.database.query(
      `SELECT id, storage_key, original_filename, content_type, size_bytes, checksum_sha256, access, created_at
       FROM platform.payment_receipt_artifacts WHERE organization_id=$1 AND receipt_id=$2`,
      [input.organizationId, input.receiptId],
    );
    return { data: retained.rows[0] };
  }

  public async signedPaymentReceiptAccess(
    organizationId: string,
    actorId: string,
    receiptId: string,
  ) {
    const result = await this.database.query(
      `SELECT storage_key FROM platform.payment_receipt_artifacts WHERE organization_id=$1 AND receipt_id=$2`,
      [organizationId, receiptId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Receipt artifact not found.");
    const access = await this.storage.createSignedAccess(
      { organizationId, objectKey: String(result.rows[0].storage_key) },
      300,
    );
    await this.database.query(
      `INSERT INTO platform.payment_receipt_access_audits (id, organization_id, receipt_id, actor_id, signed_access_url, signed_access_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6::timestamptz)`,
      [
        `receipt_access_${randomUUID()}`,
        organizationId,
        receiptId,
        actorId,
        access.url,
        access.expiresAt,
      ],
    );
    await this.database.query(
      `INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata) VALUES ($1,$2,$3,'commercial.payment_receipt_accessed','payment-receipt-access',$4::jsonb)`,
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        JSON.stringify({ receiptId, expiresAt: access.expiresAt }),
      ],
    );
    return { data: access };
  }
}
