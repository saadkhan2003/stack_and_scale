import { describe, expect, it } from "vitest";

import {
  authorize,
  isStaffRole,
  permissionsForRole,
  type MembershipSnapshot,
} from "../src/index.js";

function membership(
  overrides: Partial<MembershipSnapshot> = {},
): MembershipSnapshot {
  return {
    organizationId: "org-1",
    actorId: "user-1",
    role: "manager",
    status: "active",
    ...overrides,
  };
}

describe("authorization policy", () => {
  it("denies when there is no membership at all", () => {
    const decision = authorize({
      membership: null,
      organizationId: "org-1",
      permission: "member:read",
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "actor_not_member",
    });
  });

  it("denies cross-organization access without disclosing existence", () => {
    const decision = authorize({
      membership: membership({ organizationId: "org-2" }),
      organizationId: "org-1",
      permission: "member:read",
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "actor_not_member",
    });
  });

  it("denies suspended members even with granted permissions", () => {
    const decision = authorize({
      membership: membership({ status: "suspended", role: "owner" }),
      organizationId: "org-1",
      permission: "audit:read",
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "membership_suspended",
      permission: "audit:read",
    });
  });

  it("denies unknown roles instead of guessing", () => {
    const decision = authorize({
      membership: membership({ role: "superadmin" }),
      organizationId: "org-1",
      permission: "member:read",
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "unknown_role",
    });
  });

  it("allows a granted permission for an active member", () => {
    const decision = authorize({
      membership: membership(),
      organizationId: "org-1",
      permission: "member:invite",
    });

    expect(decision).toEqual({
      allowed: true,
      role: "manager",
      permission: "member:invite",
    });
  });

  it("denies permissions not granted to the role (deny by default)", () => {
    const decision = authorize({
      membership: membership({ role: "member" }),
      organizationId: "org-1",
      permission: "member:manage",
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "permission_not_granted",
      role: "member",
      permission: "member:manage",
    });
  });

  it("only lets owners assign owners and admins assign managers or members", () => {
    const ownerAssigningOwner = authorize({
      membership: membership({ role: "owner" }),
      organizationId: "org-1",
      permission: "role:assign",
      assigningRole: "owner",
    });
    expect(ownerAssigningOwner.allowed).toBe(true);

    const adminAssigningAdmin = authorize({
      membership: membership({ role: "admin" }),
      organizationId: "org-1",
      permission: "role:assign",
      assigningRole: "admin",
    });
    expect(adminAssigningAdmin).toMatchObject({
      allowed: false,
      reason: "permission_not_granted",
    });

    const adminAssigningMember = authorize({
      membership: membership({ role: "admin" }),
      organizationId: "org-1",
      permission: "role:assign",
      assigningRole: "member",
    });
    expect(adminAssigningMember.allowed).toBe(true);
  });

  it("exposes the expected permission sets per role", () => {
    expect(permissionsForRole("owner")).toContain("org:manage");
    expect(permissionsForRole("admin")).not.toContain("org:manage");
    expect(permissionsForRole("manager")).not.toContain("audit:read");
    expect(permissionsForRole("member")).not.toContain("member:invite");
  });

  it("rejects unknown roles in the guard helper", () => {
    expect(isStaffRole("owner")).toBe(true);
    expect(isStaffRole("root")).toBe(false);
  });
});
