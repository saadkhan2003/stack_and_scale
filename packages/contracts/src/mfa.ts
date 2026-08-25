import type { StaffRole } from "./authorization.js";

export type StaffMfaPolicy = Readonly<{
  requiredRoles: readonly StaffRole[];
  gracePeriodDays?: number;
}>;

export type MfaRequirementOutcome =
  | "allow"
  | "deny_mfa_required"
  | "deny_mfa_enforcement_grace_expired";

export type MfaRequirementDecision =
  | Readonly<{ outcome: "allow" }>
  | Readonly<{ outcome: "deny_mfa_required"; role: StaffRole }>
  | Readonly<{
      outcome: "deny_mfa_enforcement_grace_expired";
      role: StaffRole;
      gracePeriodDays: number;
      enrolledAt: string;
    }>;

export type EvaluateMfaInput = Readonly<{
  role: StaffRole;
  mfaEnrolledAt?: string;
  mfaSatisfied: boolean;
  now: string;
  policy: StaffMfaPolicy;
}>;

const dayMs = 24 * 60 * 60 * 1000;

function requireTimestamp(value: string, field: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be an ISO-8601 timestamp`);
  }
}

export function evaluateMfaRequirement(
  input: EvaluateMfaInput,
): MfaRequirementDecision {
  requireTimestamp(input.now, "now");

  if (input.mfaEnrolledAt !== undefined) {
    requireTimestamp(input.mfaEnrolledAt, "mfaEnrolledAt");
  }

  if (
    input.policy.gracePeriodDays !== undefined &&
    (!Number.isSafeInteger(input.policy.gracePeriodDays) ||
      input.policy.gracePeriodDays <= 0)
  ) {
    throw new Error("gracePeriodDays must be a positive safe integer");
  }

  if (input.mfaSatisfied || !input.policy.requiredRoles.includes(input.role)) {
    return { outcome: "allow" };
  }

  const gracePeriodDays = input.policy.gracePeriodDays;
  if (
    gracePeriodDays === undefined ||
    input.mfaEnrolledAt === undefined ||
    input.mfaEnrolledAt.trim().length === 0
  ) {
    return { outcome: "deny_mfa_required", role: input.role };
  }

  const expiresAtMs = Date.parse(input.mfaEnrolledAt) + gracePeriodDays * dayMs;

  if (Date.parse(input.now) < expiresAtMs) {
    return { outcome: "deny_mfa_required", role: input.role };
  }

  return {
    outcome: "deny_mfa_enforcement_grace_expired",
    role: input.role,
    gracePeriodDays,
    enrolledAt: input.mfaEnrolledAt,
  };
}
