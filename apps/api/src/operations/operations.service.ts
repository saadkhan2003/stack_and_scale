import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { readdir, readFile, statfs } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { NotificationsService } from "../notifications/notifications.service.js";

type ApprovalDecision = "approved" | "rejected";
type ApprovalLifecycleEvent =
  | "requested"
  | ApprovalDecision
  | "expired"
  | "reminded"
  | "escalated";

const approvalPolicies = new Set([
  "discount",
  "proposal",
  "refund",
  "destructive_change",
  "permission_change",
  "api_credential",
  "license_override",
  "invoice_writeoff",
  "contract_exception",
  "provisioning",
]);

@Injectable()
export class ApprovalService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  public async list(organizationId: string) {
    await this.processLifecycle(organizationId, "staff-approval-list");
    const result = await this.database.query(
      `SELECT id, requester_id, approver_id, resource_type, resource_id,
              decision, reason, expires_at, decided_at, created_at
         FROM platform.approval_requests
        WHERE organization_id = $1
        ORDER BY created_at DESC LIMIT 100`,
      [organizationId],
    );
    return {
      data: result.rows.map((row) => ({
        ...row,
        decision:
          row["decision"] === "pending" &&
          new Date(String(row["expires_at"])).getTime() <= Date.now()
            ? "expired"
            : row["decision"],
      })),
    };
  }

  public async request(
    organizationId: string,
    requesterId: string,
    input: {
      resourceType: string;
      resourceId: string;
      reason: string;
      expiresAt: string;
    },
    correlationId: string,
  ) {
    if (!approvalPolicies.has(input.resourceType)) {
      throw new ConflictException(
        "This action is not covered by approval policy.",
      );
    }
    const id = `approval_${randomUUID()}`;
    const expiresAt = new Date(input.expiresAt);
    const remainingMs = Math.max(
      60 * 60 * 1000,
      expiresAt.getTime() - Date.now(),
    );
    const reminderAt = new Date(
      Date.now() + Math.min(24 * 60 * 60 * 1000, remainingMs / 2),
    );
    const escalationAt = new Date(
      Math.max(Date.now(), expiresAt.getTime() - 60 * 60 * 1000),
    );
    const created = await this.database.query(
      `INSERT INTO platform.approval_requests
        (id, organization_id, requester_id, resource_type, resource_id, reason,
         expires_at, reminder_at, escalation_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz, $9::timestamptz)
       RETURNING id, requester_id, resource_type, resource_id, decision, reason,
                 expires_at, reminder_at, escalation_at, created_at`,
      [
        id,
        organizationId,
        requesterId,
        input.resourceType,
        input.resourceId,
        input.reason,
        expiresAt,
        reminderAt,
        escalationAt,
      ],
    );
    await this.recordTrail(
      id,
      organizationId,
      requesterId,
      "requested",
      input.reason,
      correlationId,
    );
    return { data: created.rows[0] };
  }

  public async decide(
    organizationId: string,
    approvalId: string,
    approverId: string,
    decision: ApprovalDecision,
    reason: string,
    correlationId: string,
  ) {
    await this.processLifecycle(organizationId, correlationId);
    const current = await this.database.query(
      `SELECT requester_id, decision, expires_at FROM platform.approval_requests
        WHERE id = $1 AND organization_id = $2`,
      [approvalId, organizationId],
    );
    const row = current.rows[0] as
      | { requester_id: string; decision: string; expires_at: Date | string }
      | undefined;
    if (!row) throw new NotFoundException("Approval request not found.");
    if (row.requester_id === approverId)
      throw new ConflictException("Approval requires separation of duties.");
    if (
      row.decision !== "pending" ||
      new Date(row.expires_at).getTime() <= Date.now()
    ) {
      throw new ConflictException("Approval request is no longer actionable.");
    }
    const updated = await this.database.query(
      `UPDATE platform.approval_requests
          SET decision = $3, approver_id = $4, decided_at = now(), updated_at = now()
        WHERE id = $1 AND organization_id = $2 AND decision = 'pending'
        RETURNING id, requester_id, approver_id, resource_type, resource_id, decision, reason, expires_at, decided_at`,
      [approvalId, organizationId, decision, approverId],
    );
    await this.recordTrail(
      approvalId,
      organizationId,
      approverId,
      decision,
      reason,
      correlationId,
    );
    return { data: updated.rows[0] };
  }

  public async processLifecycle(organizationId: string, correlationId: string) {
    const expired = await this.database.query(
      `UPDATE platform.approval_requests
          SET decision = 'expired', updated_at = now()
        WHERE organization_id = $1 AND decision = 'pending' AND expires_at <= now()
        RETURNING id, requester_id`,
      [organizationId],
    );
    for (const row of expired.rows) {
      await this.recordTrail(
        String(row["id"]),
        organizationId,
        "approval-lifecycle",
        "expired",
        "Approval expired without a decision.",
        correlationId,
      );
    }

    const dueReminder = await this.database.query(
      `UPDATE platform.approval_requests
          SET reminded_at = now(), updated_at = now()
        WHERE organization_id = $1 AND decision = 'pending'
          AND reminder_at <= now() AND reminded_at IS NULL
        RETURNING id, resource_type, resource_id`,
      [organizationId],
    );
    for (const row of dueReminder.rows) {
      await this.notifyApprovers(
        organizationId,
        String(row["id"]),
        String(row["resource_type"]),
        String(row["resource_id"]),
        "reminded",
        correlationId,
      );
    }

    const dueEscalation = await this.database.query(
      `UPDATE platform.approval_requests
          SET escalated_at = now(), updated_at = now()
        WHERE organization_id = $1 AND decision = 'pending'
          AND escalation_at <= now() AND escalated_at IS NULL
        RETURNING id, resource_type, resource_id`,
      [organizationId],
    );
    for (const row of dueEscalation.rows) {
      await this.notifyApprovers(
        organizationId,
        String(row["id"]),
        String(row["resource_type"]),
        String(row["resource_id"]),
        "escalated",
        correlationId,
      );
    }
  }

  private async notifyApprovers(
    organizationId: string,
    approvalId: string,
    resourceType: string,
    resourceId: string,
    event: "reminded" | "escalated",
    correlationId: string,
  ) {
    const recipients = await this.database.query(
      `SELECT user_id FROM identity.memberships
        WHERE organization_id = $1 AND status = 'active'
          AND role = ANY($2::text[])`,
      [
        organizationId,
        event === "escalated"
          ? ["owner", "admin"]
          : ["owner", "admin", "manager"],
      ],
    );
    for (const recipient of recipients.rows) {
      const recipientId = String(recipient["user_id"]);
      await this.notifications.create(
        organizationId,
        "approval-lifecycle",
        correlationId,
        {
          recipientId,
          category: "operations",
          urgency: event === "escalated" ? "high" : "normal",
          title:
            event === "escalated" ? "Approval escalated" : "Approval reminder",
          body: `${resourceType} ${resourceId} requires an approval decision.`,
          deepLink: `/staff/operations?approval=${encodeURIComponent(approvalId)}`,
          dedupeKey: `approval-${event}-${approvalId}`,
        },
      );
    }
    await this.recordTrail(
      approvalId,
      organizationId,
      "approval-lifecycle",
      event,
      `${event === "escalated" ? "Approval escalated" : "Approval reminder sent"}.`,
      correlationId,
    );
  }

  private async recordTrail(
    approvalId: string,
    organizationId: string,
    actorId: string,
    event: ApprovalLifecycleEvent,
    reason: string,
    correlationId: string,
  ) {
    await this.database.query(
      `INSERT INTO platform.approval_audit_trail (id, approval_id, organization_id, actor_id, event, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `approval_audit_${randomUUID()}`,
        approvalId,
        organizationId,
        actorId,
        event,
        reason,
      ],
    );
    await this.database.query(
      `INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata)
       VALUES ($1, $2, $3, $4, $5, jsonb_build_object('approvalId', $6::text, 'event', $7::text))`,
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        `staff.approval.${event}`,
        correlationId,
        approvalId,
        event,
      ],
    );
  }
}

@Injectable()
export class OperationsSearchService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async search(organizationId: string, query: string) {
    const pattern = `%${query}%`;
    const result = await this.database.query(
      `SELECT * FROM (
         SELECT 'lead' AS resource_type, l.id, COALESCE(l.name, 'Unnamed lead') AS title,
                NULL::text AS excerpt, l.created_at
           FROM platform.leads l
          WHERE l.organization_id = $1 AND (l.name ILIKE $2 OR l.email ILIKE $2)
         UNION ALL
         SELECT 'task', t.id, t.title, NULL::text, t.created_at
           FROM platform.lead_tasks t JOIN platform.leads l ON l.id = t.lead_id
          WHERE l.organization_id = $1 AND t.title ILIKE $2
         UNION ALL
         SELECT d.resource_type, d.id, d.title,
                left(regexp_replace(d.body, '[[:space:]]+', ' ', 'g'), 160), d.created_at
           FROM platform.operations_search_documents d
          WHERE d.organization_id = $1 AND to_tsvector('simple', d.title || ' ' || d.body) @@ plainto_tsquery('simple', $3)
       ) matches ORDER BY created_at DESC LIMIT 25`,
      [organizationId, pattern, query],
    );
    return { data: result.rows };
  }
}

export type ReleaseVisibility = Readonly<{
  environment: string;
  deployedVersion: string;
  migrationVersion: string;
  health: Readonly<{
    status: "healthy" | "degraded";
    application: "up";
    database: "up" | "down";
    migrations: "up" | "missing" | "down";
    outbox: "up" | "missing" | "down";
    privacy: "up" | "missing" | "down";
  }>;
  deploymentHistory: ReadonlyArray<
    Readonly<{
      environment: string;
      imageTag: string;
      schemaVersion: string;
    }>
  >;
  rollback: Readonly<{
    status: "available" | "unavailable";
    targetVersion: string | null;
    policy: "forward-only-migrations";
  }>;
}>;

type DeploymentRecord = {
  environment?: unknown;
  imageTag?: unknown;
  schemaVersion?: unknown;
};

@Injectable()
export class ReleaseVisibilityService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async snapshot(): Promise<ReleaseVisibility> {
    const directory =
      process.env["DEPLOYMENTS_DIR"]?.trim() ||
      "/opt/stack-and-scale/deployments";
    const records = await this.readRecords(directory);
    const current = records.find(
      (record) => record.file === "current.json",
    )?.value;
    const history = records
      .filter((record) => record.file !== "current.json")
      .map(({ value }) => value)
      .slice(0, 25);
    const readiness = await this.database.readiness().catch(() => null);
    const currentVersion = stringValue(current?.imageTag) ?? "unknown";
    const migrationVersion = stringValue(current?.schemaVersion) ?? "unknown";
    const deploymentHistory = history.map((record) =>
      this.publicRecord(record),
    );
    const targetVersion =
      deploymentHistory.find((record) => record.imageTag !== currentVersion)
        ?.imageTag ?? null;

    return {
      environment:
        process.env["APP_ENV"]?.trim() ||
        process.env["NODE_ENV"]?.trim() ||
        stringValue(current?.environment) ||
        "unknown",
      deployedVersion: currentVersion,
      migrationVersion,
      health: {
        status: readiness?.status === "ready" ? "healthy" : "degraded",
        application: "up",
        database: readiness?.status === "ready" ? "up" : "down",
        migrations: readiness?.checks.migrations ?? "down",
        outbox: readiness?.checks.outbox ?? "down",
        privacy: readiness?.checks.privacy ?? "down",
      },
      deploymentHistory,
      rollback: {
        status: targetVersion === null ? "unavailable" : "available",
        targetVersion,
        policy: "forward-only-migrations",
      },
    };
  }

  private async readRecords(directory: string) {
    try {
      const files = (await readdir(directory, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .slice(0, 26);
      const records = await Promise.all(
        files.map(async (entry) => {
          try {
            const raw = JSON.parse(
              await readFile(path.join(directory, entry.name), "utf8"),
            ) as DeploymentRecord;
            return { file: entry.name, value: raw };
          } catch {
            return null;
          }
        }),
      );
      return records
        .filter(
          (record): record is { file: string; value: DeploymentRecord } =>
            record !== null,
        )
        .sort((left, right) => right.file.localeCompare(left.file));
    } catch {
      return [];
    }
  }

  private publicRecord(record: DeploymentRecord) {
    return {
      environment: stringValue(record.environment) ?? "unknown",
      imageTag: stringValue(record.imageTag) ?? "unknown",
      schemaVersion: stringValue(record.schemaVersion) ?? "unknown",
    };
  }
}

export type CapacitySnapshot = Readonly<{
  capturedAt: string;
  environment: string;
  metrics: Readonly<{
    cpu: CapacityMetric;
    memory: CapacityMetric;
    disk: CapacityMetric;
    connections: CapacityMetric;
  }>;
  retention: Readonly<{
    metricsDays: number;
    logsDays: number;
    traces: "disabled-unless-measured";
  }>;
  degradationControls: readonly string[];
  nextTopology: string;
}>;

type CapacityMetric = Readonly<{
  current: number;
  projected: number;
  limit: number;
  unit: string;
  utilizationPercent: number;
}>;

@Injectable()
export class CapacitySnapshotService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async snapshot(): Promise<CapacitySnapshot> {
    const cpuLimit = Number(process.env["CAPACITY_CPU_LIMIT"] ?? 100);
    const memoryLimit = Number(
      process.env["CAPACITY_MEMORY_LIMIT_BYTES"] ?? 8 * 1024 ** 3,
    );
    const diskLimit = Number(
      process.env["CAPACITY_DISK_LIMIT_BYTES"] ?? 75 * 1024 ** 3,
    );
    const connectionLimit = await this.connectionLimit();
    const cpu = Math.min(
      100,
      Math.max(
        0,
        ((os.loadavg()[0] ?? 0) / Math.max(1, os.cpus().length)) * 100,
      ),
    );
    const memory = Math.max(0, os.totalmem() - os.freemem());
    const filesystem = await statfs(
      process.env["CAPACITY_DISK_PATH"]?.trim() || "/",
    ).catch(() => null);
    const disk =
      filesystem === null
        ? 0
        : Math.max(
            0,
            Number(filesystem.blocks - filesystem.bfree) *
              Number(filesystem.bsize),
          );
    const connections = await this.connectionCount();

    return {
      capturedAt: new Date().toISOString(),
      environment:
        process.env["APP_ENV"]?.trim() ||
        process.env["NODE_ENV"]?.trim() ||
        "unknown",
      metrics: {
        cpu: metric(cpu, cpuLimit, "percent", 100),
        memory: metric(memory, memoryLimit, "bytes"),
        disk: metric(disk, diskLimit, "bytes"),
        connections: metric(connections, connectionLimit, "connections"),
      },
      retention: {
        metricsDays: 14,
        logsDays: 7,
        traces: "disabled-unless-measured",
      },
      degradationControls: [
        "Disable optional staff widgets and indexing first.",
        "Throttle reports and noncritical jobs before core workflows.",
        "Reduce traces, then logs/metrics retention if core services are affected.",
      ],
      nextTopology:
        "Add a separate application/database node when CPU or memory remains above 70% under representative load.",
    };
  }

  private async connectionCount(): Promise<number> {
    try {
      const result = await this.database.query(
        "SELECT count(*)::integer AS count FROM pg_stat_activity",
      );
      return boundedNumber(result.rows[0]?.["count"]);
    } catch {
      return 0;
    }
  }

  private async connectionLimit(): Promise<number> {
    try {
      const result = await this.database.query(
        "SELECT setting::integer AS value FROM pg_settings WHERE name = 'max_connections'",
      );
      return Math.max(1, boundedNumber(result.rows[0]?.["value"]) || 100);
    } catch {
      return 100;
    }
  }
}

function metric(
  current: number,
  limit: number,
  unit: string,
  cap?: number,
): CapacityMetric {
  const boundedCurrent = Math.max(0, Math.min(cap ?? limit, current));
  return {
    current: boundedCurrent,
    projected: Math.min(limit, boundedCurrent * 2),
    limit,
    unit,
    utilizationPercent: Math.round((boundedCurrent / Math.max(1, limit)) * 100),
  };
}

function boundedNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 && value.length <= 128
    ? value
    : undefined;
}
