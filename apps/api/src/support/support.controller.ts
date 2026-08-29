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
import { SupportService } from "./support.service.js";

@Controller("api/v1/support/tickets")
export class SupportController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(SupportService) private readonly support: SupportService,
  ) {}
  @Get() public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "support:read");
    return this.support.list(actor.organizationId);
  }
  @Get(":ticketId") public async get(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
  ) {
    const actor = await this.access.require(request, "support:read");
    return this.support.get(actor.organizationId, ticketId);
  }
  @Post() public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.create(actor.organizationId, actor.actorId, {
      subject: text(body, "subject"),
      description: text(body, "description"),
      category: text(body, "category"),
      severity: text(body, "severity"),
      priority: text(body, "priority"),
      slaTargetSeconds: number(body, "slaTargetSeconds"),
      ...(typeof body.customerId === "string"
        ? { customerId: body.customerId }
        : {}),
    });
  }
  @Post(":ticketId/comments") public async comment(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.comment(
      actor.organizationId,
      actor.actorId,
      ticketId,
      text(body, "visibility"),
      text(body, "body"),
    );
  }
  @Patch(":ticketId") public async update(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.update(actor.organizationId, actor.actorId, ticketId, {
      ...(typeof body.status === "string" ? { status: body.status } : {}),
      ...(body.ownerId === null || typeof body.ownerId === "string"
        ? { ownerId: body.ownerId }
        : {}),
    });
  }
  @Post(":ticketId/pause") public async pause(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.pause(
      actor.organizationId,
      actor.actorId,
      ticketId,
      text(body, "reason"),
      body.resume === true,
    );
  }
  @Post(":ticketId/escalate") public async escalate(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.escalate(
      actor.organizationId,
      actor.actorId,
      ticketId,
      text(body, "reason"),
      typeof body.priority === "string" ? body.priority : undefined,
    );
  }
  @Post(":ticketId/attachments") public async attach(
    @Req() request: FastifyRequest,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "support:manage");
    return this.support.attach(
      actor.organizationId,
      actor.actorId,
      ticketId,
      text(body, "storageObjectId"),
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : {},
    );
  }
}
function text(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${field} is required.`);
  return value;
}
function number(body: Record<string, unknown>, field: string): number {
  const value = body[field];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new BadRequestException(`${field} must be a positive safe integer.`);
  return value;
}
