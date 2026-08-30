import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { FastifyInstance } from "fastify";
import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  createPostgresPoolFromEnv,
  runMigrations,
  type DatabasePool,
} from "@stack-and-scale/database";
import { AppModule } from "../src/app.module.js";

describe("payment reconciliation and receipts", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let pool: DatabasePool;
  const suffix = randomUUID();
  const organizationId = `org-reconcile-${suffix}`;
  const recorderId = `user-reconcile-recorder-${suffix}`;
  const accountantId = `user-reconcile-accountant-${suffix}`;
  const invoiceId = `invoice-reconcile-${suffix}`;

  beforeAll(async () => {
    process.env["CRM_ORGANIZATION_ID"] = organizationId;
    await runMigrations();
    pool = createPostgresPoolFromEnv();
    await pool.query(
      "INSERT INTO platform.organizations (id,name) VALUES ($1,'Reconciliation test')",
      [organizationId],
    );
    await pool.query(
      "INSERT INTO identity.users (id,external_subject,email) VALUES ($1,$1,$3),($2,$2,$4)",
      [
        recorderId,
        accountantId,
        `${recorderId}@example.test`,
        `${accountantId}@example.test`,
      ],
    );
    await pool.query(
      "INSERT INTO identity.memberships (id,user_id,organization_id,role) VALUES ($1,$2,$3,'manager'),($4,$5,$3,'owner')",
      [
        `membership-${recorderId}`,
        recorderId,
        organizationId,
        `membership-${accountantId}`,
        accountantId,
      ],
    );
    await pool.query(
      `INSERT INTO platform.invoices (id,organization_id,number,status,currency,subtotal_minor_units,total_minor_units,issued_at,issued_by,created_by)
       VALUES ($1,$2,$3,'due','PKR',1000,1000,now(),$4,$4)`,
      [invoiceId, organizationId, `INV-${suffix}`, recorderId],
    );
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
    delete process.env["CRM_ORGANIZATION_ID"];
  });

  it("records and verifies every local method with role separation", async () => {
    for (const [index, method] of [
      "bank_transfer",
      "easypaisa",
      "jazzcash",
      "raast",
      "cash",
    ].entries()) {
      const recorded = await fastify.inject({
        method: "POST",
        url: "/api/v1/invoices/payments",
        headers: { "x-actor-id": recorderId },
        payload: {
          amountMinorUnits: 100,
          currency: "PKR",
          method,
          paymentReference: `reconcile-${suffix}-${index}`,
        },
      });
      expect(recorded.statusCode).toBe(201);
      const paymentId = recorded.json<{ data: { id: string } }>().data.id;
      const verified = await fastify.inject({
        method: "POST",
        url: `/api/v1/invoices/payments/${paymentId}/verify`,
        headers: { "x-actor-id": accountantId },
        payload: { accepted: true, reason: "Evidence checked" },
      });
      expect(verified.statusCode).toBe(201);
    }
  });

  it("persists an idempotent partial match and an explicit mismatch", async () => {
    const recorded = await fastify.inject({
      method: "POST",
      url: "/api/v1/invoices/payments",
      headers: { "x-actor-id": recorderId },
      payload: {
        amountMinorUnits: 1000,
        currency: "PKR",
        method: "cash",
        paymentReference: `match-${suffix}`,
      },
    });
    const paymentId = recorded.json<{ data: { id: string } }>().data.id;
    await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/verify`,
      headers: { "x-actor-id": accountantId },
      payload: { accepted: true, reason: "Cash counted" },
    });
    const payload = {
      invoiceId,
      amountMinorUnits: 500,
      currency: "PKR",
      idempotencyKey: `idem-${suffix}`,
    };
    const first = await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/reconcile`,
      headers: { "x-actor-id": accountantId },
      payload,
    });
    const second = await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/reconcile`,
      headers: { "x-actor-id": accountantId },
      payload,
    });
    expect(
      first.json<{ data: { status: string }; duplicate: boolean }>(),
    ).toMatchObject({
      data: { status: "partially_matched" },
      duplicate: false,
    });
    expect(second.json<{ duplicate: boolean }>()).toMatchObject({
      duplicate: true,
    });

    const mismatch = await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/reconcile`,
      headers: { "x-actor-id": accountantId },
      payload: {
        invoiceId,
        amountMinorUnits: 600,
        currency: "USD",
        idempotencyKey: `mismatch-${suffix}`,
      },
    });
    expect(
      mismatch.json<{ data: { status: string; mismatch_reason: string } }>()
        .data,
    ).toMatchObject({ status: "unmatched" });
  });

  it("creates a deterministic private receipt artifact and protects it", async () => {
    const payment = await pool.query(
      "SELECT id FROM platform.payment_attempts WHERE organization_id=$1 AND payment_reference=$2",
      [organizationId, `match-${suffix}`],
    );
    const paymentId = String(payment.rows[0]?.id);
    const first = await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/receipt`,
      headers: { "x-actor-id": accountantId },
    });
    const second = await fastify.inject({
      method: "POST",
      url: `/api/v1/invoices/payments/${paymentId}/receipt`,
      headers: { "x-actor-id": accountantId },
    });
    expect(first.statusCode).toBe(201);
    expect(
      second.json<{ data: { checksumSha256: string } }>().data.checksumSha256,
    ).toMatch(/^[a-f0-9]{64}$/u);
    const artifact = await pool.query(
      "SELECT checksum_sha256 FROM platform.payment_receipt_artifacts WHERE organization_id=$1",
      [organizationId],
    );
    expect(artifact.rows[0]?.checksum_sha256).toBe(
      second.json<{ data: { checksumSha256: string } }>().data.checksumSha256,
    );
    await expect(
      pool.query(
        "UPDATE platform.payment_receipt_artifacts SET checksum_sha256=$2 WHERE organization_id=$1",
        [organizationId, "0".repeat(64)],
      ),
    ).rejects.toThrow("immutable");
  });
});
