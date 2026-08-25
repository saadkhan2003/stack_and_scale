import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { isStaffRole, type StaffRole } from "@stack-and-scale/contracts";

import { InvitationService } from "./invitation.service.js";

function actorFromRequest(request: FastifyRequest): string | undefined {
  const header = request.headers["x-actor-id"];
  if (Array.isArray(header)) {
    return undefined;
  }
  return header;
}

type CreateBody = { email?: unknown; role?: unknown };
type AcceptBody = { token?: unknown; email?: unknown };

@Controller("api/v1")
export class InvitationController {
  public constructor(
    @Inject(InvitationService)
    private readonly invitations: InvitationService,
  ) {}

  @Post("organizations/:organizationId/invitations")
  public async create(
    @Req() request: FastifyRequest,
    @Param("organizationId") organizationId: string,
    @Body() body: CreateBody,
  ): Promise<{ data: Record<string, unknown> }> {
    if (
      typeof body.email !== "string" ||
      body.email.trim().length === 0 ||
      typeof body.role !== "string" ||
      !isStaffRole(body.role) ||
      body.role === "owner"
    ) {
      throw new BadRequestException(
        "A valid email address and role are required.",
      );
    }

    const decision = await this.invitations.authorizeAction(
      actorFromRequest(request),
      organizationId,
      "member:invite",
      body.role as StaffRole,
    );

    if (!decision.allowed) {
      this.throwDecisionError(decision.reason);
    }

    const actorId = actorFromRequest(request) ?? "";
    const invitation = await this.invitations.create({
      organizationId,
      email: body.email.trim().toLowerCase(),
      role: body.role as StaffRole,
      invitedBy: actorId,
    });

    return {
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    };
  }

  @Post("invitations/:invitationId/accept")
  public async accept(
    @Req() request: FastifyRequest,
    @Param("invitationId") invitationId: string,
    @Body() body: AcceptBody,
  ): Promise<{ data: Record<string, unknown> }> {
    if (typeof body.token !== "string" || body.token.length === 0) {
      throw new ForbiddenException(
        "This invitation cannot be accepted with the provided credentials.",
      );
    }

    const actorId = actorFromRequest(request);

    if (actorId === undefined || actorId.trim().length === 0) {
      throw new UnauthorizedException("Authentication is required.");
    }

    const accepted = await this.invitations.accept({
      id: invitationId,
      token: body.token,
      actorId,
    });

    if (!accepted.accepted) {
      throw new ForbiddenException(
        "This invitation cannot be accepted with the provided credentials.",
      );
    }

    return {
      data: {
        id: accepted.invitation.id,
        organizationId: accepted.invitation.organizationId,
        email: accepted.invitation.email,
        role: accepted.invitation.role,
      },
    };
  }

  private throwDecisionError(
    reason:
      | "unauthenticated"
      | "actor_not_member"
      | "membership_suspended"
      | "permission_not_granted",
  ): void {
    if (reason === "unauthenticated") {
      throw new UnauthorizedException("Authentication is required.");
    }
    throw new ForbiddenException("You do not have access to this resource.");
  }
}
