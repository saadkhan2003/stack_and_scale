import {
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { SessionService } from "./session.service.js";

function actorFromRequest(request: FastifyRequest): string | undefined {
  const header = request.headers["x-actor-id"];
  if (Array.isArray(header)) {
    return undefined;
  }
  return header;
}

@Controller("api/v1/sessions")
export class SessionController {
  public constructor(
    @Inject(SessionService)
    private readonly sessions: SessionService,
  ) {}

  @Get()
  public async listOwn(@Req() request: FastifyRequest): Promise<{
    data: unknown;
  }> {
    const actorId = actorFromRequest(request);
    if (actorId === undefined || actorId.trim().length === 0) {
      throw new UnauthorizedException("Authentication is required.");
    }

    return { data: await this.sessions.listActive(actorId) };
  }

  @Delete(":id")
  public async revoke(
    @Req() request: FastifyRequest,
    @Param("id") sessionId: string,
  ): Promise<{ revoked: boolean }> {
    const actorId = actorFromRequest(request);
    if (actorId === undefined || actorId.trim().length === 0) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const revoked = await this.sessions.revokeOwn(actorId, sessionId);
    if (!revoked) {
      throw new NotFoundException("Session not found.");
    }

    return { revoked: true };
  }
}
