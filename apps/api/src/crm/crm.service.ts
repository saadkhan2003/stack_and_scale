import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

const stages = new Set(["new", "qualified", "proposal", "won", "lost"]);

type LeadRow = Record<string, unknown>;

@Injectable()
export class CrmService {
  public constructor(@Inject(PlatformDatabaseService) private readonly database: PlatformDatabaseService) {}

  public async listLeads(): Promise<{ data: unknown[] }> {
    const result = await this.database.query(
      `SELECT id, email, name, phone, message, intake_type, source, stage, owner_id,
              probability, estimated_value, next_action_at, lost_reason, attribution, created_at
         FROM platform.leads
        ORDER BY created_at DESC
        LIMIT 200`,
    );
    return { data: (result.rows as LeadRow[]).map(toLead) };
  }

  public async getLead(leadId: string): Promise<{ data: unknown }> {
    const lead = await this.database.query(
      `SELECT id, email, name, phone, message, intake_type, source, stage, owner_id,
              probability, estimated_value, next_action_at, lost_reason, attribution, created_at
         FROM platform.leads WHERE id = $1`, [leadId],
    );
    const row = lead.rows[0] as LeadRow | undefined;
    if (!row) throw new NotFoundException("Lead not found.");
    const [activities, notes, tasks, bookings, opportunities] = await Promise.all([
      this.database.query("SELECT id, actor_id, type, metadata, created_at FROM platform.lead_activities WHERE lead_id = $1 ORDER BY created_at DESC", [leadId]),
      this.database.query("SELECT id, author_id, body, created_at FROM platform.lead_notes WHERE lead_id = $1 ORDER BY created_at DESC", [leadId]),
      this.database.query("SELECT id, assignee_id, title, due_at, completed_at, created_at FROM platform.lead_tasks WHERE lead_id = $1 ORDER BY created_at DESC", [leadId]),
      this.database.query("SELECT id, starts_at, timezone, status, alternate_request, created_at FROM platform.demo_bookings WHERE lead_id = $1 ORDER BY created_at DESC", [leadId]),
      this.database.query("SELECT o.id, o.title, o.stage, o.owner_id, o.probability, o.estimated_value, o.next_action_at, o.lost_reason, p.name AS pipeline FROM platform.opportunities o JOIN platform.crm_pipeline_templates p ON p.id = o.pipeline_template_id WHERE o.lead_id = $1", [leadId]),
    ]);
    return { data: { ...toLead(row), activities: activities.rows, notes: notes.rows, tasks: tasks.rows, bookings: bookings.rows, opportunities: opportunities.rows } };
  }

  public async updateLead(leadId: string, input: { stage?: string; ownerId?: string | null; probability?: number; estimatedValue?: number | null; nextActionAt?: string | null; lostReason?: string | null }, actorId: string, organizationId: string): Promise<{ data: unknown }> {
    if (input.stage !== undefined && !stages.has(input.stage)) throw new Error("Invalid lead stage.");
    if (input.probability !== undefined && (!Number.isInteger(input.probability) || input.probability < 0 || input.probability > 100)) throw new Error("Probability must be an integer from 0 to 100.");
    if (input.ownerId) {
      const member = await this.database.query("SELECT 1 FROM identity.memberships WHERE organization_id = $1 AND user_id = $2 AND status = 'active'", [organizationId, input.ownerId]);
      if (!member.rows[0]) throw new Error("Lead owner must be an active CRM staff member.");
    }
    const result = await this.database.query(
      `UPDATE platform.leads
          SET stage = COALESCE($2, stage), owner_id = CASE WHEN $3::boolean THEN $4 ELSE owner_id END,
              probability = COALESCE($5, probability), estimated_value = CASE WHEN $6::boolean THEN $7 ELSE estimated_value END,
              next_action_at = CASE WHEN $8::boolean THEN $9::timestamptz ELSE next_action_at END,
              lost_reason = CASE WHEN $10::boolean THEN $11 ELSE lost_reason END
        WHERE id = $1
      RETURNING id, email, name, phone, message, intake_type, source, stage, owner_id, probability, estimated_value, next_action_at, lost_reason, attribution, created_at`,
      [leadId, input.stage ?? null, input.ownerId !== undefined, input.ownerId ?? null, input.probability ?? null, input.estimatedValue !== undefined, input.estimatedValue ?? null, input.nextActionAt !== undefined, input.nextActionAt ?? null, input.lostReason !== undefined, input.lostReason ?? null],
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
      [leadId, row["stage"], row["owner_id"], row["probability"], row["estimated_value"], row["next_action_at"], row["lost_reason"]],
    );
    await this.recordActivity(leadId, actorId, "lead.updated", {});
    return { data: toLead(row) };
  }

  public async addNote(leadId: string, body: string, actorId: string): Promise<{ data: unknown }> {
    await this.assertLead(leadId);
    const result = await this.database.query("INSERT INTO platform.lead_notes (id, lead_id, author_id, body) VALUES ($1, $2, $3, $4) RETURNING id, author_id, body, created_at", [`note_${randomUUID()}`, leadId, actorId, body]);
    await this.recordActivity(leadId, actorId, "note.created", {});
    return { data: result.rows[0] };
  }

  public async createTask(leadId: string, title: string, assigneeId: string | null, dueAt: string | null, actorId: string, organizationId: string): Promise<{ data: unknown }> {
    await this.assertLead(leadId);
    if (assigneeId) {
      const member = await this.database.query("SELECT 1 FROM identity.memberships WHERE organization_id = $1 AND user_id = $2 AND status = 'active'", [organizationId, assigneeId]);
      if (!member.rows[0]) throw new Error("Task assignee must be an active CRM staff member.");
    }
    const result = await this.database.query("INSERT INTO platform.lead_tasks (id, lead_id, assignee_id, title, due_at) VALUES ($1, $2, $3, $4, $5::timestamptz) RETURNING id, assignee_id, title, due_at, completed_at, created_at", [`task_${randomUUID()}`, leadId, assigneeId, title, dueAt]);
    await this.recordActivity(leadId, actorId, "task.created", {});
    return { data: result.rows[0] };
  }

  public async completeTask(leadId: string, taskId: string, actorId: string): Promise<{ data: unknown }> {
    const result = await this.database.query("UPDATE platform.lead_tasks SET completed_at = now() WHERE id = $1 AND lead_id = $2 AND completed_at IS NULL RETURNING id, assignee_id, title, due_at, completed_at, created_at", [taskId, leadId]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Open task not found.");
    await this.recordActivity(leadId, actorId, "task.completed", {});
    return { data: row };
  }

  private async assertLead(leadId: string): Promise<void> { const result = await this.database.query("SELECT 1 FROM platform.leads WHERE id = $1", [leadId]); if (!result.rows[0]) throw new NotFoundException("Lead not found."); }
  private async recordActivity(leadId: string, actorId: string, type: string, metadata: Record<string, unknown>): Promise<void> { await this.database.query("INSERT INTO platform.lead_activities (id, lead_id, actor_id, type, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)", [`activity_${randomUUID()}`, leadId, actorId, type, JSON.stringify(metadata)]); }
}

function toLead(row: LeadRow): Record<string, unknown> {
  return { id: row["id"], email: row["email"], name: row["name"], phone: row["phone"], message: row["message"], intakeType: row["intake_type"], source: row["source"], stage: row["stage"], ownerId: row["owner_id"], probability: row["probability"], estimatedValue: row["estimated_value"], nextActionAt: row["next_action_at"], lostReason: row["lost_reason"], attribution: row["attribution"], createdAt: row["created_at"] };
}
