import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

describe("POST /leads", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterEach(async () => { await app.close(); });

  it("persists an attributed, consented lead exactly once", async () => {
    const payload = { email: "phase9-lead@example.test", name: "Phase Nine", intakeType: "demo", consent: true, message: "I would like to discuss retail operations.", attribution: { landingPage: "/products/retail-operations", product: "retail-operations", source: "direct" } };
    const headers = { "content-type": "application/json", "idempotency-key": "phase9-lead-idempotency-key-001", "x-correlation-id": "phase9-lead-correlation-001" };
    const first = await fastify.inject({ method: "POST", url: "/leads", headers, payload });
    const second = await fastify.inject({ method: "POST", url: "/leads", headers, payload });
    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(first.body).not.toContain(payload.email);
    expect(first.json()).toMatchObject({ status: "created", intakeType: "demo" });
    expect(second.json()).toEqual({ ...first.json(), status: "existing" });
  });

  it("rejects spam and requests without consent", async () => {
    const base = { email: "phase9-reject@example.test", name: "Phase Nine", intakeType: "contact", consent: false };
    const headers = { "content-type": "application/json", "idempotency-key": "phase9-lead-idempotency-key-002" };
    const noConsent = await fastify.inject({ method: "POST", url: "/leads", headers, payload: base });
    const honeypot = await fastify.inject({ method: "POST", url: "/leads", headers, payload: { ...base, consent: true, honeypot: "bot" } });
    expect(noConsent.statusCode).toBe(400);
    expect(honeypot.statusCode).toBe(400);
  });
});
