import { describe, expect, it } from "vitest";

import { runReportExportCycle } from "../src/report-export-worker.js";

describe("report export worker", () => {
  it("claims, renders, completes, and audits a tenant-scoped export", async () => {
    const queries: string[] = [];
    const database = {
      query: (text: string) => {
        queries.push(text);
        if (
          text.startsWith(
            "UPDATE platform.report_export_jobs SET status = 'processing'",
          )
        ) {
          return Promise.resolve({
            rows: [
              {
                id: "export-1",
                organization_id: "org-1",
                requested_by: "user-1",
                report_type: "funnel",
                from_at: "2026-01-01",
                to_at: "2026-01-02",
              },
            ],
          });
        }
        if (text.startsWith("SELECT stage"))
          return Promise.resolve({ rows: [{ stage: "new", leads: 2 }] });
        return Promise.resolve({ rows: [] });
      },
    };
    expect(await runReportExportCycle(database)).toBe(true);
    expect(
      queries.some((query) => query.includes("status = 'completed'")),
    ).toBe(true);
    expect(
      queries.some((query) =>
        query.includes("INSERT INTO platform.audit_events"),
      ),
    ).toBe(true);
  });

  it("does not process when no pending job is available", async () => {
    const database = { query: () => Promise.resolve({ rows: [] }) };
    expect(await runReportExportCycle(database)).toBe(false);
  });
});
