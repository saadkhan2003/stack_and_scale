import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { ContractService } from "./contract.service.js";

@Controller("api/v1/contracts")
export class ContractController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(ContractService) private readonly contracts: ContractService,
  ) {}
  @Post("templates") public async template(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.contracts.createTemplate(
      actor.organizationId,
      actor.actorId,
      stringField(body, "name"),
      optionalString(body["description"]),
    );
  }
  @Post("templates/:templateId/versions") public async templateVersion(
    @Req() request: FastifyRequest,
    @Param("templateId") templateId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    const variables = body["variables"];
    return this.contracts.createTemplateVersion(
      actor.organizationId,
      actor.actorId,
      templateId,
      stringField(body, "body"),
      Array.isArray(variables) && variables.every((v) => typeof v === "string")
        ? variables
        : [],
    );
  }
  @Post("templates/:templateId/versions/:version/approve") public async approve(
    @Req() request: FastifyRequest,
    @Param("templateId") templateId: string,
    @Param("version") version: string,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    return this.contracts.approveTemplateVersion(
      actor.organizationId,
      actor.actorId,
      templateId,
      Number(version),
    );
  }
  @Post() public async contract(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    const variables = body["variables"];
    if (
      variables !== undefined &&
      (typeof variables !== "object" ||
        variables === null ||
        Array.isArray(variables))
    )
      throw new BadRequestException("variables must be an object.");
    return this.contracts.createContract(actor.organizationId, actor.actorId, {
      templateId: stringField(body, "templateId"),
      templateVersion: numberField(body, "templateVersion"),
      proposalId: stringField(body, "proposalId"),
      proposalVersion: numberField(body, "proposalVersion"),
      variables: (variables ?? {}) as Record<string, unknown>,
    });
  }
  @Post(":contractId/signers") public async signer(
    @Req() request: FastifyRequest,
    @Param("contractId") contractId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.contracts.addSigner(actor.organizationId, contractId, {
      name: stringField(body, "name"),
      email: stringField(body, "email"),
      identityMethod: (optionalString(body["identityMethod"]) || "email") as
        | "email"
        | "provider_verified"
        | "staff_verified"
        | "other",
      evidence:
        typeof body["evidence"] === "object" && body["evidence"] !== null
          ? (body["evidence"] as Record<string, unknown>)
          : {},
    });
  }
  @Post(":contractId/sign") public async sign(
    @Req() request: FastifyRequest,
    @Param("contractId") contractId: string,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.contracts.startSigning(
      actor.organizationId,
      actor.actorId,
      contractId,
      String(request.headers["x-correlation-id"] ?? "contract-signing"),
    );
  }
  @Post(":contractId/signed-fallback") public async fallback(
    @Req() request: FastifyRequest,
    @Param("contractId") contractId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    const retentionUntil = optionalString(body["retentionUntil"]);
    return this.contracts.recordUploadedFallback(
      actor.organizationId,
      actor.actorId,
      contractId,
      {
        kind: "uploaded_signed_fallback",
        storageKey: stringField(body, "storageKey"),
        originalFilename: stringField(body, "originalFilename"),
        contentType: stringField(body, "contentType"),
        sizeBytes: numberField(body, "sizeBytes"),
        checksumSha256: stringField(body, "checksumSha256"),
        ...(retentionUntil ? { retentionUntil } : {}),
        legalHold: body["legalHold"] === true,
      },
    );
  }
  @Get(":contractId/artifact") public async artifact(
    @Req() request: FastifyRequest,
    @Param("contractId") contractId: string,
  ) {
    const actor = await this.access.require(request, "crm:read");
    return this.contracts.artifact(
      actor.organizationId,
      actor.actorId,
      contractId,
    );
  }
  @Get(":contractId/artifact/access") public async artifactAccess(
    @Req() request: FastifyRequest,
    @Param("contractId") contractId: string,
  ) {
    const actor = await this.access.require(request, "crm:read");
    return this.contracts.artifactAccess(
      actor.organizationId,
      actor.actorId,
      contractId,
    );
  }
}

@Controller("api/v1/esign")
export class EsignCallbackController {
  public constructor(
    @Inject(ContractService) private readonly contracts: ContractService,
  ) {}
  @Post("callback") public callback(
    @Headers("x-esign-signature") signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const payload = parseCallback(body);
    return this.contracts.handleCallback(
      JSON.stringify(body),
      signature ?? "",
      payload,
    );
  }
}

function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${field} is required.`);
  return value.trim();
}
function numberField(body: Record<string, unknown>, field: string): number {
  const value = body[field];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new BadRequestException(`${field} must be a positive safe integer.`);
  return value;
}
function optionalString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function parseCallback(body: Record<string, unknown>) {
  const fields = [
    "provider",
    "eventId",
    "eventType",
    "organizationId",
    "contractId",
    "status",
  ] as const;
  if (
    fields.some(
      (field) => typeof body[field] !== "string" || !String(body[field]).trim(),
    ) ||
    !["sent", "partially_signed", "signed", "failed"].includes(
      String(body["status"]),
    )
  )
    throw new BadRequestException("Invalid e-sign callback payload.");
  return {
    provider: String(body["provider"]),
    eventId: String(body["eventId"]),
    eventType: String(body["eventType"]),
    organizationId: String(body["organizationId"]),
    contractId: String(body["contractId"]),
    status: String(body["status"]) as
      | "sent"
      | "partially_signed"
      | "signed"
      | "failed",
  };
}
