import { describe, expect, it } from "vitest";

import { staffAccessState } from "../src/staff-shell";
import { staffNavigation } from "../src/staff-navigation";

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
});
