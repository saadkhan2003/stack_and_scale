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
import { createCanonicalPdf } from "@stack-and-scale/storage";
import type { Queryable } from "@stack-and-scale/database";
import { PlatformDatabaseService } from "../platform-database.service.js";
import { CanonicalArtifactService } from "../files/canonical-artifact.service.js";

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

export type ReconciliationStatus =
  | "unmatched"
  | "partially_matched"
  | "matched";

export function reconciliationStatus(
  matchedMinorUnits: number,
  outstandingMinorUnits: number,
): ReconciliationStatus {
  if (matchedMinorUnits <= 0 || matchedMinorUnits > outstandingMinorUnits)
    return "unmatched";
  return matchedMinorUnits === outstandingMinorUnits
    ? "matched"
    : "partially_matched";
}

@Injectable()
export class InvoiceService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
    @Inject(PAYMENT_PROVIDER_ADAPTER)
    private readonly adapter: PaymentProviderAdapter | undefined,
    @Inject(CanonicalArtifactService)
    private readonly artifacts: CanonicalArtifactService,
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

  public async reconcile(
    paymentId: string,
    organizationId: string,
    actorId: string,
    input: {
      invoiceId?: string;
      amountMinorUnits: number;
      currency: string;
      idempotencyKey: string;
      correctionOf?: string;
      reason?: string;
    },
  ) {
    requireNonNegativeMinorUnits(input.amountMinorUnits, "amountMinorUnits");
    if (
      input.amountMinorUnits === 0 ||
      !input.idempotencyKey.trim() ||
      !/^[A-Z]{3}$/.test(input.currency)
    )
      throw new BadRequestException(
        "A positive amount, currency and idempotencyKey are required.",
      );
    const requestFingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          paymentId,
          invoiceId: input.invoiceId ?? null,
          amountMinorUnits: input.amountMinorUnits,
          currency: input.currency,
          correctionOf: input.correctionOf ?? null,
        }),
      )
      .digest("hex");

    return this.database.transaction(async (db) => {
      const duplicate = await db.query(
        `SELECT id, payment_attempt_id, invoice_id, allocation_id, status, payment_amount_minor_units, matched_amount_minor_units, currency, mismatch_reason, correction_of, request_fingerprint, created_at
         FROM platform.payment_reconciliations WHERE organization_id=$1 AND idempotency_key=$2`,
        [organizationId, input.idempotencyKey.trim()],
      );
      if (duplicate.rows[0]) {
        if (duplicate.rows[0].request_fingerprint !== requestFingerprint)
          throw new ConflictException(
            "Idempotency key was already used for a different reconciliation.",
          );
        return { data: duplicate.rows[0], duplicate: true };
      }

      const paymentResult = await db.query(
        `SELECT id, amount_minor_units, currency, status FROM platform.payment_attempts
         WHERE id=$1 AND organization_id=$2 FOR UPDATE`,
        [paymentId, organizationId],
      );
      const payment = paymentResult.rows[0];
      if (!payment) throw new NotFoundException("Payment attempt not found.");
      if (payment.status !== "verified")
        throw new ConflictException(
          "Only verified payments can be reconciled.",
        );

      let invoice: Record<string, unknown> | undefined;
      if (input.invoiceId) {
        const invoiceResult = await db.query(
          `SELECT id, currency, total_minor_units, status FROM platform.invoices
           WHERE id=$1 AND organization_id=$2 FOR UPDATE`,
          [input.invoiceId, organizationId],
        );
        invoice = invoiceResult.rows[0];
      }
      const paymentAmount = Number(payment.amount_minor_units);
      let status: ReconciliationStatus = "unmatched";
      let mismatchReason: string | undefined;
      let allocationId: string | undefined;
      const requested = input.amountMinorUnits;
      if (!invoice) mismatchReason = "Invoice was not found for this tenant.";
      else if (
        String(payment.currency) !== input.currency ||
        invoice.currency !== input.currency
      )
        mismatchReason =
          "Payment, reconciliation and invoice currencies must match.";
      else {
        const allocated = await db.query(
          `SELECT COALESCE(SUM(amount_minor_units),0) AS amount FROM platform.payment_allocations
           WHERE organization_id=$1 AND payment_attempt_id=$2`,
          [organizationId, paymentId],
        );
        const available =
          paymentAmount - Number(allocated.rows[0]?.amount ?? 0);
        const invoiceAllocated = await db.query(
          `SELECT COALESCE(SUM(a.amount_minor_units),0) AS amount FROM platform.payment_allocations a
           JOIN platform.payment_attempts p ON p.id=a.payment_attempt_id AND p.organization_id=a.organization_id
           WHERE a.organization_id=$1 AND a.invoice_id=$2 AND p.status='verified'`,
          [organizationId, input.invoiceId],
        );
        const outstanding =
          Number(invoice.total_minor_units) -
          Number(invoiceAllocated.rows[0]?.amount ?? 0);
        if (requested > available)
          mismatchReason =
            "Reconciliation exceeds the unapplied verified payment amount.";
        else if (requested > outstanding)
          mismatchReason =
            "Reconciliation exceeds the invoice outstanding balance.";
        else if (invoice.status === "void" || invoice.status === "refunded")
          mismatchReason = "Invoice is not payable.";
        else {
          status = reconciliationStatus(requested, outstanding);
          const event = await db.query(
            `INSERT INTO platform.payment_events (id,organization_id,payment_attempt_id,event_type,amount_minor_units,metadata,actor_id)
             VALUES ($1,$2,$3,'allocated',$4,$5::jsonb,$6) RETURNING id`,
            [
              `payment_event_${randomUUID()}`,
              organizationId,
              paymentId,
              requested,
              JSON.stringify({
                invoiceId: input.invoiceId,
                reconciliation: true,
              }),
              actorId,
            ],
          );
          allocationId = `allocation_${randomUUID()}`;
          const eventId = event.rows[0]?.id;
          if (!eventId)
            throw new ConflictException("Payment event was not recorded.");
          await db.query(
            `INSERT INTO platform.payment_allocations (id,organization_id,payment_attempt_id,invoice_id,amount_minor_units,event_id)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
              allocationId,
              organizationId,
              paymentId,
              input.invoiceId,
              requested,
              eventId,
            ],
          );
        }
      }
      const reconciliation = await db.query(
        `INSERT INTO platform.payment_reconciliations
         (id,organization_id,payment_attempt_id,invoice_id,allocation_id,idempotency_key,request_fingerprint,status,payment_amount_minor_units,matched_amount_minor_units,currency,mismatch_reason,correction_of,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING id, payment_attempt_id, invoice_id, allocation_id, idempotency_key, status, payment_amount_minor_units, matched_amount_minor_units, currency, mismatch_reason, correction_of, request_fingerprint, created_at`,
        [
          `reconciliation_${randomUUID()}`,
          organizationId,
          paymentId,
          input.invoiceId ?? null,
          allocationId ?? null,
          input.idempotencyKey.trim(),
          requestFingerprint,
          status,
          paymentAmount,
          status === "unmatched" ? 0 : requested,
          input.currency,
          mismatchReason ?? null,
          input.correctionOf ?? null,
          actorId,
        ],
      );
      await db.query(
        `INSERT INTO platform.accounting_reconciliation_events (id,organization_id,source_kind,source_id,event_type,correction_of,metadata)
         VALUES ($1,$2,'payment_reconciliation',$3,$4,$5,$6::jsonb)`,
        [
          `reconciliation_event_${randomUUID()}`,
          organizationId,
          reconciliation.rows[0]?.id,
          input.correctionOf
            ? "corrected"
            : status === "unmatched"
              ? "unmatched"
              : "matched",
          input.correctionOf ?? null,
          JSON.stringify({
            status,
            paymentId,
            invoiceId: input.invoiceId ?? null,
            reason: input.reason ?? mismatchReason ?? null,
          }),
        ],
      );
      if (input.invoiceId && status !== "unmatched")
        await this.refreshInvoice(input.invoiceId, organizationId, db);
      return { data: reconciliation.rows[0], duplicate: false };
    });
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
    await this.database.query(
      `INSERT INTO platform.accounting_reconciliation_events (id,organization_id,source_kind,source_id,event_type,metadata)
       VALUES ($1,$2,'payment_compensation',$3,$4,$5::jsonb)`,
      [
        `reconciliation_event_${randomUUID()}`,
        organizationId,
        paymentId,
        eventType === "reversed" ? "reversed" : "corrected",
        JSON.stringify({ paymentId, eventType, amountMinorUnits, reason }),
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
    const payment = await this.database.query(
      `SELECT id, amount_minor_units, currency, method, payment_reference, received_at, created_at
       FROM platform.payment_attempts WHERE id=$1 AND organization_id=$2 AND status='verified'`,
      [paymentId, organizationId],
    );
    if (!payment.rows[0])
      throw new ConflictException("A verified payment is required.");
    const current = await this.database.query(
      `SELECT id, receipt_number, issued_at FROM platform.payment_receipts WHERE payment_attempt_id=$1 AND organization_id=$2`,
      [paymentId, organizationId],
    );
    let receipt = current.rows[0];
    if (!receipt) {
      await this.database.query(
        `INSERT INTO platform.payment_receipts (id,organization_id,payment_attempt_id,receipt_number,issued_by)
         VALUES ($1,$2,$3,'RCT-' || upper(substr(md5($1),1,10)),$4)
         ON CONFLICT (payment_attempt_id) DO NOTHING`,
        [`receipt_${randomUUID()}`, organizationId, paymentId, actorId],
      );
      receipt = (
        await this.database.query(
          `SELECT id, receipt_number, issued_at FROM platform.payment_receipts WHERE payment_attempt_id=$1 AND organization_id=$2`,
          [paymentId, organizationId],
        )
      ).rows[0];
    }
    if (!receipt) throw new ConflictException("Receipt could not be issued.");
    const allocations = await this.database.query(
      `SELECT i.number, a.amount_minor_units FROM platform.payment_allocations a JOIN platform.invoices i ON i.id=a.invoice_id AND i.organization_id=a.organization_id
       WHERE a.organization_id=$1 AND a.payment_attempt_id=$2 ORDER BY a.created_at`,
      [organizationId, paymentId],
    );
    const paymentReference =
      typeof payment.rows[0].payment_reference === "string"
        ? payment.rows[0].payment_reference
        : undefined;
    const issuedAt = new Date(
      String(payment.rows[0].received_at ?? payment.rows[0].created_at),
    ).toISOString();
    const pdf = createCanonicalPdf({
      title: "Payment receipt",
      documentNumber: String(receipt.receipt_number),
      currency: String(payment.rows[0].currency),
      issuedAt,
      lineItems:
        allocations.rows.length > 0
          ? allocations.rows.map((row) => ({
              description: `Invoice ${String(row.number)}`,
              quantity: 1,
              unitPriceMinorUnits: Number(row.amount_minor_units),
              totalMinorUnits: Number(row.amount_minor_units),
            }))
          : [
              {
                description: "Unmatched payment",
                quantity: 1,
                unitPriceMinorUnits: Number(payment.rows[0].amount_minor_units),
                totalMinorUnits: Number(payment.rows[0].amount_minor_units),
              },
            ],
      evidence: [
        { label: "Payment attempt", value: paymentId },
        { label: "Method", value: String(payment.rows[0].method) },
        ...(paymentReference
          ? [{ label: "Payment reference", value: paymentReference }]
          : []),
      ],
    });
    await this.artifacts.retainPaymentReceipt({
      organizationId,
      actorId,
      receiptId: String(receipt.id),
      paymentAttemptId: paymentId,
      receiptNumber: String(receipt.receipt_number),
      body: pdf.body,
      checksumSha256: pdf.checksumSha256,
    });
    const access = await this.artifacts.signedPaymentReceiptAccess(
      organizationId,
      actorId,
      String(receipt.id),
    );
    return {
      data: {
        ...receipt,
        checksumSha256: pdf.checksumSha256,
        signedAccess: access.data,
      },
    };
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
  private async refreshInvoice(
    id: string,
    organizationId: string,
    database: Queryable = this.database,
  ) {
    await database.query(
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
