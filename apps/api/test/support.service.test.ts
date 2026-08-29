import { describe, expect, it, vi } from "vitest";
import { SupportService } from "../src/support/support.service.js";

describe("support service", () => {
  it("rejects unsupported ticket classifications before database access", async () => {
    const database = { query: vi.fn() };
    const service = new SupportService(database as never);

    await expect(
      service.create("org-1", "actor-1", {
        subject: "Broken",
        description: "Details",
        category: "unsupported",
        severity: "high",
        priority: "urgent",
        slaTargetSeconds: 3600,
      }),
    ).rejects.toThrow("Ticket fields are invalid");
    expect(database.query).not.toHaveBeenCalled();
  });

  it("requires the ticket organization on detail lookup", async () => {
    const database = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new SupportService(database as never);

    await expect(service.get("org-a", "ticket-b")).rejects.toThrow(
      "Support ticket not found",
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id=$1 AND organization_id=$2"),
      ["ticket-b", "org-a"],
    );
  });
});
