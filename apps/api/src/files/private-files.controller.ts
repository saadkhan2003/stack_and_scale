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
import { PrivateFilesService } from "./private-files.service.js";

@Controller("api/v1/files")
export class PrivateFilesController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(PrivateFilesService) private readonly files: PrivateFilesService,
  ) {}
  @Get() public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "file:read");
    return this.files.list(actor.organizationId);
  }
  @Post() public async upload(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "file:manage");
    const encoded = body.body;
    if (typeof encoded !== "string")
      throw new BadRequestException("body must be base64 text.");
    return this.files.upload(actor.organizationId, actor.actorId, {
      filename: text(body, "filename"),
      classification: text(body, "classification"),
      contentType: text(body, "contentType"),
      body: Buffer.from(encoded, "base64"),
      ...(typeof body.ownerId === "string" ? { ownerId: body.ownerId } : {}),
      ...(typeof body.retentionUntil === "string"
        ? { retentionUntil: body.retentionUntil }
        : {}),
    });
  }
  @Post(":fileId/access") public async accessFile(
    @Req() request: FastifyRequest,
    @Param("fileId") fileId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "file:read");
    return this.files.signedAccess(
      actor.organizationId,
      actor.actorId,
      fileId,
      typeof body.version === "number" ? body.version : 0,
    );
  }
}
function text(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${field} is required.`);
  return value.trim();
}
