import { Test } from "@nestjs/testing";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { describe, expect, it } from "vitest";

import { AppModule } from "../src/app.module.js";

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
    expect(response.json()).toMatchObject({
      openapi: "3.1.0",
      info: {
        title: "Stack and Scale API",
        version: "0.0.0",
      },
      paths: {
        "/health": expect.any(Object),
        "/ready": expect.any(Object),
        "/version": expect.any(Object),
        "/privacy-requests": expect.any(Object),
      },
    });

    await app.close();
  });
});
