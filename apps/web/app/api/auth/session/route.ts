import { NextResponse } from "next/server";
import { resolveStaffAccess } from "../../../../src/staff-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const access = await resolveStaffAccess(cookie);
  const isStaff = access.state === "ready";
  const hasSession = isStaff || cookie.includes("ss_session=");

  return NextResponse.json(
    {
      authenticated: hasSession,
      role: isStaff ? "staff" : hasSession ? "user" : "anonymous",
      workspaceUrl: isStaff ? "/staff/leads" : "/portal/demo",
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
