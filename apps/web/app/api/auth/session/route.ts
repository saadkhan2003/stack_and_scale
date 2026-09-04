import { NextResponse } from "next/server";
import { resolveStaffAccess } from "../../../../src/staff-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const access = await resolveStaffAccess(cookie);
  const isStaff = access.state === "ready";

  return NextResponse.json(
    {
      authenticated: isStaff,
      role: isStaff ? "staff" : "anonymous",
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
