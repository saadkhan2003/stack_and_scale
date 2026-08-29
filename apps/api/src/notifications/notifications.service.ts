import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

export const notificationCategories = [
  "security",
  "crm",
  "operations",
  "billing",
  "system",
] as const;
export const notificationUrgencies = [
  "low",
  "normal",
  "high",
  "critical",
] as const;
export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationUrgency = (typeof notificationUrgencies)[number];

export type CreateNotificationInput = Readonly<{
  recipientId: string;
  category: NotificationCategory;
  urgency: NotificationUrgency;
  title: string;
  body: string;
  deepLink: string;
  dedupeKey: string;
}>;

@Injectable()
export class NotificationsService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(organizationId: string, recipientId: string) {
    const result = await this.database.query(
      `SELECT id, category, urgency, title, body, deep_link, read_at,
              delivery_state, created_at
         FROM platform.notifications
        WHERE organization_id = $1 AND recipient_id = $2
        ORDER BY created_at DESC LIMIT 100`,
      [organizationId, recipientId],
    );
    return {
      data: result.rows.map((row) => ({
        id: String(row["id"]),
        category: String(row["category"]),
        urgency: String(row["urgency"]),
        title: String(row["title"]),
        body: String(row["body"]),
        deepLink: String(row["deep_link"]),
        readAt: toTimestamp(row["read_at"]),
        deliveryState: String(row["delivery_state"]),
        createdAt: String(row["created_at"]),
      })),
    };
  }

  public async create(
    organizationId: string,
    actorId: string,
    correlationId: string,
    input: CreateNotificationInput,
  ) {
    const id = `notification_${randomUUID()}`;
    const critical =
      input.category === "security" || input.urgency === "critical";
    const preference = await this.database.query(
      `SELECT enabled FROM platform.notification_preferences
        WHERE organization_id = $1 AND recipient_id = $2 AND category = $3`,
      [organizationId, input.recipientId, input.category],
    );
    const enabled = preference.rows[0]?.["enabled"] !== false;
    const deliveryState = critical || enabled ? "queued" : "not_requested";
    const created = await this.database.query(
      `INSERT INTO platform.notifications
        (id, organization_id, recipient_id, category, urgency, title, body,
         deep_link, dedupe_key, delivery_state)
       SELECT $1, $2, m.user_id, $3, $4, $5, $6, $7, $8, $9
         FROM identity.memberships m
        WHERE m.user_id = $10 AND m.organization_id = $2 AND m.status = 'active'
       ON CONFLICT (organization_id, recipient_id, dedupe_key)
       DO UPDATE SET dedupe_key = EXCLUDED.dedupe_key
       RETURNING id, category, urgency, title, body, deep_link, read_at,
                 delivery_state, created_at`,
      [
        id,
        organizationId,
        input.category,
        input.urgency,
        input.title,
        input.body,
        input.deepLink,
        input.dedupeKey,
        deliveryState,
        input.recipientId,
      ],
    );
    const row = created.rows[0];
    if (row === undefined) throw new NotFoundException("Recipient not found.");
    if (String(row["delivery_state"]) === "queued") {
      const existingEvent = await this.database.query(
        "SELECT 1 FROM platform.outbox_events WHERE event_type = 'notification.email' AND payload->>'notificationId' = $1 LIMIT 1",
        [String(row["id"])],
      );
      if (existingEvent.rows[0] !== undefined)
        return { data: normalizeRow(row) };
      await this.database.query(
        `INSERT INTO platform.outbox_events
          (id, event_type, organization_id, correlation_id, payload)
         VALUES ($1, 'notification.email', $2, $3, $4::jsonb)`,
        [
          `event_${randomUUID()}`,
          organizationId,
          `notification:${id}`,
          JSON.stringify({ notificationId: id }),
        ],
      );
    }
    await this.recordAudit(
      organizationId,
      actorId,
      correlationId,
      "created",
      id,
    );
    return { data: normalizeRow(row) };
  }

  public async markRead(
    organizationId: string,
    recipientId: string,
    notificationId: string,
    actorId: string,
    correlationId: string,
  ) {
    const result = await this.database.query(
      `UPDATE platform.notifications SET read_at = COALESCE(read_at, now())
        WHERE id = $1 AND organization_id = $2 AND recipient_id = $3
        RETURNING id, read_at`,
      [notificationId, organizationId, recipientId],
    );
    if (result.rows[0] === undefined)
      throw new NotFoundException("Notification not found.");
    await this.recordAudit(
      organizationId,
      actorId,
      correlationId,
      "read",
      notificationId,
    );
    return {
      data: {
        id: notificationId,
        readAt: toTimestamp(result.rows[0]["read_at"]),
      },
    };
  }

  public async setPreference(
    organizationId: string,
    recipientId: string,
    category: NotificationCategory,
    enabled: boolean,
    correlationId: string,
  ) {
    if (category === "security" && !enabled)
      throw new ConflictException(
        "Critical security notices cannot be disabled.",
      );
    await this.database.query(
      `INSERT INTO platform.notification_preferences
        (organization_id, recipient_id, category, enabled)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, recipient_id, category)
       DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()
       WHERE platform.notification_preferences.category <> 'security'`,
      [organizationId, recipientId, category, enabled],
    );
    await this.recordAudit(
      organizationId,
      recipientId,
      correlationId,
      "preference_updated",
      category,
    );
    return {
      data: { category, enabled: category === "security" ? true : enabled },
    };
  }

  public async preferences(organizationId: string, recipientId: string) {
    const result = await this.database.query(
      `SELECT category, enabled FROM platform.notification_preferences
        WHERE organization_id = $1 AND recipient_id = $2
       UNION SELECT 'security', true
        ORDER BY category`,
      [organizationId, recipientId],
    );
    const values = new Map(
      result.rows.map((row) => [
        String(row["category"]),
        row["enabled"] === true,
      ]),
    );
    return {
      data: notificationCategories.map((category) => ({
        category,
        enabled: values.get(category) ?? true,
      })),
    };
  }

  private async recordAudit(
    organizationId: string,
    actorId: string,
    correlationId: string,
    event: string,
    resourceId: string,
  ) {
    await this.database.query(
      `INSERT INTO platform.audit_events
        (id, organization_id, actor_id, action, correlation_id, metadata)
       VALUES ($1, $2, $3, $4, $5, jsonb_build_object('resourceId', $6::text))`,
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        `staff.notification.${event}`,
        correlationId,
        resourceId,
      ],
    );
  }
}

function normalizeRow(row: Record<string, unknown>) {
  return {
    id: String(row["id"]),
    category: String(row["category"]),
    urgency: String(row["urgency"]),
    title: String(row["title"]),
    body: String(row["body"]),
    deepLink: String(row["deep_link"]),
    readAt: toTimestamp(row["read_at"]),
    deliveryState: String(row["delivery_state"]),
    createdAt: String(row["created_at"]),
  };
}

function toTimestamp(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}
