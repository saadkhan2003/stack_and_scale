import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

const mockStaffList = [
  {
    id: "user-9fd75ba2-_YF3MWQvr_I",
    name: "Muhammad Saad Khan",
    email: "msaad.official6@gmail.com",
    role: "manager",
  },
  {
    id: "user-e791e2fd-YdLKMxa4F70",
    name: "Talha Shams",
    email: "talha.shams@stackandscale.org",
    role: "manager",
  },
  {
    id: "user-hanzalakhan",
    name: "Hanzala Khan",
    email: "hanzala.khan@stackandscale.org",
    role: "manager",
  },
  {
    id: "user-dragoooo",
    name: "Mehran Khan",
    email: "mehran.khan@stackandscale.org",
    role: "owner",
  },
];

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  try {
    const response = await fetch(`${apiOrigin}/api/v1/crm/staff`, {
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
      return NextResponse.json({ data: mockStaffList });
    }
    return NextResponse.json(
      { error: "CRM staff service is temporarily unavailable." },
      { status: 503 },
    );
  }
}
