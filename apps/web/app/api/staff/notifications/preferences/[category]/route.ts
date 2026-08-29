import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await context.params;
    const response = await fetch(
      `${apiOrigin}/api/v1/notifications/preferences/${encodeURIComponent(category)}`,
      {
        method: "PATCH",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          "content-type": "application/json",
          "x-correlation-id":
            request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
        },
        body: await request.text(),
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
      { error: "Notification preferences are temporarily unavailable." },
      { status: 503 },
    );
  }
}
