export type StaffRole = "owner" | "admin" | "manager" | "member";

export type Permission =
  | "org:read"
  | "org:manage"
  | "member:read"
  | "member:invite"
  | "member:manage"
  | "role:assign"
  | "audit:read";

const staffRoles = new Set<StaffRole>(["owner", "admin", "manager", "member"]);

type RolePolicy = Readonly<{
  assignableBy: readonly StaffRole[];
  permissions: readonly Permission[];
}>;

/**
 * Deny-by-default role policy. A permission not listed for a role is denied.
 * `owner` is the only role that can assign roles and manage the organization.
 */
const rolePolicies: Readonly<Record<StaffRole, RolePolicy>> = {
  owner: {
    assignableBy: ["owner"],
    permissions: [
      "org:read",
      "org:manage",
      "member:read",
      "member:invite",
      "member:manage",
      "role:assign",
      "audit:read",
    ],
  },
  admin: {
    assignableBy: ["owner"],
    permissions: [
      "org:read",
      "member:read",
      "member:invite",
      "member:manage",
      "role:assign",
      "audit:read",
    ],
  },
  manager: {
    assignableBy: ["owner", "admin"],
    permissions: ["org:read", "member:read", "member:invite"],
  },
  member: {
    assignableBy: ["owner", "admin"],
    permissions: ["org:read", "member:read"],
  },
};

export function isStaffRole(value: string): value is StaffRole {
  return staffRoles.has(value as StaffRole);
}

export function permissionsForRole(role: StaffRole): readonly Permission[] {
  return rolePolicies[role].permissions;
}

export type AuthorizationDecision =
  | Readonly<{ allowed: true; role: StaffRole; permission: Permission }>
  | Readonly<{
      allowed: false;
      reason:
        | "unknown_role"
        | "permission_not_granted"
        | "actor_not_member"
        | "membership_suspended";
      role?: StaffRole;
      permission?: Permission;
    }>;

export type MembershipSnapshot = Readonly<{
  organizationId: string;
  actorId: string;
  role: string;
  status: "active" | "suspended";
}>;

export type AuthorizeInput = Readonly<{
  membership: MembershipSnapshot | null;
  organizationId: string;
  permission: Permission;
  assigningRole?: StaffRole;
}>;

/**
 * Resolve an authorization decision. Fails closed for unknown roles,
 * missing memberships, cross-organization access and suspended members.
 * Authorization always happens before any data retrieval.
 */
export function authorize(input: AuthorizeInput): AuthorizationDecision {
  const { membership } = input;

  if (membership === null) {
    return { allowed: false, reason: "actor_not_member" };
  }

  if (membership.organizationId !== input.organizationId) {
    return { allowed: false, reason: "actor_not_member" };
  }

  if (membership.status === "suspended") {
    return {
      allowed: false,
      reason: "membership_suspended",
      permission: input.permission,
    };
  }

  if (!isStaffRole(membership.role)) {
    return { allowed: false, reason: "unknown_role" };
  }

  const granted = permissionsForRole(membership.role);
  if (!granted.includes(input.permission)) {
    return {
      allowed: false,
      reason: "permission_not_granted",
      role: membership.role,
      permission: input.permission,
    };
  }

  if (input.assigningRole !== undefined) {
    const targetAssignable = rolePolicies[
      input.assigningRole
    ].assignableBy.includes(membership.role);

    if (!targetAssignable) {
      return {
        allowed: false,
        reason: "permission_not_granted",
        role: membership.role,
        permission: input.permission,
      };
    }
  }

  return { allowed: true, role: membership.role, permission: input.permission };
}
