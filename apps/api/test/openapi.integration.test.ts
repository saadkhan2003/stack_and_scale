import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

type OpenApiTestDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, unknown>;
};

describe("GET /openapi.json", () => {
  it("publishes the implemented API contract", async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication(new FastifyAdapter());
    await app.init();

    const adapter = app.getHttpAdapter() as FastifyAdapter;
    const response = await adapter.getInstance().inject({
      method: "GET",
      url: "/openapi.json",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<OpenApiTestDocument>();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info).toEqual({
      title: "Stack and Scale API",
      version: "0.0.0",
    });
    expect(Object.keys(body.paths).sort()).toEqual([
      "/health",
      "/leads",
      "/leads/{leadId}/bookings",
      "/privacy-requests",
      "/ready",
      "/version",
    ]);

    await app.close();
  });
});
