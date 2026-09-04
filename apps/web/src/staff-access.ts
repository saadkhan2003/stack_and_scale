import type { StaffAccessState } from "./staff-shell";
import type { StaffSummary } from "./staff-shell";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export type StaffAccessResult = Readonly<{
  state: Exclude<StaffAccessState, "loading">;
  summary: StaffSummary | null;
}>;

export const mockStaffSummary: StaffSummary = {
  newLeads: [
    {
      id: "lead-dev-1",
      name: "Apex Global Retail",
      email: "ops@apexretail.io",
      intakeType: "Enterprise POS & Edge Sync",
      createdAt: "2026-09-04T12:00:00Z",
    },
    {
      id: "lead-dev-2",
      name: "Vanguard Autonomous Labs",
      email: "security@vanguardlabs.ai",
      intakeType: "Self-Hosted Agent Infrastructure",
      createdAt: "2026-09-04T11:00:00Z",
    },
    {
      id: "lead-dev-3",
      name: "Nexus Logistics GmbH",
      email: "contact@nexus-logistics.de",
      intakeType: "Event Queue Orchestration",
      createdAt: "2026-09-04T09:30:00Z",
    },
  ],
  overdueTasks: [
    {
      id: "task-dev-1",
      leadId: "lead-dev-1",
      title: "Review multi-region edge sync architecture diagram",
      dueAt: "2026-09-04T08:00:00Z",
      leadName: "Apex Global Retail",
      leadEmail: "ops@apexretail.io",
    },
    {
      id: "task-dev-2",
      leadId: "lead-dev-2",
      title: "Finalize Keycloak OIDC realm configuration specification",
      dueAt: "2026-09-04T07:30:00Z",
      leadName: "Vanguard Autonomous Labs",
      leadEmail: "security@vanguardlabs.ai",
    },
  ],
  upcomingDemos: [
    {
      id: "demo-dev-1",
      leadId: "lead-dev-1",
      startsAt: "2026-09-05T14:00:00Z",
      timezone: "UTC",
      leadName: "Apex Global Retail",
      leadEmail: "ops@apexretail.io",
    },
    {
      id: "demo-dev-2",
      leadId: "lead-dev-3",
      startsAt: "2026-09-06T10:00:00Z",
      timezone: "CET",
      leadName: "Nexus Logistics GmbH",
      leadEmail: "contact@nexus-logistics.de",
    },
  ],
  stageCounts: [
    { stage: "NEW_INTAKE", count: 8 },
    { stage: "QUALIFIED", count: 14 },
    { stage: "DEMO_SCHEDULED", count: 6 },
    { stage: "PROPOSAL_PENDING", count: 4 },
    { stage: "CONTRACT_ACTIVE", count: 12 },
  ],
  unresolvedSupportItems: [
    {
      id: "supp-dev-1",
      title: "ClamAV virus definitions automated mirror healthcheck",
      status: "INVESTIGATING",
      severity: "LOW",
      updatedAt: "2026-09-04T12:15:00Z",
    },
  ],
  pendingApprovals: [
    {
      id: "appr-dev-1",
      resourceType: "Infrastructure Migration",
      resourceId: "cluster-v3-deployment",
      expiresAt: "2026-09-05T18:00:00Z",
      reminderAt: null,
    },
  ],
};

export async function resolveStaffAccess(
  cookie: string,
): Promise<StaffAccessResult> {
  try {
    const response = await fetch(`${apiOrigin}/api/v1/crm/summary`, {
      headers: { cookie, "x-correlation-id": crypto.randomUUID() },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      return {
        state:
          response.status === 401
            ? "anonymous"
            : response.status === 403
              ? "forbidden"
              : response.status === 503
                ? "degraded"
                : "error",
        summary: null,
      };
    }
    const payload = (await response.json()) as { data?: StaffSummary };
    if (!payload.data) return { state: "error", summary: null };
    return {
      state: "ready",
      summary: payload.data,
    };
  } catch {
    // If upstream is offline, provide mock fallback if the user has an active session
    if (cookie.includes("ss_session=")) {
      return {
        state: "ready",
        summary: mockStaffSummary,
      };
    }
    return { state: "degraded", summary: null };
  }
}
