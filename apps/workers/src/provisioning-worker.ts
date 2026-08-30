import type { Queryable } from "@stack-and-scale/database";

export type ProvisioningStep = Readonly<{
  requestId: string;
  stepId: string;
  stepKey: string;
  organizationId: string;
}>;

export type ProvisioningExecutor = Readonly<{
  execute(step: ProvisioningStep): Promise<void>;
}>;

export async function runProvisioningCycle(
  database: Queryable,
  executor: ProvisioningExecutor,
): Promise<{ processed: boolean; requestId?: string; status?: string }> {
  const claimed = await database.query(
    `WITH next_step AS (
       SELECT s.id, s.request_id, s.step_key, s.organization_id
         FROM platform.provisioning_steps s
         JOIN platform.provisioning_requests r ON r.id=s.request_id AND r.organization_id=s.organization_id
         LEFT JOIN platform.approval_requests a ON a.id=s.approval_request_id AND a.organization_id=s.organization_id
        WHERE s.status='pending'
          AND (s.retry_at IS NULL OR s.retry_at <= now())
          AND r.status IN ('pending','in_progress')
          AND (NOT (s.privileged OR s.high_cost) OR a.decision='approved')
        ORDER BY s.position, s.updated_at
        FOR UPDATE OF s, r SKIP LOCKED
        LIMIT 1
     )
     UPDATE platform.provisioning_steps s
        SET status='in_progress', started_at=COALESCE(s.started_at, now()), retry_count=s.retry_count+1, updated_at=now()
       FROM next_step n
      WHERE s.id=n.id
      RETURNING n.request_id, n.id AS step_id, n.step_key, n.organization_id`,
  );
  const row = claimed.rows[0];
  if (!row) return { processed: false };
  const step = {
    requestId: String(row.request_id),
    stepId: String(row.step_id),
    stepKey: String(row.step_key),
    organizationId: String(row.organization_id),
  };
  await database.query(
    "UPDATE platform.provisioning_requests SET status='in_progress', started_at=COALESCE(started_at,now()), updated_at=now() WHERE id=$1 AND organization_id=$2 AND status IN ('pending','in_progress')",
    [step.requestId, step.organizationId],
  );
  try {
    await executor.execute(step);
    await database.query(
      "UPDATE platform.provisioning_steps SET status='completed', completed_at=now(), failure_reason=NULL, updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='in_progress'",
      [step.stepId, step.organizationId],
    );
    const completed = await database.query(
      "UPDATE platform.provisioning_requests SET status=CASE WHEN NOT EXISTS (SELECT 1 FROM platform.provisioning_steps WHERE request_id=$1 AND organization_id=$2 AND status <> 'completed') THEN 'completed' ELSE 'in_progress' END, completed_at=CASE WHEN NOT EXISTS (SELECT 1 FROM platform.provisioning_steps WHERE request_id=$1 AND organization_id=$2 AND status <> 'completed') THEN now() ELSE completed_at END, updated_at=now() WHERE id=$1 AND organization_id=$2 RETURNING status",
      [step.requestId, step.organizationId],
    );
    const status = completed.rows[0]?.status;
    return {
      processed: true,
      requestId: step.requestId,
      status: typeof status === "string" ? status : "in_progress",
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "provisioning step failed";
    await database.query(
      "UPDATE platform.provisioning_steps SET status='failed', failure_reason=$3, last_error_at=now(), retry_at=now()+interval '5 minutes', updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='in_progress'",
      [step.stepId, step.organizationId, reason],
    );
    await database.query(
      "UPDATE platform.provisioning_requests SET status='failed', failure_reason=$3, updated_at=now() WHERE id=$1 AND organization_id=$2",
      [step.requestId, step.organizationId, reason],
    );
    return { processed: true, requestId: step.requestId, status: "failed" };
  }
}
