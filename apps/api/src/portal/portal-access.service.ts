import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  authorizePortalAccess,
  type PortalPrincipal,
} from "@stack-and-scale/contracts";
import type { FastifyRequest } from "fastify";

import { ActorResolverService } from "../auth/actor-resolver.service.js";
import { PlatformDatabaseService } from "../platform-database.service.js";

type MembershipRow = {
  user_id: string;
  client_organization_id: string;
  organization_id: string;
  customer_id: string;
  role: string;
  status: string;
  portal_access_enabled: boolean;
};

@Injectable()
export class PortalAccessService {
  public constructor(
    @Inject(ActorResolverService)
    private readonly actors: ActorResolverService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async resolve(
    request: FastifyRequest,
    clientOrganizationId: string,
  ): Promise<PortalPrincipal | null> {
    const actorId = await this.actors.fromRequest(request);
    if (actorId === undefined) {
      throw new UnauthorizedException("Authentication is required.");
    }
    if (clientOrganizationId.trim().length === 0) {
      return null;
    }

    const result = await this.database.query(
      `SELECT membership.user_id, membership.client_organization_id,
              client_organization.organization_id, client_organization.customer_id,
              membership.role, membership.status,
              client_organization.portal_access_enabled
         FROM portal.client_memberships AS membership
         JOIN portal.client_organizations AS client_organization
           ON client_organization.id = membership.client_organization_id
        WHERE membership.user_id = $1
          AND membership.client_organization_id = $2`,
      [actorId, clientOrganizationId],
    );
    const row = result.rows[0] as MembershipRow | undefined;
    const decision = authorizePortalAccess({
      actorId,
      requestedClientOrganizationId: clientOrganizationId,
      membership:
        row === undefined
          ? null
          : {
              actorId: row.user_id,
              clientOrganizationId: row.client_organization_id,
              organizationId: row.organization_id,
              customerId: row.customer_id,
              role: row.role,
              status: row.status,
              portalAccessEnabled: row.portal_access_enabled,
            },
    });
    return decision.allowed ? decision.principal : null;
  }
}
