import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import {
  calculateCommercialTotals,
  createMoney,
  requireNonNegativeMinorUnits,
  requirePaymentMethod,
} from "@stack-and-scale/contracts";
import { PlatformDatabaseService } from "../platform-database.service.js";

export const PAYMENT_PROVIDER_ADAPTER = Symbol("PAYMENT_PROVIDER_ADAPTER");
export type PaymentProviderEvent = Readonly<{
  provider: string;
  eventId: string;
  eventType: string;
  organizationId: string;
  paymentAttemptId: string;
  status: "pending" | "verified" | "rejected";
}>;
export type PaymentProviderAdapter = Readonly<{
  provider: string;
  verifySignature(rawBody: string, signature: string): boolean;
  parseEvent(body: Record<string, unknown>): PaymentProviderEvent;
}>;
export type InvoiceLineInput = Readonly<{
  description: string;
  quantity: number;
  unitPriceMinorUnits: number;
  tax?:
    | {
        code: string;
        ratePercent: string;
        jurisdiction?: string;
        rounding?: "half-up" | "half-even" | "down" | "up";
      }
    | undefined;
}>;

@Injectable()
export class InvoiceService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(PAYMENT_PROVIDER_ADAPTER)
    private readonly adapter: PaymentProviderAdapter | undefined,
  ) {}

  public async list(organizationId: string) {
    const result = await this.database.query(
      "SELECT id, number, customer_id, status, currency, total_minor_units, due_at, issued_at, created_at, updated_at FROM platform.invoices WHERE organization_id = $1 ORDER BY updated_at DESC LIMIT 200",
      [organizationId],
    );
    return { data: result.rows };
  }

  public async create(
    organizationId: string,
    actorId: string,
    number: string,
    currency: string,
    dueAt: string | undefined,
    lines: readonly InvoiceLineInput[],
  ) {
    if (!/^[A-Z]{3}$/.test(currency) || !number.trim() || lines.length === 0)
      throw new BadRequestException(
        "number, currency and at least one line item are required.",
      );
    const totals = calculateCommercialTotals(
      lines.map((line, index) => ({
        id: `line-${index}`,
        description: line.description,
        quantity: line.quantity,
        unitPrice: createMoney(line.unitPriceMinorUnits, currency),
        ...(line.tax ? { tax: line.tax } : {}),
      })),
    );
    const id = `invoice_${randomUUID()}`;
    const result = await this.database.query(
      "INSERT INTO platform.invoices (id, organization_id, number, status, currency, subtotal_minor_units, discount_minor_units, tax_minor_units, total_minor_units, due_at, created_by) VALUES ($1,$2,$3,'draft',$4,$5,$6,$7,$8,$9::timestamptz,$10) RETURNING id, number, status, currency, total_minor_units, due_at, created_at",
      [
        id,
        organizationId,
        number.trim(),
        currency,
        totals.subtotal.minorUnits,
        totals.discount.minorUnits,
        totals.tax.minorUnits,
        totals.total.minorUnits,
        dueAt ?? null,
        actorId,
      ],
    );
    for (const [position, line] of lines.entries())
      await this.database.query(
        "INSERT INTO platform.invoice_line_items (id, invoice_id, organization_id, description, quantity, unit_price_minor_units, currency, tax_configuration, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)",
        [
          `invoice_line_${randomUUID()}`,
          id,
          organizationId,
          line.description.trim(),
          line.quantity,
          line.unitPriceMinorUnits,
          currency,
          line.tax ? JSON.stringify(line.tax) : null,
          position,
        ],
      );
    return { data: result.rows[0] };
  }

  public async submit(id: string, organizationId: string, actorId: string) {
    const invoice = await this.requireInvoice(id, organizationId);
    if (invoice.status !== "draft")
      throw new ConflictException("Only a draft invoice can be submitted.");
    const approval = await this.database.query(
      "INSERT INTO platform.approval_requests (id, organization_id, requester_id, resource_type, resource_id, reason, expires_at) VALUES ($1,$2,$3,'invoice',$4,$5,now()+interval '7 days') RETURNING id, decision, expires_at",
      [
        `approval_${randomUUID()}`,
        organizationId,
        actorId,
        id,
        `Approve invoice ${String(invoice.number)}`,
      ],
    );
    await this.database.query(
      "UPDATE platform.invoices SET status='pending_approval', updated_at=now() WHERE id=$1 AND organization_id=$2",
      [id, organizationId],
    );
    return {
      data: {
        invoiceId: id,
        status: "pending_approval",
        approval: approval.rows[0],
      },
    };
  }

  public async approve(
    id: string,
    organizationId: string,
    actorId: string,
    reason: string,
  ) {
    const approval = await this.database.query(
      "SELECT id, requester_id, decision, expires_at FROM platform.approval_requests WHERE organization_id=$1 AND resource_type='invoice' AND resource_id=$2 ORDER BY created_at DESC LIMIT 1",
      [organizationId, id],
    );
    const row = approval.rows[0];
    if (
      !row ||
      row.decision !== "pending" ||
      new Date(String(row.expires_at)).getTime() <= Date.now()
    )
      throw new ConflictException("Invoice approval is no longer actionable.");
    if (row.requester_id === actorId)
      throw new ConflictException("Approval requires separation of duties.");
    await this.database.query(
      "UPDATE platform.approval_requests SET decision='approved', approver_id=$3, decided_at=now(), updated_at=now() WHERE id=$1 AND organization_id=$2 AND decision='pending'",
      [row.id, organizationId, actorId],
    );
    const updated = await this.database.query(
      "UPDATE platform.invoices SET status='approved', updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='pending_approval' RETURNING id, status",
      [id, organizationId],
    );
    if (!updated.rows[0])
      throw new ConflictException("Invoice is no longer approvable.");
    await this.audit(organizationId, actorId, "invoice.approved", reason, id);
    return { data: updated.rows[0] };
  }

  public async issue(id: string, organizationId: string, actorId: string) {
    const result = await this.database.query(
      "UPDATE platform.invoices SET status='issued', issued_at=now(), issued_by=$3, updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='approved' RETURNING id, number, status, issued_at",
      [id, organizationId, actorId],
    );
    if (!result.rows[0])
      throw new ConflictException("Only an approved invoice can be issued.");
    await this.database.query(
      "UPDATE platform.invoices SET status='due', updated_at=now() WHERE id=$1 AND status='issued' AND (due_at IS NULL OR due_at <= now())",
      [id],
    );
    return { data: { ...result.rows[0], status: "due" } };
  }

  public async recordPayment(
    organizationId: string,
    actorId: string,
    input: {
      invoiceId?: string | undefined;
      amountMinorUnits: number;
      currency: string;
      method: string;
      proofReference?: string | undefined;
      paymentReference?: string | undefined;
      payerName?: string | undefined;
      payerContact?: string | undefined;
      receivedAt?: string | undefined;
      receivingAccountOrTill?: string | undefined;
      feeMinorUnits?: number | undefined;
    },
  ) {
    requireNonNegativeMinorUnits(input.amountMinorUnits, "amountMinorUnits");
    if (input.amountMinorUnits === 0)
      throw new BadRequestException("amountMinorUnits must be positive.");
    let invoice: Record<string, unknown> | undefined;
    if (input.invoiceId)
      invoice = await this.requireInvoice(input.invoiceId, organizationId);
    if (
      invoice &&
      (invoice.currency !== input.currency || invoice.status === "void")
    )
      throw new ConflictException(
        "Payment currency or invoice state is invalid.",
      );
    const method = requirePaymentMethod(input.method);
    const fee = input.feeMinorUnits ?? 0;
    requireNonNegativeMinorUnits(fee, "feeMinorUnits");
    try {
      const id = `payment_${randomUUID()}`;
      const attempt = await this.database.query(
        "INSERT INTO platform.payment_attempts (id,organization_id,amount_minor_units,currency,method,proof_reference,payment_reference,payer_name,payer_contact,received_at,receiving_account_or_till,fee_minor_units,recorded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11,$12,$13) RETURNING id,status,method,amount_minor_units,currency",
        [
          id,
          organizationId,
          input.amountMinorUnits,
          input.currency,
          method,
          input.proofReference ?? null,
          input.paymentReference ?? null,
          input.payerName ?? null,
          input.payerContact ?? null,
          input.receivedAt ?? null,
          input.receivingAccountOrTill ?? null,
          fee,
          actorId,
        ],
      );
      await this.database.query(
        "INSERT INTO platform.payment_events (id,organization_id,payment_attempt_id,event_type,amount_minor_units,metadata,actor_id) VALUES ($1,$2,$3,'recorded',$4,$5::jsonb,$6)",
        [
          `payment_event_${randomUUID()}`,
          organizationId,
          id,
          input.amountMinorUnits,
          JSON.stringify({ invoiceId: input.invoiceId ?? null }),
          actorId,
        ],
      );
      return { data: attempt.rows[0] };
    } catch (error) {
      if (
        String(error).includes("payment_attempts_proof_unique") ||
        String(error).includes("payment_attempts_reference_unique")
      )
        throw new ConflictException(
          "Payment proof or reference has already been recorded.",
        );
      throw error;
    }
  }

  public async verifyPayment(
    id: string,
    organizationId: string,
    actorId: string,
    accepted: boolean,
    reason: string,
  ) {
    const current = await this.database.query(
      "SELECT * FROM platform.payment_attempts WHERE id=$1 AND organization_id=$2",
      [id, organizationId],
    );
    const row = current.rows[0];
    if (!row) throw new NotFoundException("Payment attempt not found.");
    if (row.recorded_by === actorId)
      throw new ConflictException(
        "Payment verification requires separation of duties.",
      );
    if (row.status !== "pending")
      throw new ConflictException("Payment attempt is no longer pending.");
    const status = accepted ? "verified" : "rejected";
    const updated = await this.database.query(
      "UPDATE platform.payment_attempts SET status=$3, verified_by=$4, verified_at=now() WHERE id=$1 AND organization_id=$2 AND status='pending' RETURNING id,status,amount_minor_units,currency",
      [id, organizationId, status, actorId],
    );
    await this.database.query(
      "INSERT INTO platform.payment_events (id,organization_id,payment_attempt_id,event_type,amount_minor_units,metadata,actor_id) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)",
      [
        `payment_event_${randomUUID()}`,
        organizationId,
        id,
        accepted ? "verified" : "rejected",
        row.amount_minor_units,
        JSON.stringify({ reason }),
        actorId,
      ],
    );
    return { data: updated.rows[0] };
  }

  public async allocate(
    paymentId: string,
    organizationId: string,
    actorId: string,
    allocations: readonly { invoiceId: string; amountMinorUnits: number }[],
  ) {
    const payment = await this.database.query(
      "SELECT amount_minor_units,currency,status FROM platform.payment_attempts WHERE id=$1 AND organization_id=$2",
      [paymentId, organizationId],
    );
    const p = payment.rows[0];
    if (!p) throw new NotFoundException("Payment attempt not found.");
    if (p.status !== "verified")
      throw new ConflictException("Only verified payments can be allocated.");
    const total = allocations.reduce(
      (sum, item) => sum + item.amountMinorUnits,
      0,
    );
    if (
      !Number.isSafeInteger(total) ||
      total <= 0 ||
      total > Number(p.amount_minor_units)
    )
      throw new ConflictException(
        "Allocations exceed the verified payment amount.",
      );
    for (const item of allocations) {
      requireNonNegativeMinorUnits(item.amountMinorUnits, "allocation amount");
      const invoice = await this.requireInvoice(item.invoiceId, organizationId);
      if (invoice.currency !== p.currency)
        throw new ConflictException(
          "Payment and invoice currencies must match.",
        );
      const event = await this.database.query(
        "INSERT INTO platform.payment_events (id,organization_id,payment_attempt_id,event_type,amount_minor_units,metadata,actor_id) VALUES ($1,$2,$3,'allocated',$4,$5::jsonb,$6) RETURNING id",
        [
          `payment_event_${randomUUID()}`,
          organizationId,
          paymentId,
          item.amountMinorUnits,
          JSON.stringify({ invoiceId: item.invoiceId }),
          actorId,
        ],
      );
      const eventId = event.rows[0]?.id;
      if (!eventId)
        throw new ConflictException(
          "Payment allocation event was not recorded.",
        );
      await this.database.query(
        "INSERT INTO platform.payment_allocations (id,organization_id,payment_attempt_id,invoice_id,amount_minor_units,event_id) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          `allocation_${randomUUID()}`,
          organizationId,
          paymentId,
          item.invoiceId,
          item.amountMinorUnits,
          eventId,
        ],
      );
      await this.refreshInvoice(item.invoiceId, organizationId);
    }
    return { data: { paymentId, allocatedMinorUnits: total } };
  }

  public async compensate(
    paymentId: string,
    organizationId: string,
    actorId: string,
    eventType: "reversed" | "corrected" | "refunded",
    amountMinorUnits: number,
    reason: string,
  ) {
    requireNonNegativeMinorUnits(amountMinorUnits, "amountMinorUnits");
    if (amountMinorUnits === 0 || !reason.trim())
      throw new BadRequestException(
        "A positive amount and reason are required.",
      );
    const payment = await this.database.query(
      "SELECT id,status FROM platform.payment_attempts WHERE id=$1 AND organization_id=$2",
      [paymentId, organizationId],
    );
    if (!payment.rows[0])
      throw new NotFoundException("Payment attempt not found.");
    if (payment.rows[0].status !== "verified")
      throw new ConflictException("Only verified payments can be compensated.");
    await this.database.query(
      "INSERT INTO platform.payment_events (id,organization_id,payment_attempt_id,event_type,amount_minor_units,metadata,actor_id) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)",
      [
        `payment_event_${randomUUID()}`,
        organizationId,
        paymentId,
        eventType,
        amountMinorUnits,
        JSON.stringify({ reason }),
        actorId,
      ],
    );
    if (eventType === "refunded")
      await this.database.query(
        "UPDATE platform.invoices SET status='refunded', updated_at=now() WHERE organization_id=$1 AND status='paid' AND id IN (SELECT invoice_id FROM platform.payment_allocations WHERE payment_attempt_id=$2)",
        [organizationId, paymentId],
      );
    return { data: { paymentId, eventType, amountMinorUnits } };
  }

  public async receipt(
    paymentId: string,
    organizationId: string,
    actorId: string,
  ) {
    const result = await this.database.query(
      "INSERT INTO platform.payment_receipts (id,organization_id,payment_attempt_id,receipt_number,issued_by) SELECT $1,organization_id,id,'RCT-' || upper(substr(md5($1),1,10)),$3 FROM platform.payment_attempts WHERE id=$2 AND organization_id=$4 AND status='verified' ON CONFLICT (payment_attempt_id) DO NOTHING RETURNING id,receipt_number,issued_at",
      [`receipt_${randomUUID()}`, paymentId, actorId, organizationId],
    );
    if (!result.rows[0])
      throw new ConflictException(
        "A verified payment is required and a receipt may already exist.",
      );
    return { data: result.rows[0] };
  }

  public async callback(
    rawBody: string,
    signature: string,
    body: Record<string, unknown>,
  ) {
    if (!this.adapter)
      throw new ServiceUnavailableException(
        "Payment provider adapter is not configured.",
      );
    if (!this.adapter.verifySignature(rawBody, signature))
      throw new BadRequestException("Invalid payment provider signature.");
    const event = this.adapter.parseEvent(body);
    const inserted = await this.database.query(
      "INSERT INTO platform.payment_provider_callbacks (id,organization_id,provider,provider_event_id,event_type,signature_valid,payload_sha256,payload) VALUES ($1,$2,$3,$4,$5,true,$6,$7::jsonb) ON CONFLICT (provider,provider_event_id) DO NOTHING RETURNING id",
      [
        `payment_callback_${randomUUID()}`,
        event.organizationId,
        event.provider,
        event.eventId,
        event.eventType,
        createHash("sha256").update(rawBody).digest("hex"),
        rawBody,
      ],
    );
    if (!inserted.rows[0])
      return { data: { duplicate: true, eventId: event.eventId } };
    if (event.status !== "pending")
      await this.verifyPayment(
        event.paymentAttemptId,
        event.organizationId,
        "provider:webhook",
        event.status === "verified",
        `Provider event ${event.eventId}`,
      );
    await this.database.query(
      "UPDATE platform.payment_provider_callbacks SET processed_at=now() WHERE id=$1",
      [inserted.rows[0].id],
    );
    return { data: { duplicate: false, eventId: event.eventId } };
  }

  private async requireInvoice(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const result = await this.database.query(
      "SELECT * FROM platform.invoices WHERE id=$1 AND organization_id=$2",
      [id, organizationId],
    );
    if (!result.rows[0]) throw new NotFoundException("Invoice not found.");
    return result.rows[0];
  }
  private async refreshInvoice(id: string, organizationId: string) {
    await this.database.query(
      "UPDATE platform.invoices i SET status=CASE WHEN COALESCE((SELECT SUM(a.amount_minor_units) FROM platform.payment_allocations a JOIN platform.payment_attempts p ON p.id=a.payment_attempt_id WHERE a.invoice_id=i.id AND p.status='verified'),0) >= i.total_minor_units THEN 'paid' WHEN COALESCE((SELECT SUM(a.amount_minor_units) FROM platform.payment_allocations a JOIN platform.payment_attempts p ON p.id=a.payment_attempt_id WHERE a.invoice_id=i.id AND p.status='verified'),0) > 0 THEN 'partially_paid' ELSE i.status END, updated_at=now() WHERE i.id=$1 AND i.organization_id=$2 AND i.status NOT IN ('void','refunded')",
      [id, organizationId],
    );
  }
  private async audit(
    organizationId: string,
    actorId: string,
    action: string,
    reason: string,
    resourceId: string,
  ) {
    await this.database.query(
      "INSERT INTO platform.audit_events (id,organization_id,actor_id,action,correlation_id,metadata) VALUES ($1,$2,$3,$4,$5,$6::jsonb)",
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        action,
        `invoice-${resourceId}`,
        JSON.stringify({ reason, resourceId }),
      ],
    );
  }
}

export function hmacPaymentVerifier(secret: string): PaymentProviderAdapter {
  return {
    provider: "configured",
    verifySignature(rawBody, signature) {
      const expected = createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      return (
        expected.length === signature.length &&
        timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
      );
    },
    parseEvent(body) {
      const required = [
        "eventId",
        "eventType",
        "organizationId",
        "paymentAttemptId",
        "status",
      ];
      if (
        required.some((key) => typeof body[key] !== "string") ||
        !["pending", "verified", "rejected"].includes(String(body.status))
      )
        throw new BadRequestException("Invalid provider event.");
      return {
        provider: "configured",
        eventId: String(body.eventId),
        eventType: String(body.eventType),
        organizationId: String(body.organizationId),
        paymentAttemptId: String(body.paymentAttemptId),
        status: body.status as PaymentProviderEvent["status"],
      };
    },
  };
}
