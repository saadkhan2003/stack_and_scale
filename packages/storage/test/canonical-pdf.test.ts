import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { createCanonicalPdf } from "../src/index.js";

const input = {
  title: "Proposal (canonical) \\ v1",
  documentNumber: "PROP-0001",
  currency: "USD",
  issuedAt: "2026-08-30T12:00:00.000Z",
  validUntil: "2026-09-30T12:00:00.000Z",
  notes: "Line one\r\nLine two",
  lineItems: [
    {
      description: "Implementation (core)",
      quantity: 2,
      unitPriceMinorUnits: 1250,
      totalMinorUnits: 2500,
    },
  ],
  evidence: [{ label: "Acceptance", value: "Not a qualified signature" }],
} as const;

describe("canonical PDF", () => {
  it("produces deterministic bytes and a matching content hash", () => {
    const first = createCanonicalPdf(input);
    const second = createCanonicalPdf({ ...input });

    expect(first.body.equals(second.body)).toBe(true);
    expect(first.checksumSha256).toBe(
      createHash("sha256").update(first.body).digest("hex"),
    );
  });

  it("escapes PDF delimiters and normalizes text", () => {
    const pdf = createCanonicalPdf(input).body.toString("ascii");

    expect(pdf).toContain("Proposal \\(canonical\\) \\\\ v1");
    expect(pdf).toContain("Line one Line two");
    expect(pdf).toContain("Not a qualified signature");
    expect(pdf).toContain("/CreationDate (D:20260830120000Z)");
  });

  it("renders a deterministic visual brand header", () => {
    const pdf = createCanonicalPdf({
      ...input,
      brand: { name: "Stack & Scale", primaryRgb: [11, 22, 22] },
    }).body.toString("ascii");

    expect(pdf).toContain("(Stack & Scale) Tj");
    expect(pdf).toContain("0.043137 0.086275 0.086275 rg");
    expect(pdf).toContain("0 g");
  });

  it("rejects an invalid brand color", () => {
    expect(() =>
      createCanonicalPdf({
        ...input,
        brand: { name: "Stack & Scale", primaryRgb: [256, 22, 22] },
      }),
    ).toThrow("brand primaryRgb components");
  });
});
