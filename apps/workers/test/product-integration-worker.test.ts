import { describe, expect, it, vi } from "vitest";
import { runProductIntegrationRetentionCycle } from "../src/product-integration-worker.js";

describe("product integration retention worker", () => {
  it("removes only bounded heartbeat and delivered-event records", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{}, {}, {}] })
      .mockResolvedValueOnce({ rows: [{}, {}] });
    await expect(
      runProductIntegrationRetentionCycle({ query } as never),
    ).resolves.toEqual({ heartbeats: 3, deliveries: 2 });
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("installation_heartbeats"),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("delivery.status = 'delivered'"),
    );
  });
});
