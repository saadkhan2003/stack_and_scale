import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

type ApprovalDecision = "approved" | "rejected";

@Injectable()
export class ApprovalService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string) {
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
    const id = `approval_${randomUUID()}`;
    const created = await this.database.query(
      `INSERT INTO platform.approval_requests
        (id, organization_id, requester_id, resource_type, resource_id, reason, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
       RETURNING id, requester_id, resource_type, resource_id, decision, reason, expires_at, created_at`,
      [
        id,
        organizationId,
        requesterId,
        input.resourceType,
        input.resourceId,
        input.reason,
        input.expiresAt,
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

  private async recordTrail(
    approvalId: string,
    organizationId: string,
    actorId: string,
    event: "requested" | ApprovalDecision,
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
