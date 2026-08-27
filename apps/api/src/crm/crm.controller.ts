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

import { CrmAccessService } from "./crm-access.service.js";
import { CrmService } from "./crm.service.js";

@Controller("api/v1/crm/leads")
export class CrmController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(CrmService) private readonly crm: CrmService,
  ) {}
  @Get() public async list(@Req() request: FastifyRequest) {
    await this.access.require(request, "crm:read");
    return this.crm.listLeads();
  }
  @Get(":leadId") public async get(
    @Req() request: FastifyRequest,
    @Param("leadId") leadId: string,
  ) {
    await this.access.require(request, "crm:read");
    return this.crm.getLead(leadId);
  }
  @Patch(":leadId") public async update(
    @Req() request: FastifyRequest,
    @Param("leadId") leadId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    const input = parseUpdate(body);
    return this.crm.updateLead(
      leadId,
      input,
      actor.actorId,
      actor.organizationId,
    );
  }
  @Post(":leadId/notes") public async note(
    @Req() request: FastifyRequest,
    @Param("leadId") leadId: string,
    @Body() body: { body?: unknown },
  ) {
    const actor = await this.access.require(request, "crm:manage");
    if (
      typeof body.body !== "string" ||
      body.body.trim().length === 0 ||
      body.body.length > 4_000
    )
      throw new BadRequestException(
        "A note of up to 4,000 characters is required.",
      );
    return this.crm.addNote(leadId, body.body.trim(), actor.actorId);
  }
  @Post(":leadId/tasks") public async task(
    @Req() request: FastifyRequest,
    @Param("leadId") leadId: string,
    @Body() body: { title?: unknown; assigneeId?: unknown; dueAt?: unknown },
  ) {
    const actor = await this.access.require(request, "crm:manage");
    if (
      typeof body.title !== "string" ||
      body.title.trim().length === 0 ||
      body.title.length > 300
    )
      throw new BadRequestException(
        "A task title of up to 300 characters is required.",
      );
    const assigneeId =
      typeof body.assigneeId === "string" && body.assigneeId.trim()
        ? body.assigneeId.trim()
        : null;
    const dueAt =
      typeof body.dueAt === "string" && !Number.isNaN(Date.parse(body.dueAt))
        ? body.dueAt
        : null;
    return this.crm.createTask(
      leadId,
      body.title.trim(),
      assigneeId,
      dueAt,
      actor.actorId,
      actor.organizationId,
    );
  }
  @Patch(":leadId/tasks/:taskId/complete") public async completeTask(
    @Req() request: FastifyRequest,
    @Param("leadId") leadId: string,
    @Param("taskId") taskId: string,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.crm.completeTask(leadId, taskId, actor.actorId);
  }
}

function parseUpdate(body: Record<string, unknown>) {
  const value = (key: string, maximum: number): string | null | undefined => {
    const candidate = body[key];
    if (candidate === null) return null;
    if (candidate === undefined) return undefined;
    if (typeof candidate !== "string" || candidate.length > maximum)
      throw new BadRequestException(`Invalid ${key}.`);
    return candidate.trim();
  };
  const probability = body["probability"];
  const estimatedValue = body["estimatedValue"];
  if (probability !== undefined && typeof probability !== "number")
    throw new BadRequestException("Probability must be a number.");
  if (
    estimatedValue !== undefined &&
    (typeof estimatedValue !== "number" || !Number.isFinite(estimatedValue))
  )
    throw new BadRequestException("Estimated value must be a finite number.");
  const nextActionAt = body["nextActionAt"];
  if (
    nextActionAt !== undefined &&
    nextActionAt !== null &&
    (typeof nextActionAt !== "string" || Number.isNaN(Date.parse(nextActionAt)))
  )
    throw new BadRequestException("Next action must be a valid timestamp.");
  const stage = value("stage", 30);
  const ownerId = value("ownerId", 200);
  const lostReason = value("lostReason", 1_000);
  return {
    ...(typeof stage === "string" ? { stage } : {}),
    ...(ownerId !== undefined ? { ownerId } : {}),
    ...(typeof probability === "number" ? { probability } : {}),
    ...(estimatedValue !== undefined
      ? { estimatedValue: estimatedValue as number | null }
      : {}),
    ...(nextActionAt !== undefined ? { nextActionAt } : {}),
    ...(lostReason !== undefined ? { lostReason } : {}),
  };
}
