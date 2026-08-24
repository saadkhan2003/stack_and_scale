import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const port = Number.parseInt(process.env["API_PORT"] ?? "3100", 10);

  await app.listen(port, "127.0.0.1");
}

void bootstrap();
