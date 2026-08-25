import { describe, expect, it } from "vitest";

import { evaluateMfaRequirement, type StaffMfaPolicy } from "../src/mfa.js";

const policy: StaffMfaPolicy = {
  requiredRoles: ["owner", "admin"],
};

function evaluate(overrides: Record<string, unknown> = {}) {
  return evaluateMfaRequirement({
    role: "manager",
    mfaSatisfied: false,
    now: "2026-08-25T00:00:00.000Z",
    policy,
    ...overrides,
  });
}

describe("mfa requirement policy", () => {
  it("allows staff with mfa satisfied regardless of role", () => {
    expect(evaluate({ role: "owner", mfaSatisfied: true })).toEqual({
      outcome: "allow",
    });
    expect(evaluate({ mfaSatisfied: true })).toEqual({
      outcome: "allow",
    });
  });

  it("allows roles not covered by the policy even without enrollment", () => {
    expect(evaluate({ role: "member" })).toEqual({ outcome: "allow" });
  });

  it("denies immediately when the role requires mfa and no grace period is configured", () => {
    expect(
      evaluate({
        role: "owner",
        policy: { requiredRoles: ["owner", "admin"] },
      }),
    ).toEqual({
      outcome: "deny_mfa_required",
      role: "owner",
    });
  });

  it("keeps denying within the grace window before expiry", () => {
    const decision = evaluate({
      role: "owner",
      mfaEnrolledAt: "2026-08-01T00:00:00.000Z",
      now: "2026-08-10T23:59:59.999Z",
      policy: { requiredRoles: ["owner"], gracePeriodDays: 14 },
    });

    expect(decision).toEqual({
      outcome: "deny_mfa_required",
      role: "owner",
    });
  });

  it("marks grace as expired exactly at the expiry boundary", () => {
    const decision = evaluate({
      role: "owner",
      mfaEnrolledAt: "2026-08-01T00:00:00.000Z",
      now: "2026-08-15T00:00:00.000Z",
      policy: { requiredRoles: ["owner"], gracePeriodDays: 14 },
    });

    expect(decision).toEqual({
      outcome: "deny_mfa_enforcement_grace_expired",
      role: "owner",
      gracePeriodDays: 14,
      enrolledAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("still denies after grace expiry when enrollment happened but mfa is unsatisfied", () => {
    const decision = evaluate({
      role: "admin",
      mfaEnrolledAt: "2026-07-01T00:00:00.000Z",
      now: "2026-08-25T00:00:00.000Z",
      policy: { requiredRoles: ["admin"], gracePeriodDays: 7 },
    });

    expect(
      decision.outcome === "deny_mfa_enforcement_grace_expired" &&
        decision.enrolledAt === "2026-07-01T00:00:00.000Z",
    ).toBe(true);
  });

  it("falls back to an immediate deny when grace exists but enrollment never started", () => {
    const decision = evaluate({
      role: "admin",
      mfaEnrolledAt: undefined,
      now: "2026-08-25T00:00:00.000Z",
      policy: { requiredRoles: ["admin"], gracePeriodDays: 7 },
    });

    expect(decision).toEqual({
      outcome: "deny_mfa_required",
      role: "admin",
    });
  });

  it("rejects malformed timestamps and non-positive grace periods", () => {
    expect(() => evaluate({ now: "not-a-timestamp" })).toThrowError(
      /now must be an ISO-8601 timestamp/,
    );

    expect(() =>
      evaluate({
        role: "owner",
        mfaEnrolledAt: "2026-13-40T00:00:00.000Z",
        policy: { requiredRoles: ["owner"], gracePeriodDays: 14 },
      }),
    ).toThrowError(/mfaEnrolledAt must be an ISO-8601 timestamp/);

    expect(() =>
      evaluate({
        role: "owner",
        policy: { requiredRoles: ["owner"], gracePeriodDays: 0 },
      }),
    ).toThrowError(/gracePeriodDays must be a positive safe integer/);
  });
});
