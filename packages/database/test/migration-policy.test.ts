import { describe, expect, it } from "vitest";

import {
  assertMigrationPlan,
  validateMigrationPlan,
} from "../src/migration-policy.js";

describe("migration policy", () => {
  it("accepts a reviewed, additive schema migration with a recovery plan", () => {
    expect(() =>
      assertMigrationPlan({
        name: "0002_add_lead_status",
        kind: "schema",
        compatibility: "additive",
        reviewed: true,
        stagingTested: true,
        backupReady: true,
        recovery: "roll-forward",
        deployed: false,
        modifiedAfterDeployment: false,
      }),
    ).not.toThrow();
  });

  it("rejects an unsafe migration plan with actionable violations", () => {
    expect(
      validateMigrationPlan({
        name: "add status",
        kind: "data",
        compatibility: "breaking",
        reviewed: false,
        stagingTested: false,
        backupReady: false,
        recovery: "none",
        deployed: true,
        modifiedAfterDeployment: true,
        includesSchemaChanges: true,
      }),
    ).toEqual([
      "name must use the immutable NNNN_description format",
      "deployed migrations are immutable",
      "migration must be reviewed before it can run",
      "migration must be tested in staging before it can run",
      "backup readiness is required before a migration can run",
      "migration requires a rollback or roll-forward recovery plan",
      "data migrations must not include schema changes",
      "breaking migrations require a compatibility rollout plan",
    ]);
  });
});
