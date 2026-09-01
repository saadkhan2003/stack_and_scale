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
  @Post("organizations/:accountOrganizationId/flags")
  public async flags(@Req() request: FastifyRequest, @Param("accountOrganizationId") accountOrganizationId: string, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.setAccountFlags(actor.actorId, accountOrganizationId, { ...(typeof body["accountEnabled"] === "boolean" ? { accountEnabled: body["accountEnabled"] } : {}), ...(typeof body["billingEnabled"] === "boolean" ? { billingEnabled: body["billingEnabled"] } : {}), ...(typeof body["downloadsEnabled"] === "boolean" ? { downloadsEnabled: body["downloadsEnabled"] } : {}), ...(typeof body["licenseEnforcementEnabled"] === "boolean" ? { licenseEnforcementEnabled: body["licenseEnforcementEnabled"] } : {}), ...(typeof body["integrationEnabled"] === "boolean" ? { integrationEnabled: body["integrationEnabled"] } : {}), ...(typeof body["telemetryEnabled"] === "boolean" ? { telemetryEnabled: body["telemetryEnabled"] } : {}), ...(typeof body["syncEnabled"] === "boolean" ? { syncEnabled: body["syncEnabled"] } : {}) });
  }
  @Post("licenses")
  public async license(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.grantLicense(actor.actorId, { accountOrganizationId: text(body, "accountOrganizationId"), productId: text(body, "productId"), seatLimit: number(body, "seatLimit") });
  }
  @Post("installations/:installationId/status")
  public async installationStatus(@Req() request: FastifyRequest, @Param("installationId") installationId: string, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.setInstallationStatus(actor.actorId, installationId, text(body, "status"));
  }
  @Post("signing-keys")
  public async signingKey(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.registerSigningKey(actor.actorId, { keyId: text(body, "keyId"), algorithm: text(body, "algorithm"), publicKey: text(body, "publicKey"), notBefore: text(body, "notBefore"), notAfter: text(body, "notAfter") });
  }
  @Post("signing-keys/:keyId/status")
  public async signingKeyStatus(@Req() request: FastifyRequest, @Param("keyId") keyId: string, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.setSigningKeyStatus(actor.actorId, keyId, text(body, "status"));
  }
  @Post("releases")
  public async release(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.registerRelease(actor.actorId, { productId: text(body, "productId"), version: text(body, "version"), platform: text(body, "platform"), checksumSha256: text(body, "checksumSha256"), signature: text(body, "signature"), keyId: text(body, "keyId"), storageReference: text(body, "storageReference") });
  }
  @Post("billing-projections")
  public async billingProjection(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.upsertBillingProjection(actor.actorId, { accountOrganizationId: text(body, "accountOrganizationId"), canonicalInvoiceId: text(body, "canonicalInvoiceId"), sourceEventKey: text(body, "sourceEventKey"), status: text(body, "status"), currency: text(body, "currency"), amountMinor: number(body, "amountMinor"), ...(typeof body["dueAt"] === "string" ? { dueAt: body["dueAt"] } : {}), ...(typeof body["paymentInstruction"] === "string" ? { paymentInstruction: body["paymentInstruction"] } : {}) });
  }
  @Post("support-projections")
  public async supportProjection(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage"); return this.accounts.upsertSupportProjection(actor.actorId, { accountOrganizationId: text(body, "accountOrganizationId"), productId: text(body, "productId"), sourceEventKey: text(body, "sourceEventKey"), title: text(body, "title"), status: text(body, "status"), publicDetail: text(body, "publicDetail") });
  }
  @Post("organizations")
  public async organization(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const actor = await this.access.require(request, "org:manage");
    return this.accounts.createAccountOrganization(actor.actorId, { productId: text(body, "productId"), displayName: text(body, "displayName"), ownerUserId: text(body, "ownerUserId") });
  }
}
function text(body: Record<string, unknown>, key: string): string { const value = body[key]; if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`); return value.trim(); }
function number(body: Record<string, unknown>, key: string): number { const value = body[key]; if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${key} is required.`); return value; }
