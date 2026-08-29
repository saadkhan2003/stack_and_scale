import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { CrmAccessService } from "../crm/crm-access.service.js";
import { KnowledgeService } from "./knowledge.service.js";

@Controller("api/v1/operations/knowledge")
export class KnowledgeController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(KnowledgeService) private readonly knowledge: KnowledgeService,
  ) {}

  @Get()
  public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "knowledge:read");
    return this.knowledge.list(actor.organizationId);
  }

  @Get(":articleId")
  public async read(
    @Req() request: FastifyRequest,
    @Param("articleId") id: string,
  ) {
    const actor = await this.access.require(request, "knowledge:read");
    return this.knowledge.read(actor.organizationId, id);
  }

  @Post()
  public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "knowledge:manage");
    return this.knowledge.create(
      actor.organizationId,
      actor.actorId,
      parseArticle(body),
      correlationId(request),
    );
  }

  @Patch(":articleId")
  public async update(
    @Req() request: FastifyRequest,
    @Param("articleId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "knowledge:manage");
    return this.knowledge.update(
      actor.organizationId,
      actor.actorId,
      id,
      parseArticle(body),
      correlationId(request),
    );
  }

  @Delete(":articleId")
  public async remove(
    @Req() request: FastifyRequest,
    @Param("articleId") id: string,
  ) {
    const actor = await this.access.require(request, "knowledge:manage");
    return this.knowledge.remove(
      actor.organizationId,
      actor.actorId,
      id,
      correlationId(request),
    );
  }
}

function parseArticle(body: Record<string, unknown>) {
  const text = (key: string, max: number): string => {
    const value = body[key];
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.length > max
    ) {
      throw new BadRequestException(`A bounded ${key} is required.`);
    }
    return value.trim();
  };
  const contentType = body["contentType"];
  const status = body["status"] ?? "published";
  const contentTypeValue = typeof contentType === "string" ? contentType : "";
  const statusValue = typeof status === "string" ? status : "";
  const ownerId = body["ownerId"];
  const reviewAt = text("reviewAt", 80);
  if (
    !["procedure", "script", "faq", "onboarding"].includes(contentTypeValue) ||
    !["draft", "published", "archived"].includes(statusValue) ||
    Number.isNaN(Date.parse(reviewAt))
  ) {
    throw new BadRequestException(
      "A supported content type, status, and review date are required.",
    );
  }
  return {
    title: text("title", 200),
    contentType: contentTypeValue,
    body: text("body", 20_000),
    ownerId: ownerId === undefined ? undefined : text("ownerId", 200),
    reviewAt,
    status: statusValue,
  };
}

function correlationId(request: FastifyRequest): string {
  return (
    (request.headers["x-correlation-id"] as string | undefined)?.trim() ||
    "staff-knowledge"
  );
}
