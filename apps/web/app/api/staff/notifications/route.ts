import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  return relay(request, "/api/v1/notifications");
}

export async function POST(request: Request) {
  return relay(request, "/api/v1/notifications", {
    method: "POST",
    body: await request.text(),
  });
}

async function relay(
  request: Request,
  path: string,
  options: { method?: string; body?: string } = {},
) {
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      method: options.method ?? "GET",
      ...(options.body === undefined ? {} : { body: options.body }),
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "content-type":
          request.headers.get("content-type") ?? "application/json",
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
    return NextResponse.json(
      { error: "Notifications are temporarily unavailable." },
      { status: 503 },
    );
  }
}
