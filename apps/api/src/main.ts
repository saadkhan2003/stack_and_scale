import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const port = Number.parseInt(process.env["API_PORT"] ?? "3100", 10);
  const host = process.env["API_HOST"] ?? "127.0.0.1";

  app.enableShutdownHooks();
  await app.listen(port, host);
}

void bootstrap();
