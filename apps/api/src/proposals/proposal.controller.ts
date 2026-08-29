import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { ProposalService, type ProposalInput } from "./proposal.service.js";

@Controller("api/v1/proposals")
export class ProposalController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ProposalService) private readonly proposals: ProposalService,
  ) {}
  @Get() public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "crm:read");
    return this.proposals.list(actor.organizationId);
  }
  @Get(":proposalId") public async get(
    @Req() request: FastifyRequest,
    @Param("proposalId") id: string,
  ) {
    const actor = await this.access.require(request, "crm:read");
    return this.proposals.get(id, actor.organizationId);
  }
  @Post() public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.proposals.create(
      actor.organizationId,
      actor.actorId,
      parseInput(body),
      correlationId(request),
    );
  }
  @Post(":proposalId/versions") public async version(
    @Req() request: FastifyRequest,
    @Param("proposalId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.proposals.createVersion(
      id,
      actor.organizationId,
      actor.actorId,
      parseVersion(body),
      correlationId(request),
    );
  }
  @Post(":proposalId/versions/:version/submit") public async submit(
    @Req() request: FastifyRequest,
    @Param("proposalId") id: string,
    @Param("version") version: string,
  ) {
    const actor = await this.access.require(request, "approval:request");
    return this.proposals.submit(
      id,
      Number(version),
      actor.organizationId,
      actor.actorId,
      correlationId(request),
    );
  }
  @Post(":proposalId/versions/:version/approve") public async approve(
    @Req() request: FastifyRequest,
    @Param("proposalId") id: string,
    @Param("version") version: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    const reason = body["reason"];
    if (typeof reason !== "string" || !reason.trim())
      throw new BadRequestException("A reason is required.");
    return this.proposals.approve(
      id,
      Number(version),
      actor.organizationId,
      actor.actorId,
      reason.trim(),
      correlationId(request),
    );
  }
  @Post(":proposalId/versions/:version/publish") public async publish(
    @Req() request: FastifyRequest,
    @Param("proposalId") id: string,
    @Param("version") version: string,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.proposals.publish(
      id,
      Number(version),
      actor.organizationId,
      actor.actorId,
      correlationId(request),
    );
  }
}

@Controller("api/v1/public/proposals")
export class PublicProposalController {
  public constructor(
    @Inject(ProposalService) private readonly proposals: ProposalService,
  ) {}
  @Get(":token") public view(@Param("token") token: string) {
    return this.proposals.publicView(token);
  }
  @Post(":token/accept") public accept(
    @Req() request: FastifyRequest,
    @Param("token") token: string,
    @Body() body: Record<string, unknown>,
  ) {
    const name = body["name"];
    const email = body["email"];
    if (
      typeof name !== "string" ||
      !name.trim() ||
      (email !== undefined && typeof email !== "string")
    )
      throw new BadRequestException("A name and optional email are required.");
    return this.proposals.accept(
      token,
      name.trim(),
      email,
      request.ip,
      String(request.headers["user-agent"] ?? ""),
    );
  }
}

function parseInput(body: Record<string, unknown>): ProposalInput {
  const title = body["title"],
    leadId = body["leadId"];
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof leadId !== "string" ||
    !leadId.trim()
  )
    throw new BadRequestException("title and leadId are required.");
  const parsed = {
    title: title.trim(),
    leadId: leadId.trim(),
    ...parseVersion(body),
  };
  const opportunityId = optionalString(body["opportunityId"]);
  return opportunityId === undefined ? parsed : { ...parsed, opportunityId };
}
function parseVersion(body: Record<string, unknown>) {
  const currency = body["currency"],
    validFrom = body["validFrom"],
    validUntil = body["validUntil"],
    lineItems = body["lineItems"];
  if (
    typeof currency !== "string" ||
    !/^[A-Z]{3}$/.test(currency) ||
    typeof validFrom !== "string" ||
    Number.isNaN(Date.parse(validFrom)) ||
    typeof validUntil !== "string" ||
    Number.isNaN(Date.parse(validUntil)) ||
    !Array.isArray(lineItems) ||
    lineItems.length === 0
  )
    throw new BadRequestException(
      "currency, validity dates and at least one line item are required.",
    );
  return {
    currency,
    validFrom,
    validUntil,
    notes: optionalString(body["notes"]) ?? "",
    lineItems: lineItems as ProposalInput["lineItems"],
  };
}
function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function correlationId(request: FastifyRequest): string {
  return (
    (request.headers["x-correlation-id"] as string | undefined)?.trim() ||
    "proposal-operation"
  );
}
