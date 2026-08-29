import { describe, expect, it } from "vitest";

import { staffAccessState } from "../src/staff-shell";
import { staffNavigation } from "../src/staff-navigation";
import type { StaffSummary } from "../src/staff-shell";

describe("staff workspace shell", () => {
  it("exposes dashboard and leads as the staff destinations", () => {
    expect(staffNavigation).toEqual([
      { href: "/staff", label: "Dashboard" },
      { href: "/staff/leads", label: "Leads" },
    ]);
  });

  it("keeps access outcomes explicit", () => {
    expect(staffAccessState(401)).toBe("anonymous");
    expect(staffAccessState(403)).toBe("forbidden");
    expect(staffAccessState(503)).toBe("degraded");
    expect(staffAccessState(500)).toBe("error");
  });

  it("defines the dashboard metrics as actionable queue data", () => {
    const summary: StaffSummary = {
      newLeads: [],
      overdueTasks: [],
      upcomingDemos: [],
      stageCounts: [{ stage: "new", count: 2 }],
    };
    expect(summary.stageCounts[0]).toEqual({ stage: "new", count: 2 });
    expect(summary.newLeads).toHaveLength(0);
    expect(summary.overdueTasks).toHaveLength(0);
    expect(summary.upcomingDemos).toHaveLength(0);
  });
});
