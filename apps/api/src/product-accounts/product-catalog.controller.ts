import { Body, Controller, Inject, Param, Post, Req } from "@nestjs/common";
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
  @Post("catalog/products/:productId/status")
  public async productStatus(@Req() request: FastifyRequest, @Param("productId") productId: string, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.setCatalogProductStatus(actor.actorId, productId, text(body, "status"));
  }
  @Post("catalog/editions")
  public async edition(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.createEdition(actor.actorId, { productId: text(body, "productId"), code: text(body, "code"), name: text(body, "name") });
  }
  @Post("catalog/plans")
  public async plan(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.createPlan(actor.actorId, { editionId: text(body, "editionId"), code: text(body, "code"), name: text(body, "name") });
  }
  @Post("catalog/plan-versions")
  public async planVersion(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.createPlanVersion(actor.actorId, { planId: text(body, "planId"), version: number(body, "version"), effectiveFrom: text(body, "effectiveFrom"), priceCurrency: text(body, "priceCurrency"), priceMinor: number(body, "priceMinor"), entitlements: body["entitlements"] });
  }
  @Post("catalog/addons")
  public async addon(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.createAddon(actor.actorId, { productId: text(body, "productId"), code: text(body, "code"), name: text(body, "name"), entitlements: body["entitlements"] });
  }
  @Post("catalog/plan-versions/:planVersionId/addons/:addonId")
  public async assignAddon(@Req() request: FastifyRequest, @Param("planVersionId") planVersionId: string, @Param("addonId") addonId: string) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.assignPlanAddon(actor.actorId, planVersionId, addonId);
  }
  @Post("organizations")
  public async organization(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage");
    return this.accounts.createAccountOrganization(actor.actorId, { productId: text(body, "productId"), displayName: text(body, "displayName"), ownerUserId: text(body, "ownerUserId") });
  }
}
function text(body: Record<string, unknown>, key: string): string { const value = body[key]; if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`); return value.trim(); }
function number(body: Record<string, unknown>, key: string): number { const value = body[key]; if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${key} is required.`); return value; }
