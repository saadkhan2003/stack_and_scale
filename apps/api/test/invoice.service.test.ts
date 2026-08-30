import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  hmacPaymentVerifier,
  reconciliationStatus,
} from "../src/invoices/invoice.service.js";
import { requirePaymentMethod } from "@stack-and-scale/contracts";

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

describe("payment reconciliation", () => {
  it.each(["bank_transfer", "easypaisa", "jazzcash", "raast", "cash"])(
    "accepts the local payment method %s",
    (method) => {
      expect(requirePaymentMethod(method)).toBe(method);
    },
  );

  it("keeps unmatched, partial and matched outcomes explicit", () => {
    expect(reconciliationStatus(0, 1000)).toBe("unmatched");
    expect(reconciliationStatus(400, 1000)).toBe("partially_matched");
    expect(reconciliationStatus(1000, 1000)).toBe("matched");
    expect(reconciliationStatus(1100, 1000)).toBe("unmatched");
  });
});
