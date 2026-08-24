import {
  BadRequestException,
  Controller,
  Get,
  type INestApplication,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
  path: string;
  requestId: string;
  timestamp: string;
};

@Controller("test-errors")
class TestErrorsController {
  @Get("expected")
  expected(): never {
    throw new BadRequestException("The request is invalid");
  }

  @Get("unexpected")
  unexpected(): never {
    throw new Error("database-password-must-never-leak");
  }
}

describe("API foundation", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestErrorsController],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();

    const adapter = app.getHttpAdapter() as FastifyAdapter;
    fastify = adapter.getInstance();
  });

  afterEach(async () => {
    await app.close();
  });

  it("generates a correlation ID and returns it on successful requests", async () => {
    const response = await fastify.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-correlation-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
  });

  it("preserves a valid caller correlation ID", async () => {
    const correlationId = "client-request-01";
    const response = await fastify.inject({
      method: "GET",
      url: "/health",
      headers: { "x-correlation-id": correlationId },
    });

    expect(response.headers["x-correlation-id"]).toBe(correlationId);
  });

  it("replaces an unsafe caller correlation ID", async () => {
    const response = await fastify.inject({
      method: "GET",
      url: "/health",
      headers: { "x-correlation-id": "unsafe value with spaces" },
    });

    expect(response.headers["x-correlation-id"]).not.toBe(
      "unsafe value with spaces",
    );
    expect(response.headers["x-correlation-id"]).toBeTruthy();
  });

  it("reports readiness separately from liveness", async () => {
    const response = await fastify.inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "api",
      status: "ready",
      version: "0.0.0",
      checks: {
        application: "up",
      },
    });
  });

  it("returns a stable safe envelope for expected HTTP errors", async () => {
    const correlationId = "expected-error-01";
    const response = await fastify.inject({
      method: "GET",
      url: "/test-errors/expected",
      headers: { "x-correlation-id": correlationId },
    });

    const body = response.json<ApiErrorBody>();

    expect(response.statusCode).toBe(400);
    expect(typeof body.timestamp).toBe("string");
    expect(body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "The request is invalid",
      },
      path: "/test-errors/expected",
      requestId: correlationId,
      timestamp: body.timestamp,
    });
  });

  it("does not expose unexpected exception details", async () => {
    const correlationId = "unexpected-error-01";
    const response = await fastify.inject({
      method: "GET",
      url: "/test-errors/unexpected",
      headers: { "x-correlation-id": correlationId },
    });

    const body = response.json<ApiErrorBody>();

    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain("database-password-must-never-leak");
    expect(typeof body.timestamp).toBe("string");
    expect(body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
      path: "/test-errors/unexpected",
      requestId: correlationId,
      timestamp: body.timestamp,
    });
  });
});
