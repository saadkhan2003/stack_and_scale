import { describe, expect, it } from "vitest";

import { getMigrationName, shouldApplyMigration } from "../src/index.js";

describe("migration runner helpers", () => {
  it("derives immutable migration names from SQL file paths", () => {
    expect(
      getMigrationName("/repo/packages/database/migrations/0002_privacy.sql"),
    ).toBe("0002_privacy.sql");
  });

  it("applies only migrations absent from the ledger", () => {
    expect(shouldApplyMigration("0002_privacy.sql", [])).toBe(true);
    expect(shouldApplyMigration("0002_privacy.sql", ["0002_privacy.sql"])).toBe(
      false,
    );
  });
});
