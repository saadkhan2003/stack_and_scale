import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

const metricsToken = "metrics-test-token-with-at-least-24-characters";

describe("metrics endpoint", () => {
  let app: INestApplication;
  let fastify: FastifyInstance;
  let originalToken: string | undefined;

  beforeEach(async () => {
    originalToken = process.env["METRICS_BEARER_TOKEN"];
    process.env["METRICS_BEARER_TOKEN"] = metricsToken;
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    fastify = (app.getHttpAdapter() as FastifyAdapter).getInstance();
  });

  afterEach(async () => {
    await app.close();
    if (originalToken === undefined) delete process.env["METRICS_BEARER_TOKEN"];
    else process.env["METRICS_BEARER_TOKEN"] = originalToken;
  });

  it("refuses an unauthenticated scrape", async () => {
    const response = await fastify.inject({ method: "GET", url: "/metrics" });
    expect(response.statusCode).toBe(401);
  });

  it("exports redacted request metrics to an authenticated scraper", async () => {
    await fastify.inject({ method: "GET", url: "/health" });
    const response = await fastify.inject({
      method: "GET",
      url: "/metrics",
      headers: { authorization: `Bearer ${metricsToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.body).toContain("stack_and_scale_api_requests_total");
    expect(response.body).toContain('route="/health"');
  });
});
