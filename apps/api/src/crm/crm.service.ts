import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

const stages = new Set(["new", "qualified", "proposal", "won", "lost"]);

type LeadRow = Record<string, unknown>;

export type CrmSummary = Readonly<{
  newLeads: ReadonlyArray<{
    id: string;
    name: string | null;
    email: string;
    intakeType: string;
    createdAt: unknown;
  }>;
  overdueTasks: ReadonlyArray<{
    id: string;
    leadId: string;
    title: string;
    dueAt: unknown;
    leadName: string | null;
    leadEmail: string;
  }>;
  upcomingDemos: ReadonlyArray<{
    id: string;
    leadId: string;
    startsAt: unknown;
    timezone: string;
    leadName: string | null;
    leadEmail: string;
  }>;
  stageCounts: ReadonlyArray<{ stage: string; count: number }>;
}>;

@Injectable()
export class CrmService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async listLeads(): Promise<{ data: unknown[] }> {
    const result = await this.database.query(
      `SELECT id, email, name, phone, message, intake_type, source, stage, owner_id,
              probability, estimated_value, next_action_at, lost_reason, attribution, consent_at, created_at
         FROM platform.leads
        ORDER BY created_at DESC
        LIMIT 200`,
    );
    return { data: (result.rows as LeadRow[]).map(toLead) };
  }

  public async getSummary(): Promise<{ data: CrmSummary }> {
    const [newLeads, overdueTasks, upcomingDemos, stageCounts] =
      await Promise.all([
        this.database.query(
          `SELECT id, name, email, intake_type, created_at
             FROM platform.leads
            WHERE stage = 'new'
            ORDER BY created_at DESC
            LIMIT 50`,
        ),
        this.database.query(
          `SELECT t.id, t.lead_id, t.title, t.due_at,
                  l.name AS lead_name, l.email AS lead_email
             FROM platform.lead_tasks t
             JOIN platform.leads l ON l.id = t.lead_id
            WHERE t.completed_at IS NULL
              AND t.due_at IS NOT NULL
              AND t.due_at < now()
            ORDER BY t.due_at ASC
            LIMIT 50`,
        ),
        this.database.query(
          `SELECT b.id, b.lead_id, b.starts_at, b.timezone,
                  l.name AS lead_name, l.email AS lead_email
             FROM platform.demo_bookings b
             JOIN platform.leads l ON l.id = b.lead_id
            WHERE b.status = 'confirmed'
              AND b.starts_at >= now()
              AND b.starts_at < now() + interval '14 days'
            ORDER BY b.starts_at ASC
            LIMIT 50`,
        ),
        this.database.query(
          `SELECT stage, COUNT(*)::int AS count
             FROM platform.leads
            GROUP BY stage
            ORDER BY CASE stage
              WHEN 'new' THEN 1
              WHEN 'qualified' THEN 2
              WHEN 'proposal' THEN 3
              WHEN 'won' THEN 4
              WHEN 'lost' THEN 5
              ELSE 6
            END
            LIMIT 5`,
        ),
      ]);

    return {
      data: {
        newLeads: newLeads.rows.map((row) => ({
          id: String(row["id"]),
          name: (row["name"] as string | null) ?? null,
          email: String(row["email"]),
          intakeType: String(row["intake_type"]),
          createdAt: row["created_at"],
        })),
        overdueTasks: overdueTasks.rows.map((row) => ({
          id: String(row["id"]),
          leadId: String(row["lead_id"]),
          title: String(row["title"]),
          dueAt: row["due_at"],
          leadName: (row["lead_name"] as string | null) ?? null,
          leadEmail: String(row["lead_email"]),
        })),
        upcomingDemos: upcomingDemos.rows.map((row) => ({
          id: String(row["id"]),
          leadId: String(row["lead_id"]),
          startsAt: row["starts_at"],
          timezone: String(row["timezone"]),
          leadName: (row["lead_name"] as string | null) ?? null,
          leadEmail: String(row["lead_email"]),
        })),
        stageCounts: stageCounts.rows.map((row) => ({
          stage: String(row["stage"]),
          count: Number(row["count"]),
        })),
      },
    };
  }

  public async getLead(leadId: string): Promise<{ data: unknown }> {
    const lead = await this.database.query(
      `SELECT id, email, name, phone, message, intake_type, source, stage, owner_id,
              probability, estimated_value, next_action_at, lost_reason, attribution, created_at
         FROM platform.leads WHERE id = $1`,
      [leadId],
    );
    const row = lead.rows[0] as LeadRow | undefined;
    if (!row) throw new NotFoundException("Lead not found.");
    const [activities, notes, tasks, bookings, opportunities] =
      await Promise.all([
        this.database.query(
          "SELECT id, actor_id, type, metadata, created_at FROM platform.lead_activities WHERE lead_id = $1 ORDER BY created_at DESC",
          [leadId],
        ),
        this.database.query(
          "SELECT id, author_id, body, created_at FROM platform.lead_notes WHERE lead_id = $1 ORDER BY created_at DESC",
          [leadId],
        ),
        this.database.query(
          `SELECT id, assignee_id, title, due_at, completed_at, created_at,
                  CASE WHEN completed_at IS NOT NULL THEN 'completed'
                       WHEN due_at IS NOT NULL AND due_at < now() THEN 'overdue'
                       ELSE 'open' END AS status,
                  CASE WHEN completed_at IS NULL AND due_at IS NOT NULL AND due_at < now()
                       THEN 'high' ELSE 'normal' END AS priority
             FROM platform.lead_tasks
            WHERE lead_id = $1
            ORDER BY created_at DESC`,
          [leadId],
        ),
        this.database.query(
          "SELECT id, starts_at, timezone, status, alternate_request, created_at FROM platform.demo_bookings WHERE lead_id = $1 ORDER BY created_at DESC",
          [leadId],
        ),
        this.database.query(
          "SELECT o.id, o.title, o.stage, o.owner_id, o.probability, o.estimated_value, o.next_action_at, o.lost_reason, o.created_at, o.updated_at, p.name AS pipeline FROM platform.opportunities o JOIN platform.crm_pipeline_templates p ON p.id = o.pipeline_template_id WHERE o.lead_id = $1",
          [leadId],
        ),
      ]);
    const timeline = [
      {
        id: `lead-created-${String(row["id"])}`,
        kind: "lead",
        eventType: "lead.created",
        occurredAt: toTimestamp(row["created_at"]),
        title: "Lead received",
        detail: String(row["intake_type"]),
      },
      ...activities.rows.map((item) => ({
        id: String(item["id"]),
        kind: "activity",
        eventType: String(item["type"]),
        occurredAt: toTimestamp(item["created_at"]),
        title: String(item["type"]),
        metadata: item["metadata"],
      })),
      ...notes.rows.map((item) => ({
        id: String(item["id"]),
        kind: "note",
        eventType: "note.created",
        occurredAt: toTimestamp(item["created_at"]),
        title: "Note",
        detail: String(item["body"]),
      })),
      ...tasks.rows.map((item) => ({
        id: String(item["id"]),
        kind: "task",
        eventType: `task.${String(item["status"])}`,
        occurredAt: toTimestamp(item["created_at"]),
        title: String(item["title"]),
        detail: item["due_at"] ?? null,
        status: String(item["status"]),
      })),
      ...bookings.rows.map((item) => ({
        id: String(item["id"]),
        kind: "booking",
        eventType: `booking.${String(item["status"])}`,
        occurredAt: toTimestamp(item["created_at"]),
        title: "Demo booking",
        detail: item["starts_at"],
        status: String(item["status"]),
      })),
      ...opportunities.rows.map((item) => ({
        id: String(item["id"]),
        kind: "opportunity",
        eventType: `opportunity.${String(item["stage"])}`,
        occurredAt: toTimestamp(item["updated_at"] ?? item["created_at"]),
        title: String(item["title"]),
        detail: String(item["stage"]),
        status: String(item["stage"]),
      })),
    ].sort((left, right) => {
      return (
        Date.parse(String(right.occurredAt)) -
        Date.parse(String(left.occurredAt))
      );
    });
    return {
      data: {
        ...toLead(row),
        activities: activities.rows,
        notes: notes.rows,
        tasks: tasks.rows.map(toTask),
        bookings: bookings.rows,
        opportunities: opportunities.rows,
        timeline,
      },
    };
  }

  public async updateLead(
    leadId: string,
    input: {
      stage?: string;
      ownerId?: string | null;
      probability?: number;
      estimatedValue?: number | null;
      nextActionAt?: string | null;
      lostReason?: string | null;
    },
    actorId: string,
    organizationId: string,
  ): Promise<{ data: unknown }> {
    if (input.stage !== undefined && !stages.has(input.stage))
      throw new Error("Invalid lead stage.");
    if (
      input.probability !== undefined &&
      (!Number.isInteger(input.probability) ||
        input.probability < 0 ||
        input.probability > 100)
    )
      throw new Error("Probability must be an integer from 0 to 100.");
    if (input.ownerId) {
      const member = await this.database.query(
        "SELECT 1 FROM identity.memberships WHERE organization_id = $1 AND user_id = $2 AND status = 'active'",
        [organizationId, input.ownerId],
      );
      if (!member.rows[0])
        throw new Error("Lead owner must be an active CRM staff member.");
    }
    const result = await this.database.query(
      `UPDATE platform.leads
          SET stage = COALESCE($2, stage), owner_id = CASE WHEN $3::boolean THEN $4 ELSE owner_id END,
              probability = COALESCE($5, probability), estimated_value = CASE WHEN $6::boolean THEN $7 ELSE estimated_value END,
              next_action_at = CASE WHEN $8::boolean THEN $9::timestamptz ELSE next_action_at END,
              lost_reason = CASE WHEN $10::boolean THEN $11 ELSE lost_reason END
        WHERE id = $1
      RETURNING id, email, name, phone, message, intake_type, source, stage, owner_id, probability, estimated_value, next_action_at, lost_reason, attribution, consent_at, created_at`,
      [
        leadId,
        input.stage ?? null,
        input.ownerId !== undefined,
        input.ownerId ?? null,
        input.probability ?? null,
        input.estimatedValue !== undefined,
        input.estimatedValue ?? null,
        input.nextActionAt !== undefined,
        input.nextActionAt ?? null,
        input.lostReason !== undefined,
        input.lostReason ?? null,
      ],
    );
    const row = result.rows[0] as LeadRow | undefined;
    if (!row) throw new NotFoundException("Lead not found.");
    await this.database.query(
      `INSERT INTO platform.opportunities (id, lead_id, pipeline_template_id, title)
       VALUES ($1, $2,
         CASE $3 WHEN 'demo' THEN 'pipeline-product-demo' WHEN 'project' THEN 'pipeline-custom-project' WHEN 'whatsapp' THEN 'pipeline-whatsapp' ELSE 'pipeline-general-contact' END,
         COALESCE($4, 'Lead') || ' opportunity')
       ON CONFLICT (lead_id) DO NOTHING`,
      [`opportunity_${leadId}`, leadId, row["intake_type"], row["name"]],
    );
    await this.database.query(
      `UPDATE platform.opportunities
          SET stage = $2, owner_id = $3, probability = $4, estimated_value = $5,
              next_action_at = $6, lost_reason = $7, updated_at = now()
        WHERE lead_id = $1`,
      [
        leadId,
        row["stage"],
        row["owner_id"],
        row["probability"],
        row["estimated_value"],
        row["next_action_at"],
        row["lost_reason"],
      ],
    );
    await this.recordActivity(leadId, actorId, "lead.updated", {});
    return { data: toLead(row) };
  }

  public async addNote(
    leadId: string,
    body: string,
    actorId: string,
  ): Promise<{ data: unknown }> {
    await this.assertLead(leadId);
    const result = await this.database.query(
      "INSERT INTO platform.lead_notes (id, lead_id, author_id, body) VALUES ($1, $2, $3, $4) RETURNING id, author_id, body, created_at",
      [`note_${randomUUID()}`, leadId, actorId, body],
    );
    await this.recordActivity(leadId, actorId, "note.created", {});
    return { data: result.rows[0] };
  }

  public async createTask(
    leadId: string,
    title: string,
    assigneeId: string | null,
    dueAt: string | null,
    actorId: string,
    organizationId: string,
  ): Promise<{ data: unknown }> {
    await this.assertLead(leadId);
    if (assigneeId) {
      const member = await this.database.query(
        "SELECT 1 FROM identity.memberships WHERE organization_id = $1 AND user_id = $2 AND status = 'active'",
        [organizationId, assigneeId],
      );
      if (!member.rows[0])
        throw new Error("Task assignee must be an active CRM staff member.");
    }
    const result = await this.database.query(
      `INSERT INTO platform.lead_tasks (id, lead_id, assignee_id, title, due_at)
       VALUES ($1, $2, $3, $4, $5::timestamptz)
       RETURNING id, assignee_id, title, due_at, completed_at, created_at,
                 'open' AS status, 'normal' AS priority`,
      [`task_${randomUUID()}`, leadId, assigneeId, title, dueAt],
    );
    await this.recordActivity(leadId, actorId, "task.created", {});
    return { data: toTask(result.rows[0] as LeadRow) };
  }

  public async completeTask(
    leadId: string,
    taskId: string,
    actorId: string,
  ): Promise<{ data: unknown }> {
    const result = await this.database.query(
      `UPDATE platform.lead_tasks
          SET completed_at = now()
        WHERE id = $1 AND lead_id = $2 AND completed_at IS NULL
        RETURNING id, assignee_id, title, due_at, completed_at, created_at,
                  'completed' AS status, 'normal' AS priority`,
      [taskId, leadId],
    );
    const row = result.rows[0] as LeadRow | undefined;
    if (!row) throw new NotFoundException("Open task not found.");
    await this.recordActivity(leadId, actorId, "task.completed", {});
    return { data: toTask(row) };
  }

  private async assertLead(leadId: string): Promise<void> {
    const result = await this.database.query(
      "SELECT 1 FROM platform.leads WHERE id = $1",
      [leadId],
    );
    if (!result.rows[0]) throw new NotFoundException("Lead not found.");
  }
  private async recordActivity(
    leadId: string,
    actorId: string,
    type: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.database.query(
      "INSERT INTO platform.lead_activities (id, lead_id, actor_id, type, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)",
      [
        `activity_${randomUUID()}`,
        leadId,
        actorId,
        type,
        JSON.stringify(metadata),
      ],
    );
  }
}

