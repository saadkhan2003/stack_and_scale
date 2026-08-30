import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("phase 14.7-14.9 migration", () => {
  it("defines tenant-scoped file, provisioning, communication and audit state", async () => {
    const migration = await readFile(
      "migrations/0015_phase_14_7_14_9_files_provisioning_communications.sql",
      "utf8",
    );

    expect(migration).toContain("platform.private_files");
    expect(migration).toContain("platform.private_file_versions");
    expect(migration).toContain("platform.private_file_download_audits");
    expect(migration).toContain("platform.provisioning_requests");
    expect(migration).toContain("platform.provisioning_steps");
    expect(migration).toContain("platform.communication_templates");
    expect(migration).toContain("platform.commercial_communications");
    expect(migration).toContain("prevent_private_download_audit_mutation");
    expect(migration).toContain("organization_id text NOT NULL");
  });
});
