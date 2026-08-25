import { describe, expect, it } from "vitest";

import { resolveTenantPlacement } from "../src/index.js";
import type { Queryable, QueryResult } from "../src/queryable.js";

type Row = Record<string, unknown>;

function fakeDb(rows: Row[]): Queryable {
  return {
    async query(): Promise<QueryResult<Row>> {
      return Promise.resolve({ rows });
    },
  };
}

function placementRow(overrides: Partial<Row> = {}): Row {
  return {
    tier: "shared",
    connection_reference: "primary",
    storage_scope: "org-shared",
    migration_state: "ready",
    ...overrides,
  };
}

describe("tenant placement routing", () => {
  it("routes a ready shared placement", async () => {
    const decision = await resolveTenantPlacement(
      fakeDb([placementRow()]),
      "org-1",
    );

    expect(decision).toEqual({
      routable: true,
      placement: {
        organizationId: "org-1",
        tier: "shared",
        connectionReference: "primary",
        storageScope: "org-shared",
        migrationState: "ready",
      },
    });
  });

  it("denies an organization without a placement record", async () => {
    const decision = await resolveTenantPlacement(fakeDb([]), "org-missing");

    expect(decision).toEqual({
      routable: false,
      reason: "unknown_placement",
    });
  });

  it("denies an empty organization id", async () => {
    const decision = await resolveTenantPlacement(fakeDb([]), "  ");

    expect(decision).toEqual({
      routable: false,
      reason: "unknown_placement",
    });
  });

  it("denies a disabled placement instead of falling back to shared", async () => {
    const decision = await resolveTenantPlacement(
      fakeDb([placementRow({ migration_state: "disabled" })]),
      "org-1",
    );

    expect(decision).toEqual({
      routable: false,
      reason: "placement_disabled",
    });
  });

  it("denies a placement mid-migration instead of falling back to shared", async () => {
    const decision = await resolveTenantPlacement(
      fakeDb([placementRow({ migration_state: "migrating" })]),
      "org-1",
    );

    expect(decision).toEqual({
      routable: false,
      reason: "migration_in_progress",
    });
  });

  it("denies an invalid tier value safely", async () => {
    const decision = await resolveTenantPlacement(
      fakeDb([placementRow({ tier: "quantum_isolation" })]),
      "org-1",
    );

    expect(decision).toEqual({
      routable: false,
      reason: "invalid_tier",
    });
  });

  it("accepts dedicated schema and database tiers when ready", async () => {
    for (const tier of ["dedicated_schema", "dedicated_database"]) {
      const decision = await resolveTenantPlacement(
        fakeDb([
          placementRow({
            tier,
            connection_reference: `ref-${tier}`,
            storage_scope: `scope-${tier}`,
          }),
        ]),
        "org-enterprise",
      );

      expect(decision.routable).toBe(true);
      if (decision.routable) {
        expect(decision.placement.tier).toBe(tier);
      }
    }
  });
});
