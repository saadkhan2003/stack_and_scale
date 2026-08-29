import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(
  request: Request,
  context: { params: Promise<{ articleId: string }> },
) {
  return relay(request, context, "GET");
}
export async function PATCH(
  request: Request,
  context: { params: Promise<{ articleId: string }> },
) {
  return relay(request, context, "PATCH");
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ articleId: string }> },
) {
  return relay(request, context, "DELETE");
}

async function relay(
  request: Request,
  context: { params: Promise<{ articleId: string }> },
  method: string,
) {
  try {
    const { articleId } = await context.params;
    const body =
      method === "GET" || method === "DELETE"
        ? undefined
        : await request.text();
    const response = await fetch(
      `${apiOrigin}/api/v1/operations/knowledge/${encodeURIComponent(articleId)}`,
      {
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
      { error: "Knowledge is temporarily unavailable." },
      { status: 503 },
    );
  }
}
