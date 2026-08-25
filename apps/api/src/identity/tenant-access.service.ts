import { Inject, Injectable } from "@nestjs/common";
import {
  authorize,
  createTenantContext,
  type TenantContext,
} from "@stack-and-scale/contracts";

import { PlatformDatabaseService } from "../platform-database.service.js";

export type TenantAccessDecision =
  | Readonly<{ allowed: true; tenantContext: TenantContext; role: string }>
  | Readonly<{
      allowed: false;
      reason:
        | "unauthenticated"
        | "actor_not_member"
        | "membership_suspended"
        | "permission_not_granted";
    }>;

type MembershipRow = {
  role: string;
  status: string;
};

/**
 * Resolves the server-side tenant context for an actor. The organization is
 * never trusted from client input alone: access requires a membership row.
 *
 * Authentication boundary note: until the Keycloak OIDC integration lands,
 * the actor id arrives via the `x-actor-id` header. This header identifies
 * the actor but never grants authorization; every request still resolves
 * through the membership and permission checks below (deny by default).
 */
@Injectable()
export class TenantAccessService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async resolve(
    actorId: string | undefined,
    organizationId: string,
    permission: Parameters<typeof authorize>[0]["permission"],
    correlationId: string,
  ): Promise<TenantAccessDecision> {
    if (actorId === undefined || actorId.trim().length === 0) {
      return { allowed: false, reason: "unauthenticated" };
    }

    const result = await this.database.query(
      `SELECT role, status
         FROM identity.memberships
        WHERE user_id = $1 AND organization_id = $2`,
      [actorId, organizationId],
    );

    const row = result.rows[0] as MembershipRow | undefined;
    const decision = authorize({
      membership:
        row === undefined
          ? null
          : {
              organizationId,
              actorId,
              role: row.role,
              status: row.status === "suspended" ? "suspended" : "active",
            },
      organizationId,
      permission,
    });

    if (!decision.allowed) {
      return {
        allowed: false,
        reason:
          decision.reason === "membership_suspended" ||
          decision.reason === "permission_not_granted"
            ? decision.reason
            : "actor_not_member",
      };
    }

    return {
      allowed: true,
      role: decision.role,
      tenantContext: createTenantContext({
        organizationId,
        placementId: await this.resolvePlacementId(organizationId),
        actorId,
        correlationId,
      }),
    };
  }

  private async resolvePlacementId(organizationId: string): Promise<string> {
    const result = await this.database.query(
      "SELECT placement_id FROM platform.organizations WHERE id = $1",
      [organizationId],
    );
    const placementId = result.rows[0]?.["placement_id"];
    return typeof placementId === "string" && placementId.length > 0
      ? placementId
      : "unknown";
  }
}
