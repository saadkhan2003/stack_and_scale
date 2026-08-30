import { describe, expect, it } from "vitest";

import { authorizePortalReviewDecision } from "../src/portal-review.js";

const review = {
  assignedUserId: "client-user",
  status: "open",
  expiresAt: "2030-01-02T00:00:00.000Z",
  targetVersion: "version-1",
  renderedChecksumSha256: "a".repeat(64),
};

describe("portal review decisions", () => {
  it("allows the exact assigned, open review version", () => {
    expect(
      authorizePortalReviewDecision({
        actorId: "client-user",
        review,
        now: "2030-01-01T00:00:00.000Z",
        targetVersion: "version-1",
        renderedChecksumSha256: "a".repeat(64),
      }),
    ).toBe(true);
  });

  it.each([
    ["foreign reviewer", "other-user", review, "version-1", "a".repeat(64)],
    [
      "expired",
      "client-user",
      { ...review, expiresAt: "2030-01-01T00:00:00.000Z" },
      "version-1",
      "a".repeat(64),
    ],
    ["stale version", "client-user", review, "version-2", "a".repeat(64)],
    ["changed artifact", "client-user", review, "version-1", "b".repeat(64)],
    [
      "revoked review",
      "client-user",
      { ...review, status: "revoked" },
      "version-1",
      "a".repeat(64),
    ],
  ])("denies %s", (_reason, actorId, candidate, targetVersion, checksum) => {
    expect(
      authorizePortalReviewDecision({
        actorId,
        review: candidate,
        now: "2030-01-01T00:00:00.000Z",
        targetVersion,
        renderedChecksumSha256: checksum,
      }),
    ).toBe(false);
  });
});
