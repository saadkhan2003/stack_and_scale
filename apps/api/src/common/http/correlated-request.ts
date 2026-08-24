import type { FastifyRequest } from "fastify";

export type CorrelatedRequest = FastifyRequest & {
  correlationId?: string;
};
