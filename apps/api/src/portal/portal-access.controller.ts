import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { PortalAccessService } from "./portal-access.service.js";
import { PortalProjectsService } from "./portal-projects.service.js";
import { PortalCommercialService } from "./portal-commercial.service.js";
import { PortalReviewsService } from "./portal-reviews.service.js";
import { PortalSupportService } from "./portal-support.service.js";
import { PortalMembershipsService } from "./portal-memberships.service.js";

@Controller("api/v1/portal/client-organizations")
export class PortalAccessController {
  public constructor(
    @Inject(PortalAccessService)
    private readonly access: PortalAccessService,
    @Inject(PortalProjectsService)
    private readonly projects: PortalProjectsService,
    @Inject(PortalCommercialService)
    private readonly commercial: PortalCommercialService,
    @Inject(PortalReviewsService)
    private readonly reviews: PortalReviewsService,
    @Inject(PortalSupportService)
    private readonly support: PortalSupportService,
    @Inject(PortalMembershipsService)
    private readonly memberships: PortalMembershipsService,
  ) {}

  @Get(":clientOrganizationId/access")
  public async getAccess(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    const principal = await this.access.resolve(request, clientOrganizationId);
    if (principal === null) {
      throw new ForbiddenException("You do not have access to this resource.");
    }
    return {
      clientOrganizationId: principal.clientOrganizationId,
      role: principal.role,
    };
  }

  @Get(":clientOrganizationId/projects")
  public async listProjects(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      projects: await this.projects.list(request, clientOrganizationId),
    };
  }

  @Get(":clientOrganizationId/home")
  public async getHome(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return this.projects.home(request, clientOrganizationId);
  }

  @Get(":clientOrganizationId/projects/:projectId")
  public async getProject(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Param("projectId") projectId: string,
  ) {
    return this.projects.detail(request, clientOrganizationId, projectId);
  }

  @Get(":clientOrganizationId/documents")
  public async listDocuments(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      documents: await this.commercial.documents(request, clientOrganizationId),
    };
  }

  @Get(":clientOrganizationId/files")
  public async listFiles(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      files: await this.commercial.files(request, clientOrganizationId),
    };
  }

  @Get(":clientOrganizationId/support/tickets")
  public async listSupportTickets(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      tickets: await this.support.tickets(request, clientOrganizationId),
    };
  }

  @Post(":clientOrganizationId/support/tickets")
  public async createSupportTicket(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.support.createTicket(request, clientOrganizationId, body);
  }

  @Post(":clientOrganizationId/support/tickets/:ticketId/comments")
  public async addSupportTicketComment(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Param("ticketId") ticketId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.support.addTicketComment(
      request,
      clientOrganizationId,
      ticketId,
      body["body"],
    );
  }

  @Get(":clientOrganizationId/activity")
  public async listActivity(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      activity: await this.support.activity(request, clientOrganizationId),
    };
  }

  @Get(":clientOrganizationId/notification-preferences")
  public async notificationPreferences(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return this.support.preferences(request, clientOrganizationId);
  }

  @Post(":clientOrganizationId/notification-preferences/:category")
  public async updateNotificationPreference(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Param("category") category: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.support.setPreference(
      request,
      clientOrganizationId,
      category,
      body["enabled"],
    );
  }

  @Get(":clientOrganizationId/reviews")
  public async listReviews(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return { reviews: await this.reviews.list(request, clientOrganizationId) };
  }

  @Get(":clientOrganizationId/members")
  public async listMembers(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
  ) {
    return {
      members: await this.memberships.list(request, clientOrganizationId),
    };
  }

  @Post(":clientOrganizationId/members")
  public async addMember(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return {
      member: await this.memberships.add(request, clientOrganizationId, body),
    };
  }

  @Post(":clientOrganizationId/members/:membershipId/revoke")
  public async revokeMember(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Param("membershipId") membershipId: string,
  ) {
    return {
      member: await this.memberships.revoke(
        request,
        clientOrganizationId,
        membershipId,
      ),
    };
  }

  @Post(":clientOrganizationId/reviews/:reviewId/decisions")
  public async decideReview(
    @Req() request: FastifyRequest,
    @Param("clientOrganizationId") clientOrganizationId: string,
    @Param("reviewId") reviewId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.reviews.decide(request, clientOrganizationId, reviewId, {
      idempotencyKey:
        typeof body["idempotencyKey"] === "string"
          ? body["idempotencyKey"]
          : "",
      decision:
        body["decision"] === "accepted" || body["decision"] === "rejected"
          ? body["decision"]
          : "",
      targetVersion:
        typeof body["targetVersion"] === "string" ? body["targetVersion"] : "",
      renderedChecksumSha256:
        typeof body["renderedChecksumSha256"] === "string"
          ? body["renderedChecksumSha256"]
          : "",
      ...(typeof body["comment"] === "string"
        ? { comment: body["comment"] }
        : {}),
    });
  }
}
