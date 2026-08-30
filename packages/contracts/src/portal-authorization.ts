export type ClientRole = "client_admin" | "client_member";
export type PortalMembershipStatus = "active" | "suspended" | "revoked";

export type PortalPrincipal = Readonly<{
  actorId: string;
  clientOrganizationId: string;
  organizationId: string;
  customerId: string;
  role: ClientRole;
}>;

export type PortalAccessInput = Readonly<{
  actorId: string | undefined;
  requestedClientOrganizationId: string;
  membership: Readonly<{
    actorId: string;
    clientOrganizationId: string;
    organizationId: string;
    customerId: string;
    role: string;
    status: string;
    portalAccessEnabled: boolean;
  }> | null;
}>;

export type PortalAccessDecision =
  | Readonly<{ allowed: true; principal: PortalPrincipal }>
  | Readonly<{ allowed: false }>;

/** Portal access is intentionally independent from staff roles and fails closed. */
export function authorizePortalAccess(
  input: PortalAccessInput,
): PortalAccessDecision {
  const { actorId, requestedClientOrganizationId, membership } = input;
  if (
    actorId === undefined ||
    actorId.trim().length === 0 ||
    membership === null ||
    !membership.portalAccessEnabled ||
    membership.actorId !== actorId ||
    membership.clientOrganizationId !== requestedClientOrganizationId ||
    membership.status !== "active" ||
    (membership.role !== "client_admin" && membership.role !== "client_member")
  ) {
    return { allowed: false };
  }

  return {
    allowed: true,
    principal: {
      actorId,
      clientOrganizationId: membership.clientOrganizationId,
      organizationId: membership.organizationId,
      customerId: membership.customerId,
      role: membership.role,
    },
  };
}
