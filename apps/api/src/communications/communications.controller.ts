import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { CommunicationsService } from "./communications.service.js";
@Controller("api/v1/communications")
export class CommunicationsController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(CommunicationsService)
    private readonly communications: CommunicationsService,
  ) {}
  @Get() public async list(@Req() req: FastifyRequest) {
    const actor = await this.access.require(req, "communication:read");
    return this.communications.list(actor.organizationId);
  }
  @Post("templates") public async template(
    @Req() req: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(req, "communication:manage");
    return this.communications.createTemplate(
      actor.organizationId,
      actor.actorId,
      text(body, "eventType"),
      text(body, "subject"),
      text(body, "body"),
    );
  }
  @Post("templates/:id/approve") public async approve(
    @Req() req: FastifyRequest,
    @Param("id") id: string,
  ) {
    const actor = await this.access.require(req, "communication:manage");
    return this.communications.approveTemplate(
      actor.organizationId,
      actor.actorId,
      id,
    );
  }
  @Post() public async send(
    @Req() req: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(req, "communication:manage");
    return this.communications.send(actor.organizationId, actor.actorId, {
      eventType: text(body, "eventType"),
      resourceId: text(body, "resourceId"),
      recipientId: text(body, "recipientId"),
    });
  }
  @Patch(":id/resend") public async resend(
    @Req() req: FastifyRequest,
    @Param("id") id: string,
  ) {
    const actor = await this.access.require(req, "communication:manage");
    return this.communications.resend(actor.organizationId, actor.actorId, id);
  }
}
function text(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${key} is required.`);
  return value.trim();
}
