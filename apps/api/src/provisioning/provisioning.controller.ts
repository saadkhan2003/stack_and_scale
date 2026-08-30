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
import { ProvisioningService } from "./provisioning.service.js";
@Controller("api/v1/provisioning")
export class ProvisioningController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ProvisioningService)
    private readonly provisioning: ProvisioningService,
  ) {}
  @Get() public async list(@Req() req: FastifyRequest) {
    const actor = await this.access.require(req, "provisioning:read");
    return this.provisioning.list(actor.organizationId);
  }
  @Get(":id") public async get(
    @Req() req: FastifyRequest,
    @Param("id") id: string,
  ) {
    const actor = await this.access.require(req, "provisioning:read");
    return this.provisioning.get(actor.organizationId, id);
  }
  @Post() public async create(
    @Req() req: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(req, "provisioning:manage");
    const steps = body.steps;
    if (
      !Array.isArray(steps) ||
      steps.length === 0 ||
      steps.some(
        (step) =>
          typeof step !== "object" ||
          step === null ||
          typeof (step as Record<string, unknown>).key !== "string",
      )
    )
      throw new BadRequestException("steps are required.");
    return this.provisioning.create(actor.organizationId, actor.actorId, {
      sourceType: text(body, "sourceType"),
      sourceId: text(body, "sourceId"),
      idempotencyKey: text(body, "idempotencyKey"),
      ...(typeof body.customerId === "string"
        ? { customerId: body.customerId }
        : {}),
      steps: steps.map((step) => {
        const value = step as Record<string, unknown>;
        return {
          key: String(value.key),
          privileged: value.privileged === true,
          highCost: value.highCost === true,
          ...(typeof value.ownerId === "string"
            ? { ownerId: value.ownerId }
            : {}),
        };
      }),
    });
  }
  @Post(":id/retry") public async retry(
    @Req() req: FastifyRequest,
    @Param("id") id: string,
  ) {
    const actor = await this.access.require(req, "provisioning:manage");
    return this.provisioning.retry(actor.organizationId, actor.actorId, id);
  }
}
function text(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${key} is required.`);
  return value.trim();
}
