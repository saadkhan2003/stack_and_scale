import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { CrmAccessService } from "../crm/crm-access.service.js";
import {
  ApprovalService,
  CapacitySnapshotService,
  OperationsSearchService,
  ReleaseVisibilityService,
} from "./operations.service.js";

@Controller("api/v1/operations/approvals")
export class ApprovalController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ApprovalService) private readonly approvals: ApprovalService,
  ) {}

  @Get()
  public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "approval:read");
    return this.approvals.list(actor.organizationId);
  }

  @Post()
  public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:request");
    const input = parseApproval(body);
    return this.approvals.request(
      actor.organizationId,
      actor.actorId,
      input,
      correlationId(request),
    );
  }

  @Post("lifecycle")
  public async lifecycle(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "approval:read");
    await this.approvals.processLifecycle(
      actor.organizationId,
      correlationId(request),
    );
    return { data: { processed: true } };
  }

  @Post(":approvalId/decision")
  public async decide(
    @Req() request: FastifyRequest,
    @Param("approvalId") approvalId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    const decision = body["decision"];
    const reason = body["reason"];
    if (
      (decision !== "approved" && decision !== "rejected") ||
      typeof reason !== "string" ||
      reason.trim().length === 0 ||
      reason.length > 2_000
    ) {
      throw new BadRequestException("A decision and reason are required.");
    }
    return this.approvals.decide(
      actor.organizationId,
      approvalId,
      actor.actorId,
      decision,
      reason.trim(),
      correlationId(request),
    );
  }
}

@Controller("api/v1/operations/search")
export class OperationsSearchController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(OperationsSearchService)
    private readonly searchService: OperationsSearchService,
  ) {}

  @Get()
  public async search(
    @Req() request: FastifyRequest,
    @Query("q") query?: string,
  ) {
    const actor = await this.access.require(request, "crm:search");
    if (
      typeof query !== "string" ||
      query.trim().length < 2 ||
      query.trim().length > 100
    ) {
      throw new BadRequestException(
        "Search must be between 2 and 100 characters.",
      );
    }
    return this.searchService.search(actor.organizationId, query.trim());
  }
}

@Controller("api/v1/operations/release")
export class ReleaseVisibilityController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ReleaseVisibilityService)
    private readonly releases: ReleaseVisibilityService,
  ) {}

  @Get()
  public async get(@Req() request: FastifyRequest) {
    await this.access.require(request, "audit:read");
    return { data: await this.releases.snapshot() };
  }
}

@Controller("api/v1/operations/capacity")
export class CapacitySnapshotController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(CapacitySnapshotService)
    private readonly capacity: CapacitySnapshotService,
  ) {}

  @Get()
  public async get(@Req() request: FastifyRequest) {
    await this.access.require(request, "audit:read");
    return { data: await this.capacity.snapshot() };
  }
}

function parseApproval(body: Record<string, unknown>) {
  const resourceType = body["resourceType"];
  const resourceId = body["resourceId"];
  const reason = body["reason"];
  const expiresAt = body["expiresAt"];
  if (
    [resourceType, resourceId, reason, expiresAt].some(
      (value) => typeof value !== "string",
    ) ||
    (resourceType as string).trim().length === 0 ||
    (resourceId as string).trim().length === 0 ||
    (reason as string).trim().length === 0 ||
    (reason as string).length > 2_000 ||
    Number.isNaN(Date.parse(expiresAt as string)) ||
    Date.parse(expiresAt as string) <= Date.now()
  ) {
    throw new BadRequestException(
      "A future expiry and bounded approval details are required.",
    );
  }
  return {
    resourceType: (resourceType as string).trim().slice(0, 100),
    resourceId: (resourceId as string).trim().slice(0, 200),
    reason: (reason as string).trim(),
    expiresAt: expiresAt as string,
  };
}

function correlationId(request: FastifyRequest): string {
  return (
    (request.headers["x-correlation-id"] as string | undefined)?.trim() ||
    "staff-operation"
  );
}
