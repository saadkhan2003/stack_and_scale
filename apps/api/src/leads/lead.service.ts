import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

export type LeadIntake = Readonly<{
  email: string;
  name: string;
  phone?: string;
  message?: string;
  intakeType: "demo" | "project" | "contact" | "whatsapp";
  attribution: Readonly<{
    landingPage?: string;
    product?: string;
    service?: string;
    source?: string;
    campaign?: string;
    cta?: string;
  }>;
  idempotencyKey: string;
  correlationId: string;
}>;

export type LeadReceipt = Readonly<{
  id: string;
  status: "created" | "existing";
  intakeType: LeadIntake["intakeType"];
}>;
export type BookingReceipt = Readonly<{
  id: string;
  status: "confirmed" | "alternate_requested";
  startsAt?: string;
}>;

@Injectable()
export class LeadService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

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
      ), opportunity AS (
        INSERT INTO platform.opportunities (id, lead_id, pipeline_template_id, title)
        SELECT $14, id,
          CASE $6 WHEN 'demo' THEN 'pipeline-product-demo' WHEN 'project' THEN 'pipeline-custom-project' WHEN 'whatsapp' THEN 'pipeline-whatsapp' ELSE 'pipeline-general-contact' END,
          $3 || ' opportunity'
        FROM inserted_lead
      ), audit AS (
        INSERT INTO platform.audit_events (id, actor_id, action, correlation_id, metadata)
        SELECT $11, 'public-lead-intake', 'crm.lead.created', $12, jsonb_build_object('leadId', id, 'intakeType', $6) FROM inserted_lead
      )
      INSERT INTO platform.outbox_events (id, event_type, correlation_id, payload)
      SELECT $13, 'crm.lead.created', $12, jsonb_build_object('leadId', id, 'intakeType', $6) FROM inserted_lead
      RETURNING payload->>'leadId' AS id`,
      [
        leadId,
        input.email,
        input.name,
        input.phone ?? null,
        input.message ?? null,
        input.intakeType,
        input.attribution.source ?? "public-web",
        input.idempotencyKey,
        JSON.stringify(input.attribution),
        activityId,
        auditId,
        input.correlationId,
        eventId,
        `opportunity_${leadId}`,
      ],
    );
    const createdId = result.rows[0]?.["id"];
    if (typeof createdId === "string")
      return { id: createdId, status: "created", intakeType: input.intakeType };
    const existing = await this.database.query(
      "SELECT id, intake_type FROM platform.leads WHERE idempotency_key = $1",
      [input.idempotencyKey],
    );
    const row = existing.rows[0];
    if (row === undefined)
      throw new Error("lead intake could not be persisted");
    return {
      id: String(row["id"]),
      status: "existing",
      intakeType: String(row["intake_type"]) as LeadIntake["intakeType"],
    };
  }

  public async book(
    leadId: string,
    input: Readonly<{
      startsAt?: string;
      timezone: string;
      alternateRequest?: string;
      correlationId: string;
    }>,
  ): Promise<BookingReceipt> {
    const bookingId = `booking_${randomUUID()}`;
    if (input.alternateRequest) {
      await this.database.query(
        "INSERT INTO platform.demo_bookings (id, lead_id, starts_at, timezone, status, alternate_request) VALUES ($1, $2, now(), $3, 'alternate_requested', $4)",
        [bookingId, leadId, input.timezone, input.alternateRequest],
      );
      return { id: bookingId, status: "alternate_requested" };
    }
    if (!input.startsAt)
      throw new Error("A start time or alternate request is required.");
    if (!this.availableSlots().includes(input.startsAt))
      throw new Error("That demo time is not currently available.");
    const result = await this.database.query(
      "INSERT INTO platform.demo_bookings (id, lead_id, starts_at, timezone) VALUES ($1, $2, $3::timestamptz, $4) RETURNING starts_at",
      [bookingId, leadId, input.startsAt, input.timezone],
    );
    await this.database.query(
      "INSERT INTO platform.lead_activities (id, lead_id, type, metadata) VALUES ($1, $2, 'booking.confirmed', jsonb_build_object('bookingId', $3::text))",
      [`activity_${randomUUID()}`, leadId, bookingId],
    );
    await this.database.query(
      "INSERT INTO platform.outbox_events (id, event_type, correlation_id, payload) VALUES ($1, 'crm.booking.confirmed', $2, jsonb_build_object('bookingId', $3::text, 'leadId', $4::text))",
      [`event_${randomUUID()}`, input.correlationId, bookingId, leadId],
    );
    const returnedStart = result.rows[0]?.["starts_at"];
    const startsAt =
      returnedStart instanceof Date
        ? returnedStart.toISOString()
        : typeof returnedStart === "string"
          ? returnedStart
          : input.startsAt;
    return {
      id: bookingId,
      status: "confirmed",
      ...(startsAt ? { startsAt } : {}),
    };
  }

  public async listAvailableSlots(): Promise<{ data: string[] }> {
    const slots = this.availableSlots();
    if (slots.length === 0) return { data: [] };
    const booked = await this.database.query(
      "SELECT starts_at FROM platform.demo_bookings WHERE status = 'confirmed' AND starts_at = ANY($1::timestamptz[])",
      [slots],
    );
    const occupied = new Set(
      booked.rows.map((row) =>
        row["starts_at"] instanceof Date
          ? row["starts_at"].toISOString()
          : String(row["starts_at"]),
      ),
    );
    return { data: slots.filter((slot) => !occupied.has(slot)) };
  }

  public async recordWhatsappHandoff(
    leadId: string,
    correlationId: string,
  ): Promise<void> {
    await this.database.query(
      "INSERT INTO platform.lead_activities (id, lead_id, type, metadata) VALUES ($1, $2, 'whatsapp.handoff', '{}'::jsonb)",
      [`activity_${randomUUID()}`, leadId],
    );
    await this.database.query(
      "INSERT INTO platform.outbox_events (id, event_type, correlation_id, payload) VALUES ($1, 'crm.whatsapp.handoff', $2, jsonb_build_object('leadId', $3::text))",
      [`event_${randomUUID()}`, correlationId, leadId],
    );
  }

  private availableSlots(): string[] {
    return (process.env["DEMO_AVAILABLE_SLOTS"] ?? "")
      .split(",")
      .map((slot) => slot.trim())
      .filter(
        (slot) =>
          !Number.isNaN(Date.parse(slot)) &&
          new Date(slot).getTime() > Date.now(),
      )
      .map((slot) => new Date(slot).toISOString());
  }
}
