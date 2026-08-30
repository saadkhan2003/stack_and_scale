import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { FastifyRequest } from "fastify";

import { PlatformDatabaseService } from "../platform-database.service.js";
import { PortalAccessService } from "./portal-access.service.js";

@Injectable()
export class PortalMembershipsService {
  public constructor(
    @Inject(PortalAccessService) private readonly access: PortalAccessService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async list(request: FastifyRequest, clientOrganizationId: string) {
    const principal = await this.requireAdmin(request, clientOrganizationId);
    const result = await this.database.query(
      `SELECT membership.id, membership.user_id, user_record.email,
              membership.role, membership.status
         FROM portal.client_memberships AS membership
         JOIN identity.users AS user_record ON user_record.id = membership.user_id
        WHERE membership.client_organization_id = $1
        ORDER BY user_record.email ASC, membership.id ASC`,
      [principal.clientOrganizationId],
    );
    return result.rows.map((row) => ({
      id: row["id"],
      userId: row["user_id"],
      email: row["email"],
      role: row["role"],
      status: row["status"],
    }));
  }

  public async add(
    request: FastifyRequest,
    clientOrganizationId: string,
    input: Readonly<Record<string, unknown>>,
  ) {
    const principal = await this.requireAdmin(request, clientOrganizationId);
    const email =
      typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const role = typeof input.role === "string" ? input.role : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["client_admin", "client_member"].includes(role)
    ) {
      throw new BadRequestException("Member email or role is invalid.");
    }
    const user = await this.database.query(
      `SELECT id FROM identity.users WHERE lower(email) = $1`,
      [email],
    );
    const userId = user.rows[0]?.["id"];
    if (typeof userId !== "string") {
      throw new BadRequestException(
        "This person must sign in once before they can be added to the portal.",
      );
    }
    const existing = await this.database.query(
      `SELECT id, user_id, role, status FROM portal.client_memberships
        WHERE client_organization_id = $1 AND user_id = $2`,
      [principal.clientOrganizationId, userId],
    );
    const membership = existing.rows[0];
    if (membership !== undefined && membership["status"] === "active") {
      return this.memberDto(membership);
    }
    const membershipId =
      typeof membership?.["id"] === "string"
        ? membership["id"]
        : `portal_membership_${randomUUID()}`;
    const saved = await this.database.query(
      `INSERT INTO portal.client_memberships (id, client_organization_id, user_id, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (client_organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, status = 'active', updated_at = now()
       RETURNING id, user_id, role, status`,
      [membershipId, principal.clientOrganizationId, userId, role],
    );
    await this.event(
      principal.clientOrganizationId,
      membershipId,
      principal.actorId,
      "member_added",
    );
    const savedMembership = saved.rows[0];
    if (savedMembership === undefined) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return this.memberDto(savedMembership);
  }

  public async revoke(
    request: FastifyRequest,
    clientOrganizationId: string,
    membershipId: string,
  ) {
    const principal = await this.requireAdmin(request, clientOrganizationId);
    const target = await this.database.query(
      `SELECT id, user_id, role, status FROM portal.client_memberships
        WHERE id = $1 AND client_organization_id = $2`,
      [membershipId, principal.clientOrganizationId],
    );
    const membership = target.rows[0];
    if (
      membership === undefined ||
      membership["user_id"] === principal.actorId
    ) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    const updated = await this.database.query(
      `UPDATE portal.client_memberships SET status = 'revoked', updated_at = now()
        WHERE id = $1 AND client_organization_id = $2 AND status <> 'revoked'
        RETURNING id, user_id, role, status`,
      [membershipId, principal.clientOrganizationId],
    );
    if (updated.rows[0] === undefined) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    await this.event(
      principal.clientOrganizationId,
      membershipId,
      principal.actorId,
      "member_revoked",
    );
    return this.memberDto(updated.rows[0]);
  }

  private async requireAdmin(
    request: FastifyRequest,
    clientOrganizationId: string,
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null || principal.role !== "client_admin") {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return principal;
  }

  private async event(
    clientOrganizationId: string,
    membershipId: string,
    actorId: string,
    eventType: "member_added" | "member_revoked",
  ) {
    await this.database.query(
      `INSERT INTO portal.membership_events
         (id, client_organization_id, membership_id, actor_id, event_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `portal_membership_event_${randomUUID()}`,
        clientOrganizationId,
        membershipId,
        actorId,
        eventType,
      ],
    );
  }

  private memberDto(row: Record<string, unknown>) {
    return {
      id: row["id"],
      userId: row["user_id"],
      role: row["role"],
      status: row["status"],
    };
  }
}
