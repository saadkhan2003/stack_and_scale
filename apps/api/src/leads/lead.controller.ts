import { BadRequestException, Body, ConflictException, Controller, Headers, HttpCode, HttpStatus, Inject, InternalServerErrorException, Param, Post } from "@nestjs/common";

import { LeadService, type LeadIntake } from "./lead.service.js";

type LeadBody = Readonly<{ email?: unknown; name?: unknown; phone?: unknown; message?: unknown; intakeType?: unknown; consent?: unknown; attribution?: unknown; honeypot?: unknown }>;

@Controller("leads")
export class LeadController {
  public constructor(@Inject(LeadService) private readonly leads: LeadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: LeadBody, @Headers("idempotency-key") idempotencyKey: string | undefined, @Headers("x-correlation-id") correlationId: string | undefined) {
    const intake = parseLead(body, idempotencyKey, correlationId);
    return this.leads.create(intake);
  }

  @Post(":leadId/bookings")
  @HttpCode(HttpStatus.CREATED)
  async book(@Param("leadId") leadId: string, @Body() body: Readonly<{ startsAt?: unknown; timezone?: unknown; alternateRequest?: unknown }>, @Headers("x-correlation-id") correlationId: string | undefined) {
    if (typeof body.timezone !== "string" || !isTimezone(body.timezone)) throw new BadRequestException("Choose a valid timezone.");
    const startsAt = typeof body.startsAt === "string" && !Number.isNaN(Date.parse(body.startsAt)) ? body.startsAt : undefined;
    const alternateRequest = typeof body.alternateRequest === "string" && body.alternateRequest.trim().length > 0 ? body.alternateRequest.trim().slice(0, 500) : undefined;
    try { return await this.leads.book(leadId, { ...(startsAt ? { startsAt } : {}), timezone: body.timezone, ...(alternateRequest ? { alternateRequest } : {}), correlationId: correlationId ?? leadId }); } catch (error) { if (isUniqueViolation(error)) throw new ConflictException("That demo time is no longer available."); throw new InternalServerErrorException("Booking could not be recorded."); }
  }
}

function isTimezone(value: string): boolean { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }
function isUniqueViolation(error: unknown): boolean { return error !== null && typeof error === "object" && "code" in error && error.code === "23505"; }

function parseLead(body: LeadBody, idempotencyKey: string | undefined, correlationId: string | undefined): LeadIntake {
  if (body.honeypot !== undefined && body.honeypot !== "") throw new BadRequestException("Unable to submit this request.");
  if (body.consent !== true) throw new BadRequestException("Consent is required to submit your request.");
  if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.email.length > 254) throw new BadRequestException("Enter a valid email address.");
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 120) throw new BadRequestException("Enter your name.");
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 16 || idempotencyKey.length > 200) throw new BadRequestException("A valid idempotency key is required.");
  const intakeType = body.intakeType;
  if (intakeType !== "demo" && intakeType !== "project" && intakeType !== "contact" && intakeType !== "whatsapp") throw new BadRequestException("Choose a valid enquiry type.");
  const text = (value: unknown, maximum: number) => typeof value === "string" && value.trim().length > 0 ? value.trim().slice(0, maximum) : undefined;
  const rawAttribution = body.attribution !== null && typeof body.attribution === "object" && !Array.isArray(body.attribution) ? body.attribution as Record<string, unknown> : {};
  const phone = text(body.phone, 40);
  const message = text(body.message, 4_000);
  const attributionValues = { landingPage: text(rawAttribution["landingPage"], 300), product: text(rawAttribution["product"], 120), service: text(rawAttribution["service"], 120), source: text(rawAttribution["source"], 120), campaign: text(rawAttribution["campaign"], 120), cta: text(rawAttribution["cta"], 120) };
  const attribution = Object.fromEntries(Object.entries(attributionValues).filter(([, value]) => value !== undefined)) as LeadIntake["attribution"];
  return { email: body.email.trim(), name: body.name.trim(), ...(phone ? { phone } : {}), ...(message ? { message } : {}), intakeType, idempotencyKey, correlationId: correlationId ?? idempotencyKey, attribution };
}
