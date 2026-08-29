import { describe, expect, it } from "vitest";

import {
  calculateCommercialTotals,
  createIssuedDocumentVersion,
  createMoney,
  DocumentNumberRegistry,
  formatDocumentNumber,
  roundDecimal,
  transitionCommercialStatus,
} from "../src/index.js";

describe("commercial primitives", () => {
  it("rejects mismatched currencies and non-safe amounts", () => {
    expect(() => createMoney(1.5, "USD")).toThrow("safe integer");
    expect(() =>
      calculateCommercialTotals([
        {
          id: "a",
          description: "A",
          quantity: 1,
          unitPrice: createMoney(100, "USD"),
        },
        {
          id: "b",
          description: "B",
          quantity: 1,
          unitPrice: createMoney(100, "EUR"),
        },
      ]),
    ).toThrow("money currency mismatch");
  });

  it("rounds decimal boundaries deterministically without floating point", () => {
    expect(roundDecimal("1.005", 2)).toBe("1.01");
    expect(roundDecimal("1.004", 2)).toBe("1.00");
    expect(roundDecimal("2.5", 0, "half-even")).toBe("2");
    expect(roundDecimal("3.5", 0, "half-even")).toBe("4");
  });

  it("allows zero and signed money, but rejects negative commercial inputs", () => {
    expect(createMoney(0, "USD").minorUnits).toBe(0);
    expect(createMoney(-25, "USD").minorUnits).toBe(-25);
    expect(() =>
      calculateCommercialTotals([
        {
          id: "a",
          description: "A",
          quantity: 1,
          unitPrice: createMoney(-1, "USD"),
        },
      ]),
    ).toThrow("unitPrice must not be negative");
    expect(() =>
      calculateCommercialTotals([
        {
          id: "a",
          description: "A",
          quantity: 0,
          unitPrice: createMoney(1, "USD"),
        },
      ]),
    ).toThrow("quantity must be positive");
  });

  it("applies configured percentage discount and tax only", () => {
    const totals = calculateCommercialTotals([
      {
        id: "a",
        description: "Configured service",
        quantity: 1,
        unitPrice: createMoney(1000, "USD"),
        discount: { kind: "percentage", valuePercent: "10" },
        tax: {
          code: "configured-tax",
          ratePercent: "7.5",
          jurisdiction: "configured",
        },
      },
    ]);
    expect(totals).toMatchObject({
      subtotal: { minorUnits: 1000 },
      discount: { minorUnits: 100 },
      tax: { minorUnits: 68 },
      total: { minorUnits: 968 },
    });
    expect(() =>
      calculateCommercialTotals([
        {
          id: "a",
          description: "A",
          quantity: 1,
          unitPrice: createMoney(1, "USD"),
          tax: { code: "x", ratePercent: "-1" },
        },
      ]),
    ).toThrow("tax rate");
  });

  it("enforces unique numbering and freezes issued versions deeply", () => {
    const registry = new DocumentNumberRegistry();
    const number = formatDocumentNumber({ prefix: "INV", sequence: 12 });
    registry.reserve(number);
    expect(registry.has(number)).toBe(true);
    expect(() => registry.reserve(number)).toThrow("already reserved");

    const version = createIssuedDocumentVersion({
      documentId: "doc-1",
      version: 1,
      issuedAt: "2026-08-29T00:00:00.000Z",
      payload: { lines: [{ amount: 100 }] },
    });
    expect(Object.isFrozen(version)).toBe(true);
    expect(Object.isFrozen(version.payload)).toBe(true);
    expect(
      () => ((version.payload as { lines: unknown[] }).lines = []),
    ).toThrow();
  });

  it("allows only explicit commercial status transitions", () => {
    expect(transitionCommercialStatus("draft", "pending_approval")).toBe(
      "pending_approval",
    );
    expect(transitionCommercialStatus("due", "partially_paid")).toBe(
      "partially_paid",
    );
    expect(() => transitionCommercialStatus("paid", "draft")).toThrow(
      "invalid commercial status transition",
    );
  });
});
