import { Body, Controller, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { CrmAccessService } from "../crm/crm-access.service.js";
import { ProductIntegrationService } from "./product-integration.service.js";

@Controller("api/v1/product-integrations/admin")
export class ProductIntegrationAdminController {
  public constructor(@Inject(CrmAccessService) private readonly access: CrmAccessService, @Inject(ProductIntegrationService) private readonly integrations: ProductIntegrationService) {}

  @Post("installations/:installationId/credentials")
  public async credential(@Req() request: FastifyRequest, @Param("installationId") installationId: string, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage");
    const expiresAt = body["expiresAt"];
    if (typeof expiresAt !== "string") throw new Error("expiresAt is required.");
    return this.integrations.provisionCredential(actor.actorId, installationId, expiresAt);
  }

  @Post("installations/:installationId/credentials/revoke")
  public async revoke(@Req() request: FastifyRequest, @Param("installationId") installationId: string) {
    const actor = await this.access.require(request, "org:manage");
    return this.integrations.revokeCredentials(actor.actorId, installationId);
  }
}
