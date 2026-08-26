import { Inject, Injectable } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { TOKEN_VALIDATOR, TokenValidator } from "./token-validator.js";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { parseCookies, SESSION_COOKIE } from "./oidc-flow.service.js";

const DEV_ACTOR_HEADER = "x-actor-id";

function firstHeader(
  request: FastifyRequest,
  name: string,
): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? undefined : value;
}

@Injectable()
export class ActorResolverService {
  public constructor(
    @Inject(TOKEN_VALIDATOR)
    private readonly tokenValidator: TokenValidator,
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  private devFallbackAllowed(): boolean {
    if (process.env["STACK_AND_SCALE_DEV_ACTOR_HEADER"] === "false") {
      return false;
    }
    return process.env["NODE_ENV"] !== "production";
  }

  public async fromRequest(
    request: FastifyRequest,
  ): Promise<string | undefined> {
    const authorization = firstHeader(request, "authorization");
    if (authorization !== undefined && authorization.startsWith("Bearer ")) {
      const result = await this.tokenValidator.validate(
        authorization.slice("Bearer ".length).trim(),
      );
      return result.valid ? result.actorId : undefined;
    }

    const sessionId = parseCookies(firstHeader(request, "cookie"))[SESSION_COOKIE];
    if (sessionId !== undefined) {
      const result = await this.database.query(
        `SELECT user_id FROM identity.sessions
          WHERE id = $1 AND status = 'active' AND expires_at > now()`,
        [sessionId],
      );
      const userId = result.rows[0]?.["user_id"];
      if (typeof userId === "string") return userId;
    }

    if (this.devFallbackAllowed()) {
      const actorId = firstHeader(request, DEV_ACTOR_HEADER);
      return actorId !== undefined && actorId.trim().length > 0
        ? actorId
        : undefined;
    }

    return undefined;
  }
}
