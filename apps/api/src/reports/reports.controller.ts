import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { CrmAccessService } from "../crm/crm-access.service.js";
import type { CorrelatedRequest } from "../common/http/correlated-request.js";
import { ReportsService, reportTypes } from "./reports.service.js";

@Controller("api/v1/operations/reports")
export class ReportsController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ReportsService) private readonly reports: ReportsService,
  ) {}

  @Get()
  public async report(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query("type") type?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("timezone") timezone?: string,
    @Query("format") format?: string,
  ) {
    const actor = await this.access.require(
      request,
      format === "csv" ? "report:export" : "report:read",
    );
    if (!reportTypes.includes(type as (typeof reportTypes)[number]))
      throw new BadRequestException("Choose a supported report type.");
    const result = await this.reports.build(
      actor.organizationId,
      actor.actorId,
      type as (typeof reportTypes)[number],
      from,
      to,
      timezone,
      format,
      (request as CorrelatedRequest).correlationId ?? "staff-report",
    );
    if (result.format === "csv") {
      reply.header("content-type", "text/csv; charset=utf-8");
      reply.header(
        "content-disposition",
        `attachment; filename="${result.type}-report.csv"`,
      );
      return result.body;
    }
    return { data: result.body, meta: result.meta };
  }
}
