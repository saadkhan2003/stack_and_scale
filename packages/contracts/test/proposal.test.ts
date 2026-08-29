import { describe, expect, it } from "vitest";
import { createProposalVersion } from "../src/index.js";

describe("proposal contracts", () => {
  it("validates ordered validity dates and versions", () => {
    expect(() =>
      createProposalVersion({
        proposalId: "p",
        version: 1,
        status: "draft",
        validFrom: "2026-09-01T00:00:00Z",
        validUntil: "2026-08-01T00:00:00Z",
      }),
    ).toThrow("validUntil");
    expect(
      createProposalVersion({
        proposalId: "p",
        version: 1,
        status: "draft",
        validFrom: "2026-08-01T00:00:00Z",
        validUntil: "2026-09-01T00:00:00Z",
      }).status,
    ).toBe("draft");
  });
});
