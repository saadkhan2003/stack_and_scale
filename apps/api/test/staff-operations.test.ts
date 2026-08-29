import { describe, expect, it, vi } from "vitest";

import {
  CapacitySnapshotService,
  ReleaseVisibilityService,
} from "../src/operations/operations.service.js";

describe("staff release and capacity visibility", () => {
  it("sanitizes deployment records and reports rollback availability", async () => {
    const fs = await import("node:fs/promises");
    const directory = `/tmp/stack-and-scale-release-${Date.now()}`;
    await fs.mkdir(directory);
    await fs.writeFile(
      `${directory}/current.json`,
      JSON.stringify({
        environment: "production",
        imageTag: "abc1234",
        schemaVersion: "0007_staff_knowledge_reports.sql",
        registryToken: "must-not-leak",
      }),
    );
    await fs.writeFile(
      `${directory}/abc1233.json`,
      JSON.stringify({
        environment: "production",
        imageTag: "abc1233",
        schemaVersion: "0006_staff_notifications.sql",
      }),
    );
    process.env["DEPLOYMENTS_DIR"] = directory;
    const database = {
      readiness: vi.fn().mockResolvedValue({
        status: "ready",
        checks: { migrations: "up", outbox: "up", privacy: "up" },
      }),
    };
    const snapshot = await new ReleaseVisibilityService(
      database as never,
    ).snapshot();
    expect(snapshot.deployedVersion).toBe("abc1234");
    expect(snapshot.rollback).toEqual({
      status: "available",
      targetVersion: "abc1233",
      policy: "forward-only-migrations",
    });
    expect(JSON.stringify(snapshot)).not.toContain("must-not-leak");
    await fs.rm(directory, { recursive: true, force: true });
    delete process.env["DEPLOYMENTS_DIR"];
  });

  it("bounds runtime projections and keeps capacity read-only", async () => {
    const database = {
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: [{ value: 100 }] })
        .mockResolvedValueOnce({ rows: [{ count: 12 }] }),
    };
    const snapshot = await new CapacitySnapshotService(
      database as never,
    ).snapshot();
    expect(snapshot.metrics.connections.current).toBe(12);
    expect(snapshot.metrics.connections.projected).toBe(24);
    expect(snapshot.metrics.connections.limit).toBe(100);
    expect(snapshot.retention).toEqual({
      metricsDays: 14,
      logsDays: 7,
      traces: "disabled-unless-measured",
    });
  });
});
