import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";

import { resolveCorrelationId } from "./correlation-id.js";
import type { CorrelatedRequest } from "./correlated-request.js";

type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
  };
  path: string;
  requestId: string;
  timestamp: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<CorrelatedRequest>();
    const reply = http.getResponse<FastifyReply>();
    const requestId =
      request.correlationId ??
      resolveCorrelationId(request.headers["x-correlation-id"]);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error({
        event: "unhandled_exception",
        exceptionType:
          exception instanceof Error ? exception.name : "UnknownException",
        path: request.url,
        requestId,
      });
    }

    reply.status(status).send(
      this.createEnvelope(exception, status, request.url, requestId),
    );
  }

  private createEnvelope(
    exception: unknown,
    status: number,
    path: string,
    requestId: string,
  ): ErrorEnvelope {
    return {
      error: {
        code: this.errorCode(exception, status),
        message: this.safeMessage(exception, status),
      },
      path,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  private errorCode(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (this.isRecord(response) && typeof response["code"] === "string") {
        return response["code"];
      }
    }

    const statusName = HttpStatus[status];
    return typeof statusName === "string" ? statusName : "HTTP_ERROR";
  }

  private safeMessage(exception: unknown, status: number): string {
    if (!(exception instanceof HttpException)) {
      return "Internal server error";
    }

    const response = exception.getResponse();
    if (typeof response === "string") {
      return response;
    }

    if (this.isRecord(response) && typeof response["message"] === "string") {
      return response["message"];
    }

    return status >= 500 ? "Internal server error" : "Request failed";
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}
