import { randomUUID } from "node:crypto";

export const CORRELATION_ID_HEADER = "x-correlation-id";

const SAFE_CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;

export function resolveCorrelationId(value: unknown): string {
  if (typeof value === "string" && SAFE_CORRELATION_ID.test(value)) {
    return value;
  }

  return randomUUID();
}
