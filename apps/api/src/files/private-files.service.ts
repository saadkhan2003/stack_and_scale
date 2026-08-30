import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import type {
  PrivateObjectStorage,
  SignedPrivateAccess,
} from "@stack-and-scale/storage";
import { PlatformDatabaseService } from "../platform-database.service.js";

export const PRIVATE_STORAGE = Symbol("PRIVATE_STORAGE");
export const MALWARE_SCAN_HOOK = Symbol("MALWARE_SCAN_HOOK");
export type MalwareScanHook = Readonly<{
  scan(input: {
    fileId: string;
    versionId: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<"clean" | "quarantined" | "pending">;
}>;

@Injectable()
export class PrivateFilesService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(PRIVATE_STORAGE) private readonly storage: PrivateObjectStorage,
    @Inject(MALWARE_SCAN_HOOK) private readonly scanner: MalwareScanHook,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT f.id, f.owner_id, f.original_filename, f.classification, f.retention_until, f.legal_hold, f.status, f.created_at, v.id AS version_id, v.version, v.content_type, v.size_bytes, v.checksum_sha256, v.scan_status FROM platform.private_files f JOIN LATERAL (SELECT * FROM platform.private_file_versions WHERE file_id=f.id AND organization_id=f.organization_id ORDER BY version DESC LIMIT 1) v ON true WHERE f.organization_id=$1 ORDER BY f.created_at DESC LIMIT 200",
      [organizationId],
    );
    return { data: result.rows };
  }

  public async upload(
    organizationId: string,
    actorId: string,
    input: {
      ownerId?: string;
      filename: string;
      classification: string;
      contentType: string;
      body: Uint8Array;
      retentionUntil?: string;
    },
  ) {
    if (
      !input.filename.trim() ||
      !["internal", "confidential", "restricted"].includes(
        input.classification,
      ) ||
      input.body.byteLength < 1
    )
      throw new BadRequestException("File metadata and body are required.");
    const quota = await this.database.query(
      "SELECT max_bytes, used_bytes FROM platform.storage_quotas WHERE organization_id=$1",
      [organizationId],
    );
    const q = quota.rows[0];
    if (
      !q ||
      Number(q.max_bytes) < Number(q.used_bytes) + input.body.byteLength
    )
      throw new ConflictException("Storage quota exceeded or not configured.");
    const fileId = `file_${randomUUID()}`;
    const versionId = `file_version_${randomUUID()}`;
    const key = `files/${fileId}/v1-${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const checksum = createHash("sha256").update(input.body).digest("hex");
    await this.storage.putObject({
      organizationId,
      objectKey: key,
      contentType: input.contentType,
      body: input.body,
    });
    const scanStatus = await this.scanner.scan({
      fileId,
      versionId,
      body: input.body,
      contentType: input.contentType,
    });
    await this.database.query(
      "INSERT INTO platform.private_files (id,organization_id,owner_id,original_filename,classification,retention_until,status,created_by) VALUES ($1,$2,$3,$4,$5,$6::timestamptz,$7,$8)",
      [
        fileId,
        organizationId,
        input.ownerId ?? actorId,
        input.filename.trim(),
        input.classification,
        input.retentionUntil ?? null,
        scanStatus === "quarantined" ? "quarantined" : "active",
        actorId,
      ],
    );
    const version = await this.database.query(
      "INSERT INTO platform.private_file_versions (id,organization_id,file_id,version,storage_key,content_type,size_bytes,checksum_sha256,scan_status,created_by) VALUES ($1,$2,$3,1,$4,$5,$6,$7,$8,$9) RETURNING id,version,scan_status",
      [
        versionId,
        organizationId,
        fileId,
        key,
        input.contentType,
        input.body.byteLength,
        checksum,
        scanStatus,
        actorId,
      ],
    );
    await this.database.query(
      "UPDATE platform.storage_quotas SET used_bytes=used_bytes+$2, updated_at=now() WHERE organization_id=$1",
      [organizationId, input.body.byteLength],
    );
    return { data: { id: fileId, version: version.rows[0] } };
  }

  public async signedAccess(
    organizationId: string,
    actorId: string,
    fileId: string,
    version = 0,
  ): Promise<{ data: SignedPrivateAccess }> {
    const result = await this.database.query(
      "SELECT v.id AS version_id, v.version, v.storage_key, v.scan_status FROM platform.private_file_versions v JOIN platform.private_files f ON f.id=v.file_id AND f.organization_id=v.organization_id WHERE v.file_id=$1 AND v.organization_id=$2 AND ($3=0 OR v.version=$3) ORDER BY v.version DESC LIMIT 1",
      [fileId, organizationId, version],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Private file not found.");
    if (row.scan_status !== "clean")
      throw new ConflictException(
        "File is not available until malware scanning is clean.",
      );
    const access = await this.storage.createSignedAccess(
      { organizationId, objectKey: String(row.storage_key) },
      300,
    );
    await this.database.query(
      "INSERT INTO platform.private_file_download_audits (id,organization_id,file_id,version_id,actor_id,expires_at) VALUES ($1,$2,$3,$4,$5,$6::timestamptz)",
      [
        `file_download_${randomUUID()}`,
        organizationId,
        fileId,
        row.version_id,
        actorId,
        access.expiresAt,
      ],
    );
    return { data: access };
  }
}
