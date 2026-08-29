import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  return relay(request, "/api/v1/proposals");
}

export async function POST(request: Request) {
  return relay(request, "/api/v1/proposals", "POST");
}

async function relay(request: Request, path: string, method = "GET") {
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      method,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "content-type": "application/json",
        "x-correlation-id":
          request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
      },
      ...(method === "GET"
        ? { cache: "no-store" }
        : { body: await request.text() }),
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
      { error: "Proposal service is temporarily unavailable." },
      { status: 503 },
    );
  }
}
