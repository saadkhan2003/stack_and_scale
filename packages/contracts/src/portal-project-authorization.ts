import type { PortalPrincipal } from "./portal-authorization.js";

export type PortalProjectGrant = Readonly<{
  actorId: string | null;
  clientOrganizationId: string;
  projectId: string;
  status: string;
}>;

/**
 * Project projections fail closed: client administrators can view their own
 * organization projections; client members need an active, exact project grant.
 */
export function authorizePortalProjectAccess(
  input: Readonly<{
    principal: PortalPrincipal;
    projectClientOrganizationId: string;
    projectId: string;
    grant: PortalProjectGrant | null;
  }>,
): boolean {
  if (
    input.principal.clientOrganizationId !==
      input.projectClientOrganizationId ||
    input.projectId.trim().length === 0
  ) {
    return false;
  }
  if (input.principal.role === "client_admin") {
    return true;
  }
  return (
    input.grant !== null &&
    input.grant.actorId === input.principal.actorId &&
    input.grant.clientOrganizationId === input.principal.clientOrganizationId &&
    input.grant.projectId === input.projectId &&
    input.grant.status === "active"
  );
}
