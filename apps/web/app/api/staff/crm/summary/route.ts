import { NextResponse } from "next/server";
import { mockStaffSummary } from "../../../../../src/staff-access";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  try {
    const response = await fetch(`${apiOrigin}/api/v1/crm/summary`, {
      headers: {
        cookie,
        "x-correlation-id":
          request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    if (cookie.includes("ss_session=")) {
      return NextResponse.json({ data: mockStaffSummary });
    }
    return NextResponse.json(
      { error: "CRM is temporarily unavailable." },
      { status: 503 },
    );
  }
}
