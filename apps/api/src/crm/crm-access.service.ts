import {
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { ActorResolverService } from "../auth/actor-resolver.service.js";
import type { CorrelatedRequest } from "../common/http/correlated-request.js";
import { TenantAccessService } from "../identity/tenant-access.service.js";

@Injectable()
export class CrmAccessService {
  public constructor(
    @Inject(ActorResolverService)
    private readonly actors: ActorResolverService,
    @Inject(TenantAccessService)
    private readonly tenantAccess: TenantAccessService,
  ) {}

  public async require(request: FastifyRequest, permission: "crm:read" | "crm:manage"): Promise<{ actorId: string; organizationId: string }> {
    const organizationId = process.env["CRM_ORGANIZATION_ID"]?.trim();
    if (!organizationId) {
      throw new ServiceUnavailableException("CRM staff access has not been configured.");
    }
    const actorId = await this.actors.fromRequest(request);
    const correlationId = (request as CorrelatedRequest).correlationId ?? "";
    const decision = await this.tenantAccess.resolve(actorId, organizationId, permission, correlationId);
    if (!decision.allowed) {
      if (decision.reason === "unauthenticated") throw new UnauthorizedException("Authentication is required.");
      throw new ForbiddenException("You do not have access to CRM leads.");
    }
    return { actorId: decision.tenantContext.actorId, organizationId };
  }
}
