import { randomUUID } from "node:crypto";

type Queryable = Readonly<{
  query(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
}>;

const reportTypes = new Set([
  "funnel",
  "response-time",
  "workload",
  "conversion",
  "activity",
]);

export async function runReportExportCycle(
  database: Queryable,
): Promise<boolean> {
  await database.query(
    "DELETE FROM platform.report_export_jobs WHERE expires_at <= now() AND status IN ('completed', 'failed', 'expired')",
  );
  const claimed = await database.query(
    `UPDATE platform.report_export_jobs SET status = 'processing', started_at = now()
       WHERE id = (SELECT id FROM platform.report_export_jobs
                    WHERE status = 'pending' AND expires_at > now()
                    ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1)
       RETURNING id, organization_id, requested_by, report_type, from_at, to_at`,
  );
  const job = claimed.rows[0] as
    | {
        id: string;
        organization_id: string;
        requested_by: string;
        report_type: string;
        from_at: string;
        to_at: string;
      }
    | undefined;
  if (!job) return false;
  try {
    if (!reportTypes.has(job.report_type))
      throw new Error("unsupported report type");
    const rows = await queryRows(database, job);
    const csv = toCsv(rows, job.report_type);
    await database.query(
      `UPDATE platform.report_export_jobs SET status = 'completed', csv_body = $2,
         completed_at = now() WHERE id = $1`,
      [job.id, csv],
    );
    await audit(database, job, "staff.report.export.completed", null);
  } catch (error) {
    const reason =
      error instanceof Error ? error.message.slice(0, 500) : "export failed";
    await database.query(
      `UPDATE platform.report_export_jobs SET status = 'failed', failure_reason = $2,
         completed_at = now() WHERE id = $1`,
      [job.id, reason],
    );
    await audit(database, job, "staff.report.export.failed", reason);
  }
  return true;
}

async function queryRows(
  database: Queryable,
  job: {
    report_type: string;
    organization_id: string;
    from_at: string;
    to_at: string;
  },
) {
  const params = [job.organization_id, job.from_at, job.to_at];
  if (job.report_type === "funnel")
    return (
      await database.query(
        "SELECT stage, COUNT(*)::int AS leads FROM platform.leads WHERE organization_id = $1 AND created_at >= $2::timestamptz AND created_at < $3::timestamptz GROUP BY stage ORDER BY stage",
        params,
      )
    ).rows;
  if (job.report_type === "response-time")
    return (
      await database.query(
        "SELECT COUNT(*)::int AS responded_leads, COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (first_activity - created_at)) / 60)::numeric, 2), 0) AS average_minutes FROM (SELECT l.created_at, MIN(a.created_at) AS first_activity FROM platform.leads l JOIN platform.lead_activities a ON a.lead_id = l.id WHERE l.organization_id = $1 AND l.created_at >= $2::timestamptz AND l.created_at < $3::timestamptz GROUP BY l.id, l.created_at) response_times",
        params,
      )
    ).rows;
  if (job.report_type === "workload")
    return (
      await database.query(
        "SELECT COALESCE(t.assignee_id, 'unassigned') AS assignee_id, COUNT(*)::int AS total_tasks, COUNT(*) FILTER (WHERE t.completed_at IS NULL)::int AS open_tasks, COUNT(*) FILTER (WHERE t.completed_at IS NOT NULL)::int AS completed_tasks FROM platform.lead_tasks t JOIN platform.leads l ON l.id = t.lead_id WHERE l.organization_id = $1 AND t.created_at >= $2::timestamptz AND t.created_at < $3::timestamptz GROUP BY t.assignee_id ORDER BY total_tasks DESC LIMIT 200",
        params,
      )
    ).rows;
  if (job.report_type === "conversion")
    return (
      await database.query(
        "SELECT COALESCE(NULLIF(l.source, ''), 'unknown') AS source, COUNT(*)::int AS leads, COUNT(*) FILTER (WHERE l.stage = 'won')::int AS won, ROUND((COUNT(*) FILTER (WHERE l.stage = 'won')::numeric / NULLIF(COUNT(*), 0)) * 100, 2) AS conversion_percent FROM platform.leads l WHERE l.organization_id = $1 AND l.created_at >= $2::timestamptz AND l.created_at < $3::timestamptz GROUP BY l.source ORDER BY leads DESC LIMIT 200",
        params,
      )
    ).rows;
  return (
    await database.query(
      "SELECT a.type, COUNT(*)::int AS activities FROM platform.lead_activities a JOIN platform.leads l ON l.id = a.lead_id WHERE l.organization_id = $1 AND a.created_at >= $2::timestamptz AND a.created_at < $3::timestamptz GROUP BY a.type ORDER BY activities DESC LIMIT 200",
      params,
    )
  ).rows;
}

function toCsv(rows: Record<string, unknown>[], type: string): string {
  const defaults: Record<string, string[]> = {
    funnel: ["stage", "leads"],
    "response-time": ["responded_leads", "average_minutes"],
    workload: ["assignee_id", "total_tasks", "open_tasks", "completed_tasks"],
    conversion: ["source", "leads", "won", "conversion_percent"],
    activity: ["type", "activities"],
  };
  const columns = Object.keys(rows[0] ?? {}).length
    ? Object.keys(rows[0]!)
    : defaults[type]!;
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

async function audit(
  database: Queryable,
  job: { id: string; organization_id: string; requested_by: string },
  action: string,
  reason: string | null,
) {
  await database.query(
    `INSERT INTO platform.audit_events (id, organization_id, actor_id, action, correlation_id, metadata)
     VALUES ($1, $2, $3, $4, $5, jsonb_build_object('exportId', $6::text, 'reason', $7::text))`,
    [
      `audit_${randomUUID()}`,
      job.organization_id,
      job.requested_by,
      action,
      `report-export:${job.id}`,
      job.id,
      reason,
    ],
  );
}
