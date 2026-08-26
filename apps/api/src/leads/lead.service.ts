import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

export type LeadIntake = Readonly<{
  email: string;
  name: string;
  phone?: string;
  message?: string;
  intakeType: "demo" | "project" | "contact" | "whatsapp";
  attribution: Readonly<{ landingPage?: string; product?: string; service?: string; source?: string; campaign?: string; cta?: string }>;
  idempotencyKey: string;
  correlationId: string;
}>;

export type LeadReceipt = Readonly<{ id: string; status: "created" | "existing"; intakeType: LeadIntake["intakeType"] }>;

@Injectable()
export class LeadService {
  public constructor(@Inject(PlatformDatabaseService) private readonly database: PlatformDatabaseService) {}

  public async create(input: LeadIntake): Promise<LeadReceipt> {
    const leadId = `lead_${randomUUID()}`;
    const activityId = `activity_${randomUUID()}`;
    const auditId = `audit_${randomUUID()}`;
    const eventId = `event_${randomUUID()}`;
    const result = await this.database.query(
      `WITH inserted_lead AS (
        INSERT INTO platform.leads (id, email, name, phone, message, intake_type, source, idempotency_key, consent_at, attribution)
        VALUES ($1, lower($2), $3, $4, $5, $6, $7, $8, now(), $9::jsonb)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id
      ), activity AS (
        INSERT INTO platform.lead_activities (id, lead_id, type, metadata)
        SELECT $10, id, 'lead.created', jsonb_build_object('intakeType', $6) FROM inserted_lead
      ), audit AS (
        INSERT INTO platform.audit_events (id, actor_id, action, correlation_id, metadata)
        SELECT $11, 'public-lead-intake', 'crm.lead.created', $12, jsonb_build_object('leadId', id, 'intakeType', $6) FROM inserted_lead
      )
      INSERT INTO platform.outbox_events (id, event_type, correlation_id, payload)
      SELECT $13, 'crm.lead.created', $12, jsonb_build_object('leadId', id, 'intakeType', $6) FROM inserted_lead
      RETURNING payload->>'leadId' AS id`,
      [leadId, input.email, input.name, input.phone ?? null, input.message ?? null, input.intakeType, input.attribution.source ?? "public-web", input.idempotencyKey, JSON.stringify(input.attribution), activityId, auditId, input.correlationId, eventId],
    );
    const createdId = result.rows[0]?.["id"];
    if (typeof createdId === "string") return { id: createdId, status: "created", intakeType: input.intakeType };
    const existing = await this.database.query("SELECT id, intake_type FROM platform.leads WHERE idempotency_key = $1", [input.idempotencyKey]);
    const row = existing.rows[0];
    if (row === undefined) throw new Error("lead intake could not be persisted");
    return { id: String(row["id"]), status: "existing", intakeType: String(row["intake_type"]) as LeadIntake["intakeType"] };
  }
}
