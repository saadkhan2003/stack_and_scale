import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(
  request: Request,
  context: Readonly<{ params: Promise<{ exportId: string }> }>,
) {
  const { exportId } = await context.params;
  try {
    const response = await fetch(
      `${apiOrigin}/api/v1/operations/reports/exports/${encodeURIComponent(exportId)}`,
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
        "content-type":
          response.headers.get("content-type") ?? "application/json",
        "content-disposition":
          response.headers.get("content-disposition") ?? "",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Reports are temporarily unavailable." },
      { status: 503 },
    );
  }
}
