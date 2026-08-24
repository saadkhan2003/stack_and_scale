import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("privacy and DLQ migration", () => {
  it("defines privacy operation tables and DLQ recovery fields", async () => {
    const migration = await readFile(
      "migrations/0002_privacy_operations_v1.sql",
      "utf8",
    );

    expect(migration).toContain("CREATE TABLE IF NOT EXISTS platform.privacy_requests");
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS platform.privacy_request_targets",
    );
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS platform.legal_holds");
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS platform.consent_evidence",
    );
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS last_error");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS replay_authorized_by");
  });
});
