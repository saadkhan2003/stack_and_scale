import { describe, expect, it } from "vitest";

import {
  getTaskPresentation,
  sensitiveLeadFields,
} from "../src/staff-lead-inbox";

describe("staff CRM timeline semantics", () => {
  it("marks an incomplete task overdue only after its due time", () => {
    expect(
      getTaskPresentation(
        { completed_at: null, due_at: "2026-08-28T12:00:00.000Z" },
        new Date("2026-08-29T12:00:00.000Z"),
      ),
    ).toEqual({ status: "overdue", priority: "high", isOverdue: true });
    expect(
      getTaskPresentation(
        {
          completed_at: "2026-08-29T11:00:00.000Z",
          due_at: "2026-08-28T12:00:00.000Z",
        },
        new Date("2026-08-29T12:00:00.000Z"),
      ),
    ).toEqual({ status: "completed", priority: "normal", isOverdue: false });
  });

  it("keeps sensitive lead fields explicit and non-editable", () => {
    expect(sensitiveLeadFields).toEqual([
      { key: "email", label: "Email", editable: false },
      { key: "phone", label: "Phone", editable: false },
      { key: "message", label: "Original enquiry", editable: false },
      { key: "consentAt", label: "Consent recorded", editable: false },
    ]);
  });
});
