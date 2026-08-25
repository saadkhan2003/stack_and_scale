import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { INestApplication } from "@nestjs/common";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

describe("POST /privacy-requests", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterEach(async () => {
    await app.close();
  });

  it("accepts a verified privacy request without leaking scoped personal data", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/privacy-requests",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": "privacy-api-001",
      },
      payload: {
        id: "privacy-api-001",
        requesterKind: "account_holder",
        requesterContactId: null,
        organizationId: null,
        requestType: "erasure",
        identityVerified: true,
        scope: { email: "person@example.test" },
        targets: ["contacts", "files"],
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).not.toContain("person@example.test");
    expect(response.json()).toEqual({
      id: "privacy-api-001",
      status: "identity_verified",
      targetCount: 2,
    });
  });

  it("rejects unverified privacy requests", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/privacy-requests",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": "privacy-api-002",
      },
      payload: {
        id: "privacy-api-002",
        requesterKind: "lead",
        requesterContactId: null,
        organizationId: null,
        requestType: "access",
        identityVerified: false,
        scope: {},
        targets: ["leads"],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).not.toContain("person@example.test");
  });
});
