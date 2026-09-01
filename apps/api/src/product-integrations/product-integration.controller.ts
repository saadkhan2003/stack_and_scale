import { Body, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { ProductIntegrationAccessService } from "./product-integration-access.service.js";
import { ProductIntegrationService } from "./product-integration.service.js";

@Controller("api/v1/product-integrations")
export class ProductIntegrationController {
  public constructor(@Inject(ProductIntegrationAccessService) private readonly access: ProductIntegrationAccessService, @Inject(ProductIntegrationService) private readonly integrations: ProductIntegrationService) {}

  @Post("lease")
  public async lease(@Req() request: FastifyRequest) { return this.integrations.issueLease(await this.access.requireInstallation(request)); }

  @Post("heartbeat")
  public async heartbeat(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    return this.integrations.heartbeat(await this.access.requireInstallation(request), { softwareVersion: text(body, "softwareVersion"), leaseState: text(body, "leaseState"), syncCursor: number(body, "syncCursor"), syncStatus: text(body, "syncStatus") });
  }

  @Post("sync")
  public async sync(@Req() request: FastifyRequest, @Body() body: Record<string, unknown>) {
    const mutations = body["mutations"];
    if (!Array.isArray(mutations)) throw new Error("mutations is required.");
    return this.integrations.sync(await this.access.requireInstallation(request), mutations);
  }

  @Get("status")
  public async status(@Req() request: FastifyRequest) { const principal = await this.access.requireInstallation(request); return { contractVersion: "1.0", installationId: principal.installationId, requestId: request.id }; }
}

function text(body: Record<string, unknown>, key: string): string { const value = body[key]; if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`); return value.trim(); }
function number(body: Record<string, unknown>, key: string): number { const value = body[key]; if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${key} is required.`); return value; }