function toLead(row: LeadRow): Record<string, unknown> {
  return {
    id: row["id"],
    email: row["email"],
    name: row["name"],
    phone: row["phone"],
    message: row["message"],
    intakeType: row["intake_type"],
    source: row["source"],
    stage: row["stage"],
    ownerId: row["owner_id"],
    probability: row["probability"],
    estimatedValue: row["estimated_value"],
    nextActionAt: row["next_action_at"],
    lostReason: row["lost_reason"],
    attribution: row["attribution"],
    consentAt: row["consent_at"] ?? null,
    createdAt: row["created_at"],
  };
}

function toTask(row: LeadRow): Record<string, unknown> {
  const completed =
    row["completed_at"] !== null && row["completed_at"] !== undefined;
  const databaseStatus = row["status"];
  const status =
    databaseStatus === "completed" ||
    databaseStatus === "overdue" ||
    databaseStatus === "open"
      ? databaseStatus
      : completed
        ? "completed"
        : "open";
  const overdue = status === "overdue";
  const databasePriority = row["priority"];
  return {
    ...row,
    status,
    priority:
      databasePriority === "high" || databasePriority === "normal"
        ? databasePriority
        : overdue
          ? "high"
          : "normal",
    isOverdue: overdue,
  };
}

function toTimestamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  throw new Error("CRM timeline record has no valid timestamp.");
}
