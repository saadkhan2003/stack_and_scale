import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { TenantAccessService } from "./tenant-access.service.js";
import { PlatformDatabaseService } from "../platform-database.service.js";
import type { CorrelatedRequest } from "../common/http/correlated-request.js";

type MemberRow = {
  user_id: string;
  role: string;
  status: string;
  accepted_at: Date | null;
};

function actorFromRequest(request: FastifyRequest): string | undefined {
  const header = request.headers["x-actor-id"];
  if (Array.isArray(header)) {
    return undefined;
  }
  return header;
}

@Controller("api/v1/organizations")
export class IdentityController {
  public constructor(
    @Inject(TenantAccessService)
    private readonly tenantAccess: TenantAccessService,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  @Get(":organizationId/members")
  public async listMembers(
    @Req() request: FastifyRequest,
    @Param("organizationId") organizationId: string,
  ): Promise<{ data: unknown }> {
    const correlationId = (request as CorrelatedRequest).correlationId ?? "";
    const decision = await this.tenantAccess.resolve(
      actorFromRequest(request),
      organizationId,
      "member:read",
      correlationId,
    );

    if (!decision.allowed) {
      if (decision.reason === "unauthenticated") {
        throw new UnauthorizedException("Authentication is required.");
      }

      throw new ForbiddenException("You do not have access to this resource.");
    }

    const result = await this.database.query(
      `SELECT user_id, role, status, accepted_at
         FROM identity.memberships
        WHERE organization_id = $1 AND status = 'active'
        ORDER BY created_at`,
      [organizationId],
    );

    return {
      data: (result.rows as MemberRow[]).map((row) => ({
        id: row.user_id,
        role: row.role,
        status: row.status,
        acceptedAt: row.accepted_at?.toISOString() ?? null,
      })),
    };
  }
}
