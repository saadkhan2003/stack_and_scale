import { describe, expect, it } from "vitest";

import {
  authorize,
  isStaffRole,
  permissionsForRole,
  type MembershipSnapshot,
  type Permission,
  type StaffRole,
} from "../src/index.js";

const ROLES: readonly StaffRole[] = ["owner", "admin", "manager", "member"];
const PERMISSIONS: readonly Permission[] = [
  "org:read",
  "org:manage",
  "member:read",
  "member:invite",
  "member:manage",
  "role:assign",
  "audit:read",
  "crm:read",
  "crm:manage",
  "crm:search",
  "approval:read",
  "approval:request",
  "approval:decide",
  "notification:read",
  "notification:manage",
  "knowledge:read",
  "knowledge:manage",
  "report:read",
  "report:export",
];

function membership(role: StaffRole): MembershipSnapshot {
  return {
    organizationId: "org-1",
    actorId: "user-1",
    role,
    status: "active",
  };
}

function decide(
  role: StaffRole,
  permission: Permission,
  assigningRole?: StaffRole,
) {
  return authorize({
    membership: membership(role),
    organizationId: "org-1",
    permission,
    ...(assigningRole === undefined ? {} : { assigningRole }),
  });
}

describe("privilege escalation matrix", () => {
  it("matches permissionsForRole exactly for every StaffRole x Permission", () => {
    for (const role of ROLES) {
      const granted = permissionsForRole(role);
      for (const permission of PERMISSIONS) {
        const decision = decide(role, permission);
        expect(decision.allowed).toBe(granted.includes(permission));
        if (granted.includes(permission)) {
          expect(decision).toEqual({
            allowed: true,
            role,
            permission,
          });
        } else {
          expect(decision).toEqual({
            allowed: false,
            reason: "permission_not_granted",
            role,
            permission,
          });
        }
      }
    }
  });

  it("denies by default when a permission is absent from the role policy", () => {
    expect(permissionsForRole("member")).not.toContain("member:manage");
    expect(decide("member", "member:manage").allowed).toBe(false);
    expect(permissionsForRole("admin")).not.toContain("org:manage");
    expect(decide("admin", "org:manage").allowed).toBe(false);
    expect(permissionsForRole("manager")).not.toContain("audit:read");
    expect(decide("manager", "audit:read").allowed).toBe(false);
  });

  it("prevents member from escalating self or peers via role:assign", () => {
    for (const target of ROLES) {
      expect(decide("member", "role:assign", target).allowed).toBe(false);
      expect(decide("manager", "role:assign", target).allowed).toBe(false);
    }
  });

  it("prevents admin from creating admins or owners", () => {
    expect(decide("admin", "role:assign", "admin").allowed).toBe(false);
    expect(decide("admin", "role:assign", "owner").allowed).toBe(false);
  });

  it("allows admin to assign managers and members only", () => {
    expect(decide("admin", "role:assign", "manager").allowed).toBe(true);
    expect(decide("admin", "role:assign", "member").allowed).toBe(true);
  });

  it("allows owner to assign every role", () => {
    for (const target of ROLES) {
      expect(decide("owner", "role:assign", target)).toEqual({
        allowed: true,
        role: "owner",
        permission: "role:assign",
      });
    }
  });

  it("fails closed for unknown roles even on otherwise-granted permissions", () => {
    const decision = authorize({
      membership: { ...membership("owner"), role: "superadmin" },
      organizationId: "org-1",
      permission: "org:read",
    });
    expect(decision.allowed).toBe(false);
    expect(isStaffRole("superadmin")).toBe(false);
    expect(isStaffRole("owner")).toBe(true);
  });
});
