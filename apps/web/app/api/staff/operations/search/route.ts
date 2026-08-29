import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  try {
    const inbound = new URL(request.url);
    const response = await fetch(
      `${apiOrigin}/api/v1/operations/search${inbound.search}`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          "x-correlation-id":
            request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Operations search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
