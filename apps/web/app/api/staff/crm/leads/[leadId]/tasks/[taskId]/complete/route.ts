import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function PATCH(
  request: Request,
  context: Readonly<{ params: Promise<{ leadId: string; taskId: string }> }>,
) {
  const { leadId, taskId } = await context.params;
  try {
    const response = await fetch(
      `${apiOrigin}/api/v1/crm/leads/${encodeURIComponent(leadId)}/tasks/${encodeURIComponent(taskId)}/complete`,
      {
        method: "PATCH",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          "x-correlation-id":
            request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
        },
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
      { error: "CRM is temporarily unavailable." },
      { status: 503 },
    );
  }
}
