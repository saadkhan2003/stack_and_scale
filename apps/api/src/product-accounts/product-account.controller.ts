import { Body, Controller, Get, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { ProductAccountAccessService } from "./product-account-access.service.js";
import { ProductAccountService } from "./product-account.service.js";

@Controller("api/v1/product-accounts/organizations")
export class ProductAccountController {
  public constructor(
    @Inject(ProductAccountAccessService) private readonly access: ProductAccountAccessService,
    @Inject(ProductAccountService) private readonly accounts: ProductAccountService,
  ) {}

  private async principal(request: FastifyRequest, id: string) { return this.access.resolve(request, id); }

  @Get(":accountOrganizationId")
  public async home(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string) {
    return this.accounts.home(await this.principal(request, id));
  }
  @Get(":accountOrganizationId/members")
  public async members(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string) {
    const principal = await this.principal(request, id); this.access.requireAdmin(principal);
    return { members: await this.accounts.listMembers(principal) };
  }
  @Post(":accountOrganizationId/subscriptions/:subscriptionId/transitions")
  public async transition(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string, @Param("subscriptionId") subscriptionId: string, @Body() body: Record<string, unknown>) {
    const principal = await this.principal(request, id); this.access.requireAdmin(principal);
    return this.accounts.transitionSubscription(principal, subscriptionId, {
      status: string(body, "status"), reason: string(body, "reason"), idempotencyKey: string(body, "idempotencyKey"),
      ...(typeof body["effectiveAt"] === "string" ? { effectiveAt: body["effectiveAt"] } : {}),
      ...(typeof body["overrideUntil"] === "string" ? { overrideUntil: body["overrideUntil"] } : {}),
    });
  }
  @Get(":accountOrganizationId/entitlements/:subjectId")
  public async entitlements(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string, @Param("subjectId") subjectId: string) {
    return this.accounts.entitlementSnapshot(await this.principal(request, id), subjectId);
  }
  @Post(":accountOrganizationId/installations/:installationId/leases")
  public async lease(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string, @Param("installationId") installationId: string, @Body() body: Record<string, unknown>) {
    return this.accounts.issueLease(await this.principal(request, id), installationId, body["sequence"] as number);
  }
  @Get(":accountOrganizationId/billing")
  public async billing(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string) { return { invoices: await this.accounts.billing(await this.principal(request, id)) }; }
  @Post(":accountOrganizationId/releases/:releaseId/download")
  public async download(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string, @Param("releaseId") releaseId: string) { return this.accounts.download(await this.principal(request, id), releaseId); }
  @Get(":accountOrganizationId/support")
  public async support(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string) { return { support: await this.accounts.support(await this.principal(request, id)) }; }
  @Get(":accountOrganizationId/notification-preferences")
  public async preferences(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string) { return { preferences: await this.accounts.preferences(await this.principal(request, id)) }; }
  @Post(":accountOrganizationId/notification-preferences/:category")
  public async preference(@Req() request: FastifyRequest, @Param("accountOrganizationId") id: string, @Param("category") category: string, @Body() body: Record<string, unknown>) { return this.accounts.setPreference(await this.principal(request, id), category, body["enabled"]); }
}

function string(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  return value.trim();
}
