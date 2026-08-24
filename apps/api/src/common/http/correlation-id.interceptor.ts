import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import type { Observable } from "rxjs";

import {
  CORRELATION_ID_HEADER,
  resolveCorrelationId,
} from "./correlation-id.js";
import type { CorrelatedRequest } from "./correlated-request.js";

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<CorrelatedRequest>();
    const reply = http.getResponse<FastifyReply>();
    const correlationId = resolveCorrelationId(
      request.headers[CORRELATION_ID_HEADER],
    );

    request.correlationId = correlationId;
    reply.header(CORRELATION_ID_HEADER, correlationId);

    return next.handle();
  }
}
