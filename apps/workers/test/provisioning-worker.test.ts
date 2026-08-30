import { describe, expect, it, vi } from "vitest";
import { runProvisioningCycle } from "../src/provisioning-worker.js";

describe("provisioning worker", () => {
  it("executes an approved step and completes the request when it is the last step", async () => {
    const query = vi.fn((sql: string) =>
      Promise.resolve({
        rows: sql.includes("RETURNING n.request_id")
          ? [
              {
                request_id: "req-1",
                step_id: "step-1",
                step_key: "workspace",
                organization_id: "org-1",
              },
            ]
          : sql.includes("RETURNING status")
            ? [{ status: "completed" }]
            : [],
      }),
    );
    const execute = vi.fn().mockResolvedValue(undefined);
    const result = await runProvisioningCycle({ query } as never, { execute });
    expect(result).toMatchObject({
      processed: true,
      requestId: "req-1",
      status: "completed",
    });
    expect(execute).toHaveBeenCalledWith({
      requestId: "req-1",
      stepId: "step-1",
      stepKey: "workspace",
      organizationId: "org-1",
    });
  });

  it("records a failed step without throwing, so the next cycle can retry it", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            request_id: "req-1",
            step_id: "step-1",
            step_key: "workspace",
            organization_id: "org-1",
          },
        ],
      })
      .mockResolvedValue({ rows: [] });
    const result = await runProvisioningCycle({ query } as never, {
      execute: () => Promise.reject(new Error("quota")),
    });
    expect(result).toMatchObject({ processed: true, status: "failed" });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("status='failed'"),
      expect.arrayContaining(["quota"]),
    );
  });

  it("does not claim a blocked privileged step", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const result = await runProvisioningCycle({ query } as never, {
      execute: () => Promise.resolve(),
    });
    expect(result).toEqual({ processed: false });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("a.decision='approved'"),
    );
  });
});
