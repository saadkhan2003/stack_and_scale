import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { calculateSlaClock } from "@stack-and-scale/contracts";
import { PlatformDatabaseService } from "../platform-database.service.js";

const categories = new Set([
  "bug",
  "question",
  "incident",
  "request",
  "billing",
  "other",
]);
const severities = new Set(["low", "medium", "high", "critical"]);
const priorities = new Set(["low", "normal", "high", "urgent"]);
const statuses = new Set([
  "open",
  "in_progress",
  "waiting_on_client",
  "waiting_on_staff",
  "resolved",
  "closed",
]);

@Injectable()
export class SupportService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT id, customer_id, subject, category, severity, priority, owner_id, status, sla_target_seconds, first_response_at, resolved_at, created_by, created_at, updated_at FROM platform.support_tickets WHERE organization_id=$1 ORDER BY updated_at DESC LIMIT 200",
      [organizationId],
    );
    return { data: result.rows };
  }

  public async get(organizationId: string, ticketId: string) {
    const details = await this.database.query(
      "SELECT id, customer_id, subject, description, category, severity, priority, owner_id, status, sla_target_seconds, first_response_at, resolved_at, created_by, created_at, updated_at FROM platform.support_tickets WHERE id=$1 AND organization_id=$2",
      [ticketId, organizationId],
    );
    if (!details.rows[0])
      throw new NotFoundException("Support ticket not found.");
    const pauses = await this.database.query(
      "SELECT started_at, ended_at FROM platform.support_ticket_pauses WHERE ticket_id=$1 AND organization_id=$2 ORDER BY started_at",
      [ticketId, organizationId],
    );
    const row = details.rows[0];
    const pauseIntervals = pauses.rows.map((pause) => ({
      startedAt: asIso(pause.started_at),
      ...(pause.ended_at ? { endedAt: asIso(pause.ended_at) } : {}),
    }));
    const startedAt = asIso(row.created_at);
    const resolutionNow = row.resolved_at
      ? asIso(row.resolved_at)
      : new Date().toISOString();
    return {
      data: {
        ...row,
        sla: {
          resolution: calculateSlaClock({
            startedAt,
            now: resolutionNow,
            pauseIntervals,
          }),
          firstResponse: row.first_response_at
            ? calculateSlaClock({
                startedAt,
                now: asIso(row.first_response_at),
                pauseIntervals,
              })
            : null,
        },
      },
    };
  }

  public async create(
    organizationId: string,
    actorId: string,
    input: {
      subject: string;
      description: string;
      category: string;
      severity: string;
      priority: string;
      slaTargetSeconds: number;
      customerId?: string;
    },
  ) {
    if (
      !input.subject.trim() ||
      !input.description.trim() ||
      !categories.has(input.category) ||
      !severities.has(input.severity) ||
      !priorities.has(input.priority) ||
      !Number.isSafeInteger(input.slaTargetSeconds) ||
      input.slaTargetSeconds <= 0
    )
      throw new BadRequestException("Ticket fields are invalid.");
    const id = `ticket_${randomUUID()}`;
    const created = await this.database.query(
      "INSERT INTO platform.support_tickets (id,organization_id,customer_id,subject,description,category,severity,priority,sla_target_seconds,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,subject,category,severity,priority,status,sla_target_seconds,created_at",
      [
        id,
        organizationId,
        input.customerId ?? null,
        input.subject.trim(),
        input.description.trim(),
        input.category,
        input.severity,
        input.priority,
        input.slaTargetSeconds,
        actorId,
      ],
    );
    await this.event(organizationId, id, actorId, "created", {});
    return { data: created.rows[0] };
  }

  public async comment(
    organizationId: string,
    actorId: string,
    ticketId: string,
    visibility: string,
    body: string,
  ) {
    await this.requireTicket(ticketId, organizationId);
    if ((visibility !== "public" && visibility !== "internal") || !body.trim())
      throw new BadRequestException(
        "Comment visibility and body are required.",
      );
    const result = await this.database.query(
      "INSERT INTO platform.support_ticket_comments (id,organization_id,ticket_id,author_id,visibility,body) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,ticket_id,author_id,visibility,body,created_at",
      [
        `ticket_comment_${randomUUID()}`,
        organizationId,
        ticketId,
        actorId,
        visibility,
        body.trim(),
      ],
    );
    if (visibility === "public")
      await this.database.query(
        "UPDATE platform.support_tickets SET first_response_at=COALESCE(first_response_at,now()), updated_at=now() WHERE id=$1 AND organization_id=$2",
        [ticketId, organizationId],
      );
    await this.event(
      organizationId,
      ticketId,
      actorId,
      `comment.${visibility}`,
      {},
    );
    return { data: result.rows[0] };
  }

  public async update(
    organizationId: string,
    actorId: string,
    ticketId: string,
    input: { status?: string; ownerId?: string | null },
  ) {
    await this.requireTicket(ticketId, organizationId);
    if (input.status !== undefined && !statuses.has(input.status))
      throw new BadRequestException("Unsupported ticket status.");
    if (input.status === undefined && input.ownerId === undefined)
      throw new BadRequestException("A ticket change is required.");
    const result = await this.database.query(
      "UPDATE platform.support_tickets SET status=COALESCE($3,status), owner_id=CASE WHEN $4::boolean THEN $5 ELSE owner_id END, resolved_at=CASE WHEN $3 IN ('resolved','closed') THEN COALESCE(resolved_at,now()) ELSE resolved_at END, updated_at=now() WHERE id=$1 AND organization_id=$2 RETURNING id,status,owner_id,first_response_at,resolved_at,updated_at",
      [
        ticketId,
        organizationId,
        input.status ?? null,
        input.ownerId !== undefined,
        input.ownerId ?? null,
      ],
    );
    await this.event(organizationId, ticketId, actorId, "updated", input);
    return { data: result.rows[0] };
  }

  public async pause(
    organizationId: string,
    actorId: string,
    ticketId: string,
    reason: string,
    resume: boolean,
  ) {
    await this.requireTicket(ticketId, organizationId);
    if (!reason.trim())
      throw new BadRequestException("Pause reason is required.");
    if (resume)
      await this.database.query(
        "UPDATE platform.support_ticket_pauses SET ended_at=now() WHERE ticket_id=$1 AND organization_id=$2 AND ended_at IS NULL",
        [ticketId, organizationId],
      );
    else
      await this.database.query(
        "INSERT INTO platform.support_ticket_pauses (id,organization_id,ticket_id,reason,created_by) VALUES ($1,$2,$3,$4,$5)",
        [
          `ticket_pause_${randomUUID()}`,
          organizationId,
          ticketId,
          reason.trim(),
          actorId,
        ],
      );
    await this.event(
      organizationId,
      ticketId,
      actorId,
      resume ? "sla.resumed" : "sla.paused",
      { reason: reason.trim() },
    );
    return { data: { ticketId, paused: !resume } };
  }

  public async escalate(
    organizationId: string,
    actorId: string,
    ticketId: string,
    reason: string,
    priority = "urgent",
  ) {
    const ticket = await this.requireTicket(ticketId, organizationId);
    if (!priorities.has(priority) || !reason.trim())
      throw new BadRequestException(
        "Escalation priority and reason are required.",
      );
    if (ticket.priority === priority)
      throw new ConflictException("Ticket is already at that priority.");
    await this.database.query(
      "UPDATE platform.support_tickets SET priority=$3, updated_at=now() WHERE id=$1 AND organization_id=$2",
      [ticketId, organizationId, priority],
    );
    await this.database.query(
      "INSERT INTO platform.support_ticket_escalations (id,organization_id,ticket_id,from_priority,to_priority,reason,escalated_by) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [
        `ticket_escalation_${randomUUID()}`,
        organizationId,
        ticketId,
        ticket.priority,
        priority,
        reason.trim(),
        actorId,
      ],
    );
    await this.event(organizationId, ticketId, actorId, "escalated", {
      fromPriority: ticket.priority,
      toPriority: priority,
      reason: reason.trim(),
    });
    return { data: { ticketId, priority } };
  }

  public async attach(
    organizationId: string,
    actorId: string,
    ticketId: string,
    storageObjectId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.requireTicket(ticketId, organizationId);
    if (!storageObjectId.trim())
      throw new BadRequestException("storageObjectId is required.");
    const result = await this.database.query(
      "INSERT INTO platform.support_ticket_attachments (id,organization_id,ticket_id,storage_object_id,metadata,created_by) VALUES ($1,$2,$3,$4,$5::jsonb,$6) RETURNING id,ticket_id,storage_object_id,metadata,created_by,created_at",
      [
        `ticket_attachment_${randomUUID()}`,
        organizationId,
        ticketId,
        storageObjectId.trim(),
        JSON.stringify(metadata),
        actorId,
      ],
    );
    await this.event(organizationId, ticketId, actorId, "attachment.added", {
      storageObjectId: storageObjectId.trim(),
    });
    return { data: result.rows[0] };
  }

  private async requireTicket(ticketId: string, organizationId: string) {
    const result = await this.database.query(
      "SELECT id,priority FROM platform.support_tickets WHERE id=$1 AND organization_id=$2",
      [ticketId, organizationId],
    );
    if (!result.rows[0])
      throw new NotFoundException("Support ticket not found.");
    return result.rows[0] as { id: string; priority: string };
  }
  private async event(
    organizationId: string,
    ticketId: string,
    actorId: string,
    eventType: string,
    metadata: object,
  ) {
    await this.database.query(
      "INSERT INTO platform.support_ticket_events (id,organization_id,ticket_id,event_type,actor_id,metadata) VALUES ($1,$2,$3,$4,$5,$6::jsonb)",
      [
        `ticket_event_${randomUUID()}`,
        organizationId,
        ticketId,
        eventType,
        actorId,
        JSON.stringify(metadata),
      ],
    );
  }
}

function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  throw new Error("database timestamp is invalid");
}
