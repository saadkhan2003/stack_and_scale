import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hmacPaymentVerifier } from "../src/invoices/invoice.service.js";

describe("payment provider boundary", () => {
  it("accepts only a matching HMAC signature and parses explicit statuses", () => {
    const raw = JSON.stringify({
      eventId: "evt-1",
      eventType: "payment.verified",
      organizationId: "org-1",
      paymentAttemptId: "payment-1",
      status: "verified",
    });
    const signature = createHmac("sha256", "secret").update(raw).digest("hex");
    const adapter = hmacPaymentVerifier("secret");
    expect(adapter.verifySignature(raw, signature)).toBe(true);
    expect(adapter.verifySignature(raw, `${signature}x`)).toBe(false);
    const payload = JSON.parse(raw) as Record<string, unknown>;
    expect(adapter.parseEvent(payload)).toMatchObject({
      eventId: "evt-1",
      status: "verified",
    });
  });
});
