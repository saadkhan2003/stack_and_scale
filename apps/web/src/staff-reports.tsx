"use client";

import { useState } from "react";
import { playStaffCue } from "./staff-sfx";

const reportTypes = [
  "funnel",
  "response-time",
  "workload",
  "conversion",
  "activity",
] as const;
export function StaffReports() {
  const [type, setType] = useState<(typeof reportTypes)[number]>("funnel");
  const [notice, setNotice] = useState(
    "Reports use a bounded 30-day window in UTC unless dates are supplied.",
  );
  const download = async (format: "json" | "csv") => {
    const response = await fetch(
      `/api/staff/operations/reports?type=${type}&format=${format}`,
    );
    if (!response.ok) {
      setNotice(
        response.status === 403
          ? "Report access is restricted."
          : "Report generation failed.",
      );
      playStaffCue("error");
      return;
    }
    if (format === "json") {
      const payload = (await response.json()) as Record<string, unknown>;
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      saveBlob(blob, `${type}-report.json`);
    } else {
      saveBlob(await response.blob(), `${type}-report.csv`);
    }
    setNotice(`${type} report downloaded.`);
    playStaffCue("check");
  };
  return (
    <section
      className="staff-crm staff-reports"
      aria-labelledby="reports-heading"
    >
      <p className="eyebrow">Staff operations</p>
      <h1 id="reports-heading">Operational reports</h1>
      <p className="staff-crm-lede">
        Aggregate lead funnel, response time, workload, conversion, and activity
        data. Downloads are synchronous and limited to 92 days.
      </p>
      <p aria-live="polite" role="status">
        {notice}
      </p>
      <div className="staff-report-controls">
        <label>
          Report
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as (typeof reportTypes)[number])
            }
          >
            {reportTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-primary"
          onClick={() => void download("json")}
          type="button"
        >
          Download JSON
        </button>
        <button
          className="button button-secondary"
          onClick={() => void download("csv")}
          type="button"
        >
          Download CSV
        </button>
      </div>
    </section>
  );
}
function saveBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
