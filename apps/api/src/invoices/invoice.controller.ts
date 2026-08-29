import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  Param,
  Post,
  Get,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { CrmAccessService } from "../crm/crm-access.service.js";
import { InvoiceService, type InvoiceLineInput } from "./invoice.service.js";

@Controller("api/v1/invoices")
export class InvoiceController {
  public constructor(
    @Inject(CrmAccessService) private readonly access: CrmAccessService,
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
  ) {}
  @Get() async list(@Req() request: FastifyRequest) {
    const actor = await this.access.require(request, "crm:read");
    return this.invoices.list(actor.organizationId);
  }
  @Post() async create(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.invoices.create(
      actor.organizationId,
      actor.actorId,
      stringField(body, "number"),
      stringField(body, "currency"),
      optionalString(body.dueAt),
      parseLines(body.lineItems),
    );
  }
  @Post(":invoiceId/submit") async submit(
    @Req() request: FastifyRequest,
    @Param("invoiceId") id: string,
  ) {
    const actor = await this.access.require(request, "approval:request");
    return this.invoices.submit(id, actor.organizationId, actor.actorId);
  }
  @Post(":invoiceId/approve") async approve(
    @Req() request: FastifyRequest,
    @Param("invoiceId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    return this.invoices.approve(
      id,
      actor.organizationId,
      actor.actorId,
      stringField(body, "reason"),
    );
  }
  @Post(":invoiceId/issue") async issue(
    @Req() request: FastifyRequest,
    @Param("invoiceId") id: string,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.invoices.issue(id, actor.organizationId, actor.actorId);
  }
  @Post("payments") async payment(
    @Req() request: FastifyRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.invoices.recordPayment(actor.organizationId, actor.actorId, {
      invoiceId: optionalString(body.invoiceId),
      amountMinorUnits: numberField(body, "amountMinorUnits"),
      currency: stringField(body, "currency"),
      method: stringField(body, "method"),
      proofReference: optionalString(body.proofReference),
      paymentReference: optionalString(body.paymentReference),
      payerName: optionalString(body.payerName),
      payerContact: optionalString(body.payerContact),
      receivedAt: optionalString(body.receivedAt),
      receivingAccountOrTill: optionalString(body.receivingAccountOrTill),
      feeMinorUnits:
        body.feeMinorUnits === undefined
          ? undefined
          : numberField(body, "feeMinorUnits"),
    });
  }
  @Post("payments/:paymentId/verify") async verify(
    @Req() request: FastifyRequest,
    @Param("paymentId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    return this.invoices.verifyPayment(
      id,
      actor.organizationId,
      actor.actorId,
      body.accepted === true,
      stringField(body, "reason"),
    );
  }
  @Post("payments/:paymentId/allocate") async allocate(
    @Req() request: FastifyRequest,
    @Param("paymentId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    if (!Array.isArray(body.allocations))
      throw new BadRequestException("allocations are required.");
    return this.invoices.allocate(
      id,
      actor.organizationId,
      actor.actorId,
      body.allocations.map((value) => {
        const item = value as Record<string, unknown>;
        return {
          invoiceId: stringField(item, "invoiceId"),
          amountMinorUnits: numberField(item, "amountMinorUnits"),
        };
      }),
    );
  }
  @Post("payments/:paymentId/receipt") async receipt(
    @Req() request: FastifyRequest,
    @Param("paymentId") id: string,
  ) {
    const actor = await this.access.require(request, "crm:manage");
    return this.invoices.receipt(id, actor.organizationId, actor.actorId);
  }
  @Post("payments/:paymentId/compensate") async compensate(
    @Req() request: FastifyRequest,
    @Param("paymentId") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const actor = await this.access.require(request, "approval:decide");
    const eventType = body.eventType;
    if (
      eventType !== "reversed" &&
      eventType !== "corrected" &&
      eventType !== "refunded"
    )
      throw new BadRequestException(
        "eventType must be reversed, corrected or refunded.",
      );
    return this.invoices.compensate(
      id,
      actor.organizationId,
      actor.actorId,
      eventType,
      numberField(body, "amountMinorUnits"),
      stringField(body, "reason"),
    );
  }
}

@Controller("api/v1/payment-providers")
export class PaymentProviderController {
  public constructor(
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
  ) {}
  @Post("callback") callback(
    @Headers("x-payment-signature") signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.invoices.callback(JSON.stringify(body), signature ?? "", body);
  }
}
function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== "string" || !value.trim())
    throw new BadRequestException(`${field} is required.`);
  return value.trim();
}
function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function numberField(body: Record<string, unknown>, field: string): number {
  const value = body[field];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new BadRequestException(
      `${field} must be a non-negative safe integer.`,
    );
  return value;
}
function parseLines(value: unknown): InvoiceLineInput[] {
  if (!Array.isArray(value) || value.length === 0)
    throw new BadRequestException("lineItems are required.");
  return value.map((item) => {
    const line = item as Record<string, unknown>;
    const tax = line.tax;
    return {
      description: stringField(line, "description"),
      quantity: numberField(line, "quantity"),
      unitPriceMinorUnits: numberField(line, "unitPriceMinorUnits"),
      ...(tax && typeof tax === "object"
        ? { tax: tax as InvoiceLineInput["tax"] }
        : {}),
    };
  });
}
