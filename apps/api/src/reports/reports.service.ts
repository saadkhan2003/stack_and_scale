import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { PlatformDatabaseService } from "../platform-database.service.js";

export const reportTypes = [
  "funnel",
  "response-time",
  "workload",
  "conversion",
  "activity",
] as const;
type ReportType = (typeof reportTypes)[number];
type ReportResult = {
  format: "json" | "csv";
  type: ReportType;
  body: unknown;
  meta: Record<string, string>;
};

@Injectable()
export class ReportsService {
  public constructor(
    @Inject(PlatformDatabaseService)
    private readonly database: PlatformDatabaseService,
  ) {}

  public async build(
    organizationId: string,
    actorId: string,
    type: ReportType,
    fromInput?: string,
    toInput?: string,
    timezoneInput?: string,
    formatInput?: string,
    correlationId = "staff-report",
  ): Promise<ReportResult> {
    if (
      (fromInput !== undefined && Number.isNaN(Date.parse(fromInput))) ||
      (toInput !== undefined && Number.isNaN(Date.parse(toInput)))
    ) {
      throw new BadRequestException(
        "Report dates must be valid ISO timestamps.",
      );
    }
    const to = toInput ? new Date(toInput) : new Date();
    const from = fromInput
      ? new Date(fromInput)
      : new Date(to.getTime() - 30 * 86_400_000);
    const timezone = timezoneInput || "UTC";
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone });
    } catch {
      throw new BadRequestException("Timezone must be a valid IANA timezone.");
    }
    if (from >= to || to.getTime() - from.getTime() > 92 * 86_400_000)
      throw new BadRequestException(
        "Report windows must be positive and at most 92 days.",
      );
    if (
      formatInput !== undefined &&
      formatInput !== "json" &&
      formatInput !== "csv"
    )
      throw new BadRequestException("Format must be json or csv.");
    const params = [organizationId, from.toISOString(), to.toISOString()];
    let rows;
    if (type === "funnel")
      rows = (
        await this.database.query(
          "SELECT stage, COUNT(*)::int AS leads FROM platform.leads WHERE organization_id = $1 AND created_at >= $2::timestamptz AND created_at < $3::timestamptz GROUP BY stage ORDER BY stage",
          params,
        )
      ).rows;
    else if (type === "response-time")
      rows = (
        await this.database.query(
          `SELECT COUNT(*)::int AS responded_leads, COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (first_activity - created_at)) / 60)::numeric, 2), 0) AS average_minutes FROM (SELECT l.created_at, MIN(a.created_at) AS first_activity FROM platform.leads l JOIN platform.lead_activities a ON a.lead_id = l.id WHERE l.organization_id = $1 AND l.created_at >= $2::timestamptz AND l.created_at < $3::timestamptz GROUP BY l.id, l.created_at) response_times`,
          params,
        )
      ).rows;
    else if (type === "workload")
      rows = (
        await this.database.query(
          `SELECT COALESCE(t.assignee_id, 'unassigned') AS assignee_id, COUNT(*)::int AS total_tasks, COUNT(*) FILTER (WHERE t.completed_at IS NULL)::int AS open_tasks, COUNT(*) FILTER (WHERE t.completed_at IS NOT NULL)::int AS completed_tasks FROM platform.lead_tasks t JOIN platform.leads l ON l.id = t.lead_id WHERE l.organization_id = $1 AND t.created_at >= $2::timestamptz AND t.created_at < $3::timestamptz GROUP BY t.assignee_id ORDER BY total_tasks DESC LIMIT 200`,
          params,
        )
      ).rows;
    else if (type === "conversion")
      rows = (
        await this.database.query(
          `SELECT COALESCE(NULLIF(l.source, ''), 'unknown') AS source, COUNT(*)::int AS leads, COUNT(*) FILTER (WHERE l.stage = 'won')::int AS won, ROUND((COUNT(*) FILTER (WHERE l.stage = 'won')::numeric / NULLIF(COUNT(*), 0)) * 100, 2) AS conversion_percent FROM platform.leads l WHERE l.organization_id = $1 AND l.created_at >= $2::timestamptz AND l.created_at < $3::timestamptz GROUP BY l.source ORDER BY leads DESC LIMIT 200`,
          params,
        )
      ).rows;
    else
      rows = (
        await this.database.query(
          `SELECT a.type, COUNT(*)::int AS activities FROM platform.lead_activities a JOIN platform.leads l ON l.id = a.lead_id WHERE l.organization_id = $1 AND a.created_at >= $2::timestamptz AND a.created_at < $3::timestamptz GROUP BY a.type ORDER BY activities DESC LIMIT 200`,
          params,
        )
      ).rows;
    const meta = {
      formula: formulaFor(type),
      timezone,
      from: from.toISOString(),
      to: to.toISOString(),
      bounded: "synchronous; maximum 92 days",
    };
    const format = formatInput === "csv" ? "csv" : "json";
    const body = format === "csv" ? toCsv(rows, type) : rows;
    await this.database.query(
      `INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata) VALUES ($1, $2, $3, 'staff.report.exported', $4, jsonb_build_object('reportType', $5::text, 'format', $6::text, 'from', $7::text, 'to', $8::text))`,
      [
        `audit_${randomUUID()}`,
        organizationId,
        actorId,
        correlationId,
        type,
        format,
        from.toISOString(),
        to.toISOString(),
      ],
    );
    return { format, type, body, meta };
  }
}

function formulaFor(type: ReportType): string {
  return {
    funnel: "Lead count grouped by stage at creation time.",
    "response-time":
      "Average minutes from lead creation to the first lead activity; leads without activity are excluded.",
    workload:
      "Tasks created in range grouped by assignee; open means completed_at is null.",
    conversion:
      "Won leads divided by leads, grouped by source, multiplied by 100.",
    activity: "Lead activities grouped by type.",
  }[type];
}

function toCsv(rows: Record<string, unknown>[], type: ReportType): string {
  const defaultColumns: Record<ReportType, string[]> = {
    funnel: ["stage", "leads"],
    "response-time": ["responded_leads", "average_minutes"],
    workload: ["assignee_id", "total_tasks", "open_tasks", "completed_tasks"],
    conversion: ["source", "leads", "won", "conversion_percent"],
    activity: ["type", "activities"],
  };
  const columns = Object.keys(rows[0] ?? {}).length
    ? Object.keys(rows[0] ?? {})
    : defaultColumns[type];
  const cell = (value: unknown) => {
    const text =
      value === null || value === undefined
        ? ""
        : typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ? String(value)
          : JSON.stringify(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  return `${columns.map(cell).join(",")}\n${rows.map((row) => columns.map((column) => cell(row[column])).join(",")).join("\n")}\n`;
}
