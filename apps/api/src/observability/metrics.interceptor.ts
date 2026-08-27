import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Observable } from "rxjs";
import { tap } from "rxjs";

import { MetricsService } from "./metrics.service.js";
import type { CorrelatedRequest } from "../common/http/correlated-request.js";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  public constructor(
    @Inject(MetricsService) private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const startedAt = performance.now();
    return next.handle().pipe(
      tap({
        next: () => {
          this.record(request, startedAt, reply.statusCode);
        },
        error: (error: unknown) => {
          this.record(
            request,
            startedAt,
            error instanceof HttpException ? error.getStatus() : 500,
          );
        },
      }),
    );
  }

  private record(
    request: FastifyRequest,
    startedAt: number,
    statusCode: number,
  ): void {
    const route =
      request.routeOptions?.url ?? request.url.split("?")[0] ?? "unknown";
    const durationMs = performance.now() - startedAt;
    this.metrics.recordRequest({
      method: request.method,
      route,
      statusCode,
      durationMs,
    });
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "api",
        event: "http.request.completed",
        correlationId: (request as CorrelatedRequest).correlationId ?? null,
        method: request.method,
        route,
        statusCode,
        durationMs: Math.round(durationMs),
      }),
    );
  }
}
