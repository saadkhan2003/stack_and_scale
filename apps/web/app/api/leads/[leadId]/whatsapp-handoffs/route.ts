import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function POST(
  request: Request,
  context: Readonly<{ params: Promise<{ leadId: string }> }>,
) {
  const { leadId } = await context.params;
  try {
    const response = await fetch(
      `${apiOrigin}/leads/${encodeURIComponent(leadId)}/whatsapp-handoffs`,
      {
        method: "POST",
        headers: {
          "x-correlation-id": request.headers.get("x-correlation-id") ?? leadId,
        },
        signal: AbortSignal.timeout(8_000),
      },
    );
    return new NextResponse(null, {
      status: response.status,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to record WhatsApp handoff." },
      { status: 503 },
    );
  }
}
