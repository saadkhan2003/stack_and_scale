import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { CrmAccessService } from "../crm/crm-access.service.js";
import {
  notificationCategories,
  notificationUrgencies,
  NotificationsService,
} from "./notifications.service.js";

@Controller("api/v1/notifications")
export class NotificationsController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  public async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "notification:read");
    return this.notifications.list(actor.organizationId, actor.actorId);
  }

  @Post()
  public async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "notification:manage");
    return this.notifications.create(
      actor.organizationId,
      actor.actorId,
      correlationId(request),
      parseCreate(body),
    );
  }

  @Patch(":notificationId/read")
  public async read(
    @Req() request: FastifyRequest,
    @Param("notificationId") id: string,
  ) {
    const actor = await this.access.require(request, "notification:read");
    return this.notifications.markRead(
      actor.organizationId,
      actor.actorId,
      id,
      actor.actorId,
      correlationId(request),
    );
  }

  @Get("preferences")
  public async preferences(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "notification:read");
    return this.notifications.preferences(actor.organizationId, actor.actorId);
  }

  @Patch("preferences/:category")
  public async preference(
    @Req() request: FastifyRequest,
    @Param("category") category: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "notification:manage");
    if (!isCategory(category) || typeof body["enabled"] !== "boolean")
      throw new BadRequestException(
        "A supported category and enabled boolean are required.",
      );
    return this.notifications.setPreference(
      actor.organizationId,
      actor.actorId,
      category,
      body["enabled"],
      correlationId(request),
    );
  }
}

function isCategory(
  value: unknown,
): value is (typeof notificationCategories)[number] {
  return (
    typeof value === "string" &&
    notificationCategories.includes(
      value as (typeof notificationCategories)[number],
    )
  );
}

function correlationId(request: FastifyRequest): string {
  return (
    (request.headers["x-correlation-id"] as string | undefined)?.trim() ||
    "staff-notification"
  );
}

function isUrgency(
  value: unknown,
): value is (typeof notificationUrgencies)[number] {
  return (
    typeof value === "string" &&
    notificationUrgencies.includes(
      value as (typeof notificationUrgencies)[number],
    )
  );
}

function parseCreate(body: Record<string, unknown>) {
  const text = (key: string): string => {
    const value = body[key];
    if (typeof value !== "string" || !value.trim())
      throw new BadRequestException("Notification fields are required.");
    return value.trim();
  };
  const recipientId = text("recipientId");
  const title = text("title");
  const messageBody = text("body");
  const deepLink = text("deepLink");
  const dedupeKey = text("dedupeKey");
  const category = body["category"];
  const urgency = body["urgency"];
  if (!isCategory(category) || !isUrgency(urgency))
    throw new BadRequestException(
      "Unsupported notification category or urgency.",
    );
  if (
    (deepLink !== "/staff" && !deepLink.startsWith("/staff/")) ||
    deepLink.includes("//") ||
    deepLink.length > 500
  )
    throw new BadRequestException(
      "Deep links must stay within the staff workspace.",
    );
  if (
    title.length > 200 ||
    messageBody.length > 4_000 ||
    dedupeKey.length > 200
  )
    throw new BadRequestException("Notification text is too long.");
  return {
    recipientId,
    category,
    urgency,
    title,
    body: messageBody,
    deepLink,
    dedupeKey,
  };
}
