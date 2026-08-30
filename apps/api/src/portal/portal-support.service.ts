import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { SupportService } from "../support/support.service.js";
import { PortalAccessService } from "./portal-access.service.js";

const ticketCategories = new Set([
  "bug",
  "question",
  "incident",
  "request",
  "billing",
  "other",
]);

@Injectable()
export class PortalSupportService {
  public constructor(
    @Inject(PortalAccessService) private readonly access: PortalAccessService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(SupportService) private readonly support: SupportService,
  ) {}

  public async tickets(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_support_enabled",
    );
    const result = await this.database.query(
      `SELECT id, subject, description, category, priority, status, sla_target_seconds, created_at, updated_at
         FROM platform.support_tickets WHERE organization_id = $1 AND customer_id = $2
        ORDER BY updated_at DESC, id ASC LIMIT 100`,
      [principal.organizationId, principal.customerId],
    );
    return result.rows.map((row) => ({
      id: row["id"],
      subject: row["subject"],
      description: row["description"],
      category: row["category"],
      priority: row["priority"],
      status: row["status"],
      slaTargetSeconds: row["sla_target_seconds"],
      createdAt: row["created_at"],
      updatedAt: row["updated_at"],
    }));
  }

  public async activity(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_activity_enabled",
    );
    const result = await this.database.query(
      `SELECT id, event_type, title, occurred_at FROM portal.activity_projections
        WHERE client_organization_id = $1 ORDER BY occurred_at DESC, id ASC LIMIT 100`,
      [principal.clientOrganizationId],
    );
    return result.rows.map((row) => ({
      id: row["id"],
      type: row["event_type"],
      title: row["title"],
      occurredAt: row["occurred_at"],
    }));
  }

  public async createTicket(
    request: FastifyRequest,
    clientOrganizationId: string,
    input: Readonly<Record<string, unknown>>,
  ) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_support_enabled",
    );
    const subject =
      typeof input.subject === "string" ? input.subject.trim() : "";
    const description =
      typeof input.description === "string" ? input.description.trim() : "";
    const category = typeof input.category === "string" ? input.category : "";
    if (
      subject.length === 0 ||
      subject.length > 180 ||
      description.length === 0 ||
      description.length > 12_000 ||
      !ticketCategories.has(category)
    ) {
      throw new BadRequestException("Ticket fields are invalid.");
    }
    const created = await this.support.create(
      principal.organizationId,
      principal.actorId,
      {
        subject,
        description,
        category,
        severity: "medium",
        priority: "normal",
        slaTargetSeconds: 86_400,
        customerId: principal.customerId,
      },
    );
    return { ticket: created.data };
  }

  public async addTicketComment(
    request: FastifyRequest,
    clientOrganizationId: string,
    ticketId: string,
    body: unknown,
  ) {
    const principal = await this.requireFeature(
      request,
      clientOrganizationId,
      "portal_support_enabled",
    );
    const comment = typeof body === "string" ? body.trim() : "";
    if (comment.length === 0 || comment.length > 12_000) {
      throw new BadRequestException("Comment body is invalid.");
    }
    const ticket = await this.database.query(
      `SELECT id FROM platform.support_tickets
        WHERE id = $1 AND organization_id = $2 AND customer_id = $3`,
      [ticketId, principal.organizationId, principal.customerId],
    );
    if (ticket.rows[0] === undefined) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const created = await this.support.comment(
      principal.organizationId,
      principal.actorId,
      ticketId,
      "public",
      comment,
    );
    return { comment: created.data };
  }

  public async preferences(
    request: FastifyRequest,
    clientOrganizationId: string,
  ) {
    const principal = await this.requireNotifications(
      request,
      clientOrganizationId,
    );
    const result = await this.database.query(
      `SELECT category, enabled FROM platform.notification_preferences
        WHERE organization_id = $1 AND recipient_id = $2 AND category IN ('billing', 'system')`,
      [principal.organizationId, principal.actorId],
    );
    const values = new Map(
      result.rows.map((row) => [
        String(row["category"]),
        row["enabled"] === true,
      ]),
    );
    return {
      preferences: ["security", "billing", "system"].map((category) => ({
        category,
        enabled:
          category === "security" ? true : (values.get(category) ?? true),
      })),
    };
  }

  public async setPreference(
    request: FastifyRequest,
    clientOrganizationId: string,
    category: string,
    enabled: unknown,
  ) {
    if (
      !["billing", "system"].includes(category) ||
      typeof enabled !== "boolean"
    ) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const principal = await this.requireNotifications(
      request,
      clientOrganizationId,
    );
    await this.database.query(
      `INSERT INTO platform.notification_preferences (organization_id, recipient_id, category, enabled)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, recipient_id, category)
       DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`,
      [principal.organizationId, principal.actorId, category, enabled],
    );
    return { category, enabled };
  }

  private async requireNotifications(
    request: FastifyRequest,
    clientOrganizationId: string,
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null)
      throw new ForbiddenException("You do not have access to this resource.");
    const result = await this.database.query(
      `SELECT portal_notifications_enabled FROM portal.client_organizations WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (result.rows[0]?.["portal_notifications_enabled"] !== true)
      throw new ForbiddenException("You do not have access to this resource.");
    return principal;
  }

  private async requireFeature(
    request: FastifyRequest,
    clientOrganizationId: string,
    feature: "portal_support_enabled" | "portal_activity_enabled",
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null)
      throw new ForbiddenException("You do not have access to this resource.");
    const result = await this.database.query(
      `SELECT portal_support_enabled, portal_activity_enabled FROM portal.client_organizations WHERE id = $1 AND organization_id = $2`,
      [principal.clientOrganizationId, principal.organizationId],
    );
    if (result.rows[0]?.[feature] !== true)
      throw new ForbiddenException("You do not have access to this resource.");
    return principal;
  }
}
