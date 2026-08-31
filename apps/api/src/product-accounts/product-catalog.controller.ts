import { Body, Controller, Inject, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { ProductAccountService } from "./product-account.service.js";

@Controller("api/v1/product-accounts")
export class ProductCatalogController {
  public constructor(@Inject(CrmAccessService) private readonly access: CrmAccessService, @Inject(ProductAccountService) private readonly accounts: ProductAccountService) {}
  @Post("catalog/products")
  public async product(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage");
    return this.accounts.createCatalogProduct(actor.actorId, { code: text(body, "code"), name: text(body, "name") });
  }
  @Post("organizations")
  public async organization(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage");
    return this.accounts.createAccountOrganization(actor.actorId, { productId: text(body, "productId"), displayName: text(body, "displayName"), ownerUserId: text(body, "ownerUserId") });
  }
}
function text(body: Record<string, unknown>, key: string): string { const value = body[key]; if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`); return value.trim(); }
