import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import {
  createHealthContract,
  type HealthContract,
} from "@stack-and-scale/contracts";
import type { CreatePrivacyRequestRecordInput } from "@stack-and-scale/database";

import { openApiDocument } from "./openapi.js";
import { PlatformDatabaseService } from "./platform-database.service.js";

@Controller()
export class AppController {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  @Get("health")
  health(): HealthContract {
    return createHealthContract("api", "0.0.0");
  }

  @Get("version")
  version(): Pick<HealthContract, "service" | "version"> {
    const health = this.health();

    return {
      service: health.service,
      version: health.version,
    };
  }

  @Get("openapi.json")
  openApi(): typeof openApiDocument {
    return openApiDocument;
  }

  @Get("ready")
  async readiness(@Res({ passthrough: true }) reply: FastifyReply): Promise<{
    service: string;
    status: "ready" | "not_ready";
    version: string;
    checks: {
      application: "up";
      database: "up" | "down";
      migrations: "up" | "missing" | "down";
      outbox: "up" | "missing" | "down";
      privacy: "up" | "missing" | "down";
    };
  }> {
    const health = this.health();
    const database = await this.database.readiness();
    if (database.status !== "ready") {
      reply.code(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      service: health.service,
      status: database.status,
      version: health.version,
      checks: {
        application: "up",
        ...database.checks,
      },
    };
  }

  @Post("privacy-requests")
  @HttpCode(HttpStatus.CREATED)
  async createPrivacyRequest(
    @Body()
    input: Omit<CreatePrivacyRequestRecordInput, "actorId" | "correlationId">,
  ) {
    try {
      return await this.database.createPrivacyRequest({
        ...input,
        actorId: "api",
        correlationId: input.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
