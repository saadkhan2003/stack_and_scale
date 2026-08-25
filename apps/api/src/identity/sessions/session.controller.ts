import {
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { SessionService } from "./session.service.js";
import { ActorResolverService } from "../../auth/actor-resolver.service.js";
import { RateLimitInterceptor } from "../../common/http/rate-limit.interceptor.js";

@Controller("api/v1/sessions")
@UseInterceptors(RateLimitInterceptor)
export class SessionController {
  public constructor(
    @Inject(SessionService)
    private readonly sessions: SessionService,
    @Inject(ActorResolverService)
    private readonly actorResolver: ActorResolverService,
  ) {}

  @Get()
  public async listOwn(@Req() request: FastifyRequest): Promise<{
    data: unknown;
  }> {
    const actorId = await this.actorResolver.fromRequest(request);
    if (actorId === undefined) {
      throw new UnauthorizedException("Authentication is required.");
    }

    return { data: await this.sessions.listActive(actorId) };
  }

  @Delete(":id")
  public async revoke(
    @Req() request: FastifyRequest,
    @Param("id") sessionId: string,
  ): Promise<{ revoked: boolean }> {
    const actorId = await this.actorResolver.fromRequest(request);
    if (actorId === undefined) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const revoked = await this.sessions.revokeOwn(
      actorId,
      sessionId,
      request.id,
    );
    if (!revoked) {
      throw new NotFoundException("Session not found.");
    }

    return { revoked: true };
  }
}
