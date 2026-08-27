import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function POST(
  request: Request,
  context: Readonly<{ params: Promise<{ leadId: string }> }>,
) {
  const { leadId } = await context.params;
  try {
    const response = await fetch(
      `${apiOrigin}/leads/${encodeURIComponent(leadId)}/bookings`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-correlation-id": request.headers.get("x-correlation-id") ?? leadId,
        },
        body: await request.text(),
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
      { error: "We could not record your demo preference right now." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
