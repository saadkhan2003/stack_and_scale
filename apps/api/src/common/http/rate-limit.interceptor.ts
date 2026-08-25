import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  Optional,
} from "@nestjs/common";
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { throwError } from "rxjs";
import type { Observable } from "rxjs";

import {
  RATE_LIMIT_OPTIONS,
  RATE_LIMIT_STORE,
  type RateLimitOptions,
  type RateLimitStore,
} from "./rate-limit.store.js";

export const DEFAULT_RATE_LIMIT = 30;
export const DEFAULT_RATE_WINDOW_MS = 60_000;

type RateLimitRequest = FastifyRequest & {
  routeOptions?: { url?: string | undefined };
};

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
    @Optional()
    @Inject(RATE_LIMIT_OPTIONS)
    options?: Partial<RateLimitOptions>,
  ) {
    this.limit = options?.limit ?? DEFAULT_RATE_LIMIT;
    this.windowMs = options?.windowMs ?? DEFAULT_RATE_WINDOW_MS;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RateLimitRequest>();
    const count = this.store.hit(this.resolveKey(request), this.windowMs);

    if (count > this.limit) {
      return throwError(
        () =>
          new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              code: "RATE_LIMITED",
              message: "Too many requests.",
            },
            HttpStatus.TOO_MANY_REQUESTS,
          ),
      );
    }

    return next.handle();
  }

  private resolveKey(request: RateLimitRequest): string {
    const route =
      request.routeOptions?.url ?? request.url.split("?")[0] ?? "unknown";
    const ip = request.ip || "unknown";

    return `${request.method}:${route}:${ip}`;
  }
}
