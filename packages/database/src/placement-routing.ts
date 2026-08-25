import type { Queryable } from "./queryable.js";

export type PlacementTier =
  | "shared"
  | "dedicated_schema"
  | "dedicated_database";

export type TenantPlacement = Readonly<{
  organizationId: string;
  tier: PlacementTier;
  connectionReference: string;
  storageScope: string;
  migrationState: "pending_migration" | "migrating" | "ready" | "disabled";
}>;

const placementTiers = new Set<PlacementTier>([
  "shared",
  "dedicated_schema",
  "dedicated_database",
]);
const readyStates = new Set<TenantPlacement["migrationState"]>(["ready"]);

export type RoutingDecision =
  | Readonly<{
      routable: true;
      placement: TenantPlacement;
    }>
  | Readonly<{
      routable: false;
      reason:
        | "unknown_placement"
        | "placement_disabled"
        | "migration_in_progress"
        | "invalid_tier";
    }>;

type PlacementRow = {
  tier: string;
  connection_reference: string;
  storage_scope: string;
  migration_state: string;
};

/**
 * Resolve a tenant placement for an organization. Fails closed: an unknown
 * organization, disabled placement or in-flight migration never falls back to
 * the shared tier. The registry holds connection references only, never
 * credentials.
 */
export async function resolveTenantPlacement(
  db: Queryable,
  organizationId: string,
): Promise<RoutingDecision> {
  if (organizationId.trim().length === 0) {
    return { routable: false, reason: "unknown_placement" };
  }

  const result = await db.query(
    `SELECT tier, connection_reference, storage_scope, migration_state
       FROM identity.tenant_placements
      WHERE organization_id = $1`,
    [organizationId],
  );

  const row = result.rows[0] as PlacementRow | undefined;
  if (row === undefined) {
    return { routable: false, reason: "unknown_placement" };
  }

  if (!placementTiers.has(row.tier as PlacementTier)) {
    return { routable: false, reason: "invalid_tier" };
  }

  if (
    !readyStates.has(row.migration_state as TenantPlacement["migrationState"])
  ) {
    return {
      routable: false,
      reason:
        row.migration_state === "disabled"
          ? "placement_disabled"
          : "migration_in_progress",
    };
  }

  return {
    routable: true,
    placement: {
      organizationId,
      tier: row.tier as PlacementTier,
      connectionReference: row.connection_reference,
      storageScope: row.storage_scope,
      migrationState: row.migration_state as TenantPlacement["migrationState"],
    },
  };
}
