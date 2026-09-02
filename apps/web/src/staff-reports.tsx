"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      format === "csv"
        ? `/api/staff/operations/reports/exports?type=${type}`
        : `/api/staff/operations/reports?type=${type}&format=${format}`,
      format === "csv" ? { method: "POST" } : undefined,
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
      const job = (await response.json()) as { data: { id: string } };
      setNotice("CSV export queued. Preparing download...");
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const downloadResponse = await fetch(
          `/api/staff/operations/reports/exports/${encodeURIComponent(job.data.id)}`,
          { cache: "no-store" },
        );
        if (
          downloadResponse.status === 200 &&
          downloadResponse.headers.get("content-type")?.includes("text/csv")
        ) {
          saveBlob(await downloadResponse.blob(), `${type}-report.csv`);
          break;
        }
        if (downloadResponse.ok) {
          const status = (await downloadResponse.json()) as {
            data: { status: string; failureReason?: string };
          };
          if (
            status.data.status === "failed" ||
            status.data.status === "expired"
          ) {
            setNotice(
              status.data.failureReason ?? "CSV export is no longer available.",
            );
            playStaffCue("error");
            return;
          }
        }
        if (attempt === 29) {
          setNotice("CSV export is taking longer than expected.");
          return;
        }
      }
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
        data. JSON reads are synchronous; CSV exports are retained for 24 hours.
      </p>
      <p aria-live="polite" role="status">
        {notice}
      </p>
      <div className="staff-report-controls">
        <Label>
          Report
          <Select
            value={type}
            onValueChange={(value) => setType(value ?? "funnel")}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
            {reportTypes.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </Label>
        <Button
          onClick={() => void download("json")}
          type="button"
        >
          Download JSON
        </Button>
        <Button
          variant="secondary"
          onClick={() => void download("csv")}
          type="button"
        >
          Download CSV
        </Button>
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
