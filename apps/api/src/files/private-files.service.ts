import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import type { Queryable } from "@stack-and-scale/database";
import type {
  PrivateObjectStorage,
  SignedPrivateAccess,
} from "@stack-and-scale/storage";
import { PlatformDatabaseService } from "../platform-database.service.js";

export const PRIVATE_STORAGE = Symbol("PRIVATE_STORAGE");
export const MALWARE_SCAN_HOOK = Symbol("MALWARE_SCAN_HOOK");
export type MalwareScanStatus = "clean" | "quarantined" | "pending" | "failed";
export type MalwareScanHook = Readonly<{
  scan(input: {
    fileId: string;
    versionId: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<MalwareScanStatus>;
}>;
export type FileRole = string;
type Classification = "internal" | "confidential" | "restricted";
type FileRow = {
  owner_id: string;
  classification: Classification;
  status: string;
  legal_hold: boolean;
};

export function canAccessPrivateFile(
  actorId: string,
  role: FileRole,
  file: Pick<FileRow, "owner_id" | "classification">,
  action: "read" | "manage",
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (action === "read" && file.owner_id === actorId) return true;
  if (action === "manage") return false;
  if (file.classification === "restricted") return false;
  if (file.classification === "confidential")
    return role === "manager" || file.owner_id === actorId;
  return file.owner_id === actorId || role === "manager" || role === "member";
}

@Injectable()
export class PrivateFilesService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(PRIVATE_STORAGE) private readonly storage: PrivateObjectStorage,
    @Inject(MALWARE_SCAN_HOOK) private readonly scanner: MalwareScanHook,
  ) {}

  public async list(organizationId: string, actorId: string, role: FileRole) {
    const result = await this.database.query(
      `SELECT f.id, f.owner_id, f.original_filename, f.classification, f.retention_until,
              f.legal_hold, f.status, f.created_at, v.id AS version_id, v.version,
              v.content_type, v.size_bytes, v.checksum_sha256, v.scan_status
         FROM platform.private_files f
         JOIN LATERAL (SELECT * FROM platform.private_file_versions
                        WHERE file_id=f.id AND organization_id=f.organization_id
                        ORDER BY version DESC LIMIT 1) v ON true
        WHERE f.organization_id=$1
          AND ($2 IN ('owner','admin','manager') OR f.owner_id=$3)
          AND ($2 IN ('owner','admin') OR f.classification <> 'restricted' OR f.owner_id=$3)
        ORDER BY f.created_at DESC LIMIT 200`,
      [organizationId, role, actorId],
    );
    return { data: result.rows };
  }

  public async upload(
    organizationId: string,
    actorId: string,
    role: FileRole,
    input: {
      fileId?: string;
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
      !isClassification(input.classification) ||
      input.body.byteLength < 1
    )
      throw new BadRequestException("File metadata and body are required.");
    const ownerId = input.ownerId ?? actorId;
    if (ownerId !== actorId && role !== "owner" && role !== "admin")
      throw new ForbiddenException(
        "Only administrators can assign file ownership.",
      );

    let file: FileRow | undefined;
    let version = 1;
    if (input.fileId !== undefined) {
      file = await this.getFile(organizationId, input.fileId);
      this.assertAccess(actorId, role, file, "manage");
      if (file.status === "deleted")
        throw new ConflictException(
          "Deleted files cannot receive new versions.",
        );
      if (file.classification !== input.classification)
        throw new BadRequestException(
          "A file version cannot change classification.",
        );
      const next = await this.database.query(
        "SELECT COALESCE(MAX(version),0)+1 AS next_version FROM platform.private_file_versions WHERE organization_id=$1 AND file_id=$2",
        [organizationId, input.fileId],
      );
      version = Number(next.rows[0]?.next_version ?? 1);
    }

    const fileId = input.fileId ?? `file_${randomUUID()}`;
    const versionId = `file_version_${randomUUID()}`;
    const key = `files/${fileId}/v${version}-${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const checksum = createHash("sha256").update(input.body).digest("hex");
    await this.reserve(organizationId, input.body.byteLength);
    let stored = false;
    try {
      await this.storage.putObject({
        organizationId,
        objectKey: key,
        contentType: input.contentType,
        body: input.body,
      });
      stored = true;
      const scanStatus = await this.scanner.scan({
        fileId,
        versionId,
        body: input.body,
        contentType: input.contentType,
      });
      await this.database.transaction(async (db) => {
        if (input.fileId === undefined) {
          await db.query(
            "INSERT INTO platform.private_files (id,organization_id,owner_id,original_filename,classification,retention_until,status,created_by) VALUES ($1,$2,$3,$4,$5,$6::timestamptz,$7,$8)",
            [
              fileId,
              organizationId,
              ownerId,
              input.filename.trim(),
              input.classification,
              input.retentionUntil ?? null,
              scanStatus === "quarantined" ? "quarantined" : "active",
              actorId,
            ],
          );
        } else {
          await db.query(
            "UPDATE platform.private_files SET status=$3, updated_at=now() WHERE id=$1 AND organization_id=$2 AND status <> 'deleted'",
            [
              fileId,
              organizationId,
              scanStatus === "quarantined" ? "quarantined" : "active",
            ],
          );
        }
        await db.query(
          "INSERT INTO platform.private_file_versions (id,organization_id,file_id,version,storage_key,content_type,size_bytes,checksum_sha256,scan_status,created_by,scanned_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $9 IN ('clean','quarantined','failed') THEN now() END)",
          [
            versionId,
            organizationId,
            fileId,
            version,
            key,
            input.contentType,
            input.body.byteLength,
            checksum,
            scanStatus,
            actorId,
          ],
        );
        await this.releaseReservation(
          db,
          organizationId,
          input.body.byteLength,
          true,
        );
        await this.audit(
          db,
          organizationId,
          fileId,
          actorId,
          input.fileId === undefined ? "uploaded" : "version_uploaded",
          null,
          scanStatus === "quarantined" ? "quarantined" : "active",
        );
      });
      return {
        data: { id: fileId, version: { id: versionId, version, scanStatus } },
      };
    } catch (error) {
      if (stored)
        await this.storage
          .deleteObject({ organizationId, objectKey: key })
          .catch(() => undefined);
      await this.releaseReservation(
        this.database,
        organizationId,
        input.body.byteLength,
        false,
      ).catch(() => undefined);
      throw error;
    }
  }

  public async signedAccess(
    organizationId: string,
    actorId: string,
    role: FileRole,
    fileId: string,
    version = 0,
  ): Promise<{ data: SignedPrivateAccess }> {
    const result = await this.database.query(
      `SELECT f.owner_id,f.classification,f.status,v.id AS version_id,v.version,v.storage_key,v.scan_status
         FROM platform.private_file_versions v JOIN platform.private_files f
           ON f.id=v.file_id AND f.organization_id=v.organization_id
        WHERE v.file_id=$1 AND v.organization_id=$2 AND ($3=0 OR v.version=$3)
        ORDER BY v.version DESC LIMIT 1`,
      [fileId, organizationId, version],
    );
    const row = result.rows[0] as
      | (FileRow & {
          version_id: string;
          storage_key: string;
          scan_status: string;
        })
      | undefined;
    if (!row) throw new NotFoundException("Private file not found.");
    this.assertAccess(actorId, role, row, "read");
    if (row.status !== "active" || row.scan_status !== "clean")
      throw new ConflictException("File is not available.");
    const access = await this.storage.createSignedAccess(
      { organizationId, objectKey: row.storage_key },
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

  public async delete(
    organizationId: string,
    actorId: string,
    role: FileRole,
    fileId: string,
  ) {
    const file = await this.getFile(organizationId, fileId);
    this.assertAccess(actorId, role, file, "manage");
    if (file.legal_hold)
      throw new ConflictException("File is protected by legal hold.");
    await this.database.transaction(async (db) => {
      await db.query(
        "UPDATE platform.private_files SET status='deleted',deleted_at=now(),deleted_by=$3,updated_at=now() WHERE id=$1 AND organization_id=$2",
        [fileId, organizationId, actorId],
      );
      await db.query(
        "UPDATE platform.storage_quotas SET used_bytes=GREATEST(0,used_bytes-(SELECT COALESCE(SUM(size_bytes),0) FROM platform.private_file_versions WHERE organization_id=$1 AND file_id=$2)),updated_at=now() WHERE organization_id=$1",
        [organizationId, fileId],
      );
      await this.audit(
        db,
        organizationId,
        fileId,
        actorId,
        "deleted",
        file.status,
        "deleted",
      );
    });
    // Deletion is logical so a later restore can safely recover the object.
    return { data: { id: fileId, status: "deleted" } };
  }

  public async restore(
    organizationId: string,
    actorId: string,
    role: FileRole,
    fileId: string,
  ) {
    const file = await this.getFile(organizationId, fileId);
    this.assertAccess(actorId, role, file, "manage");
    if (file.status !== "deleted" && file.status !== "expired")
      throw new ConflictException("File is not restorable.");
    const result = await this.database.query(
      "SELECT COALESCE(SUM(size_bytes),0) AS bytes FROM platform.private_file_versions WHERE organization_id=$1 AND file_id=$2",
      [organizationId, fileId],
    );
    await this.reserve(organizationId, Number(result.rows[0]?.bytes ?? 0));
    try {
      await this.database.transaction(async (db) => {
        await db.query(
          "UPDATE platform.private_files SET status='active',deleted_at=NULL,deleted_by=NULL,updated_at=now() WHERE id=$1 AND organization_id=$2",
          [fileId, organizationId],
        );
        await this.releaseReservation(
          db,
          organizationId,
          Number(result.rows[0]?.bytes ?? 0),
          true,
        );
        await this.audit(
          db,
          organizationId,
          fileId,
          actorId,
          "restored",
          file.status,
          "active",
        );
      });
    } catch (error) {
      await this.releaseReservation(
        this.database,
        organizationId,
        Number(result.rows[0]?.bytes ?? 0),
        false,
      ).catch(() => undefined);
      throw error;
    }
    return { data: { id: fileId, status: "active" } };
  }

  public async updateScanResult(
    organizationId: string,
    fileId: string,
    versionId: string,
    scanStatus: MalwareScanStatus,
    reason?: string,
  ) {
    await this.database.transaction(async (db) => {
      const version = await db.query(
        "UPDATE platform.private_file_versions SET scan_status=$4,scan_reason=$5,scanned_at=now() WHERE id=$1 AND file_id=$2 AND organization_id=$3 RETURNING scan_status",
        [versionId, fileId, organizationId, scanStatus, reason ?? null],
      );
      if (!version.rows[0])
        throw new NotFoundException("Private file version not found.");
      await db.query(
        "UPDATE platform.private_files SET status=$3,quarantine_reason=$4,updated_at=now() WHERE id=$1 AND organization_id=$2 AND status <> 'deleted'",
        [
          fileId,
          organizationId,
          scanStatus === "quarantined"
            ? "quarantined"
            : scanStatus === "clean"
              ? "active"
              : "quarantined",
          reason ?? null,
        ],
      );
      await this.audit(
        db,
        organizationId,
        fileId,
        null,
        "scan_updated",
        null,
        scanStatus,
      );
    });
    return { data: { fileId, versionId, scanStatus } };
  }

  public async quarantine(
    organizationId: string,
    actorId: string,
    role: FileRole,
    fileId: string,
    reason = "manual quarantine",
  ) {
    const file = await this.getFile(organizationId, fileId);
    this.assertAccess(actorId, role, file, "manage");
    await this.database.transaction(async (db: Queryable) => {
      await db.query(
        "UPDATE platform.private_files SET status='quarantined',quarantine_reason=$3,updated_at=now() WHERE id=$1 AND organization_id=$2 AND status <> 'deleted'",
        [fileId, organizationId, reason],
      );
      await this.audit(
        db,
        organizationId,
        fileId,
        actorId,
        "quarantined",
        file.status,
        "quarantined",
      );
    });
    return { data: { id: fileId, status: "quarantined" } };
  }

  public async expire(organizationId: string, fileId: string): Promise<void> {
    await this.database.transaction(async (db: Queryable) => {
      await db.query(
        "UPDATE platform.private_files SET status='expired',updated_at=now() WHERE id=$1 AND organization_id=$2 AND legal_hold=false AND status='active'",
        [fileId, organizationId],
      );
      await this.audit(
        db,
        organizationId,
        fileId,
        null,
        "expired",
        "active",
        "expired",
      );
    });
  }

  private async getFile(
    organizationId: string,
    fileId: string,
  ): Promise<FileRow> {
    const result = await this.database.query(
      "SELECT owner_id,classification,status,legal_hold FROM platform.private_files WHERE id=$1 AND organization_id=$2",
      [fileId, organizationId],
    );
    const file = result.rows[0] as FileRow | undefined;
    if (!file) throw new NotFoundException("Private file not found.");
    return file;
  }
  private assertAccess(
    actorId: string,
    role: FileRole,
    file: FileRow,
    action: "read" | "manage",
  ) {
    if (!canAccessPrivateFile(actorId, role, file, action))
      throw new ForbiddenException("You do not have access to this file.");
  }
  private async reserve(organizationId: string, bytes: number) {
    const result = await this.database.query(
      "SELECT platform.reserve_private_storage($1,$2) AS reserved",
      [organizationId, bytes],
    );
    if (result.rows[0]?.reserved !== true)
      throw new ConflictException("Storage quota exceeded or not configured.");
  }
  private async releaseReservation(
    db: Queryable,
    organizationId: string,
    bytes: number,
    commit: boolean,
  ) {
    await db.query(
      "UPDATE platform.storage_quotas SET reserved_bytes=GREATEST(0,reserved_bytes-$2),used_bytes=used_bytes+CASE WHEN $3 THEN $2 ELSE 0 END,updated_at=now() WHERE organization_id=$1",
      [organizationId, bytes, commit],
    );
  }
  private async audit(
    db: Queryable,
    organizationId: string,
    fileId: string,
    actorId: string | null,
    action: string,
    fromStatus: string | null,
    toStatus: string,
  ) {
    await db.query(
      "INSERT INTO platform.private_file_lifecycle_audits (id,organization_id,file_id,actor_id,action,from_status,to_status) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [
        `file_lifecycle_${randomUUID()}`,
        organizationId,
        fileId,
        actorId,
        action,
        fromStatus,
        toStatus,
      ],
    );
  }
}

@Injectable()
export class PrivateFilesRetentionService {
  public constructor(
    @Inject(PrivateFilesService) private readonly files: PrivateFilesService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}
  public async expireDue(now = new Date()): Promise<number> {
    const result = await this.database.query(
      "SELECT id,organization_id FROM platform.private_files WHERE retention_until <= $1 AND legal_hold=false AND status='active'",
      [now.toISOString()],
    );
    for (const row of result.rows)
      await this.files.expire(String(row.organization_id), String(row.id));
    return result.rows.length;
  }
}

function isClassification(value: string): value is Classification {
  return (
    value === "internal" || value === "confidential" || value === "restricted"
  );
}
