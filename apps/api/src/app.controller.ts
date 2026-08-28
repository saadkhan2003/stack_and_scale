import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
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
import { MetricsService } from "./observability/metrics.service.js";

@Controller()
export class AppController {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(MetricsService)
    private readonly metrics: MetricsService,
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

  @Get("metrics")
  async metricsEndpoint(
    @Headers("authorization") authorization: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<string> {
    const token = this.metrics.configuredBearerToken();
    if (token === undefined) {
      throw new ServiceUnavailableException(
        "Metrics exporter is not configured.",
      );
    }
    if (authorization !== `Bearer ${token}`) {
      throw new UnauthorizedException("Metrics authorization is required.");
    }
    reply.header("content-type", "text/plain; version=0.0.4; charset=utf-8");
    return this.metrics.renderPrometheus({
      outboxStatusCounts: await this.outboxStatusCounts(),
    });
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

  private async outboxStatusCounts(): Promise<Record<string, number>> {
    try {
      const result = await this.database.query(
        "SELECT status, count(*)::integer AS count FROM platform.outbox_events GROUP BY status",
      );
      return Object.fromEntries(
        result.rows.flatMap((row) => {
          const status = row["status"];
          const count = row["count"];
          if (typeof status !== "string" || typeof count !== "number")
            return [];
          return [[status, count]];
        }),
      );
    } catch {
      // Monitoring should still report API liveness during an early migration
      // failure or database outage; readiness exposes that dependency state.
      return {};
    }
  }
}
