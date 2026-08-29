import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  return relay(request, "/api/v1/operations/knowledge");
}
export async function POST(request: Request) {
  return relay(request, "/api/v1/operations/knowledge", "POST");
}

async function relay(request: Request, path: string, method = "GET") {
  try {
    const body = method === "GET" ? undefined : await request.text();
    const response = await fetch(`${apiOrigin}${path}`, {
      method,
      ...(body === undefined ? {} : { body }),
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "content-type": "application/json",
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
      { error: "Knowledge is temporarily unavailable." },
      { status: 503 },
    );
  }
}
