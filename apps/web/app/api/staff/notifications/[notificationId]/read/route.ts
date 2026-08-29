import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await context.params;
    const response = await fetch(
      `${apiOrigin}/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "PATCH",
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
      { error: "Notifications are temporarily unavailable." },
      { status: 503 },
    );
  }
}
