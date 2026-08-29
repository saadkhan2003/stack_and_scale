import type { StaffAccessState } from "./staff-shell";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export type StaffAccessResult = Readonly<{
  state: Exclude<StaffAccessState, "loading">;
  leadCount: number | null;
}>;

export async function resolveStaffAccess(
  cookie: string,
): Promise<StaffAccessResult> {
  try {
    const response = await fetch(`${apiOrigin}/api/v1/crm/leads`, {
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
        leadCount: null,
      };
    }
    const payload = (await response.json()) as { data?: unknown[] };
    return {
      state: "ready",
      leadCount: Array.isArray(payload.data) ? payload.data.length : 0,
    };
  } catch {
    return { state: "degraded", leadCount: null };
  }
}
