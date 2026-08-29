import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { AccountingService } from "./accounting.service.js";

@Controller("api/v1/accounting/exports")
export class AccountingController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(AccountingService) private readonly accounting: AccountingService,
  ) {}
  @Get() public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "accounting:read");
    return this.accounting.list(actor.organizationId);
  }
  @Post() public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "accounting:export");
    const start = body.periodStart;
    const end = body.periodEnd;
    if (typeof start !== "string" || typeof end !== "string")
      throw new BadRequestException("periodStart and periodEnd are required.");
    return this.accounting.export(
      actor.organizationId,
      actor.actorId,
      start,
      end,
      typeof body.correctionOf === "string" ? body.correctionOf : undefined,
    );
  }
}
