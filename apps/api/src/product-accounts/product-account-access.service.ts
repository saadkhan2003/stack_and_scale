import { ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { ActorResolverService } from "../auth/actor-resolver.service.js";
import { PlatformDatabaseService } from "../platform-database.service.js";

export type ProductAccountPrincipal = {
  actorId: string;
  accountOrganizationId: string;
  productId: string;
  role: "owner" | "admin" | "member" | "billing";
};

@Injectable()
export class ProductAccountAccessService {
  public constructor(
    @Inject(ActorResolverService) private readonly actors: ActorResolverService,
    @Inject(PlatformDatabaseService) private readonly database: PlatformDatabaseService,
  ) {}

  public async resolve(request: FastifyRequest, accountOrganizationId: string): Promise<ProductAccountPrincipal> {
    const actorId = await this.actors.fromRequest(request);
    if (actorId === undefined) throw new UnauthorizedException("Authentication is required.");
    const result = await this.database.query(
      `SELECT membership.role, account.product_id, account.account_enabled, account.status
         FROM product.account_memberships AS membership
         JOIN product.account_organizations AS account ON account.id = membership.account_organization_id
        WHERE membership.user_id = $1 AND membership.account_organization_id = $2 AND membership.status = 'active'`,
      [actorId, accountOrganizationId],
    );
    const row = result.rows[0] as { role: ProductAccountPrincipal["role"]; product_id: string; account_enabled: boolean; status: string } | undefined;
    if (row === undefined || !row.account_enabled || row.status !== "active") {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return { actorId, accountOrganizationId, productId: row.product_id, role: row.role };
  }

  public requireAdmin(principal: ProductAccountPrincipal): void {
    if (principal.role !== "owner" && principal.role !== "admin") {
      throw new ForbiddenException("Administrator access is required.");
    }
  }
}
