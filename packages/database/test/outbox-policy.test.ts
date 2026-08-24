import { describe, expect, it } from "vitest";

import {
  calculateRetryDelayMs,
  transitionOutboxEvent,
} from "../src/outbox-policy.js";

describe("outbox policy", () => {
  it("uses bounded exponential retry delays", () => {
    expect(calculateRetryDelayMs({ attempt: 1 })).toBe(1_000);
    expect(calculateRetryDelayMs({ attempt: 4 })).toBe(8_000);
    expect(calculateRetryDelayMs({ attempt: 10, maxDelayMs: 30_000 })).toBe(
      30_000,
    );
  });

  it("allows normal delivery and retry transitions", () => {
    expect(
      transitionOutboxEvent(
        { status: "pending", attempts: 0 },
        { type: "claim" },
      ),
    ).toEqual({ status: "processing", attempts: 1 });

    expect(
      transitionOutboxEvent(
        { status: "processing", attempts: 1 },
        { type: "retry" },
      ),
    ).toEqual({ status: "pending", attempts: 1 });

    expect(
      transitionOutboxEvent(
        { status: "processing", attempts: 1 },
        { type: "deliver" },
      ),
    ).toEqual({ status: "delivered", attempts: 1 });
  });

  it("requires an authorized manual replay for dead-lettered events", () => {
    expect(() =>
      transitionOutboxEvent(
        { status: "dead_letter", attempts: 5 },
        { type: "replay", authorized: false },
      ),
    ).toThrow("manual replay must be authorized");

    expect(
      transitionOutboxEvent(
        { status: "dead_letter", attempts: 5 },
        { type: "replay", authorized: true },
      ),
    ).toEqual({ status: "pending", attempts: 5 });
  });

  it("rejects invalid state transitions", () => {
    expect(() =>
      transitionOutboxEvent(
        { status: "delivered", attempts: 1 },
        { type: "claim" },
      ),
    ).toThrow("cannot claim an outbox event in delivered status");
  });
});
