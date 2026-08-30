import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

const validGetPaths = new Set([
  "access",
  "home",
  "projects",
  "documents",
  "files",
  "support/tickets",
  "activity",
  "notification-preferences",
  "reviews",
  "members",
]);

function upstreamPath(clientOrganizationId: string, segments: string[]) {
  if (
    !/^[a-zA-Z0-9_-]{1,128}$/.test(clientOrganizationId) ||
    segments.length === 0 ||
    segments.some((segment) => !/^[a-zA-Z0-9_-]{1,128}$/.test(segment))
  ) {
    return null;
  }
  const tail = segments.join("/");
  const validPost =
    tail === "support/tickets" ||
    /^support\/tickets\/[a-zA-Z0-9_-]{1,128}\/comments$/.test(tail) ||
    /^reviews\/[a-zA-Z0-9_-]{1,128}\/decisions$/.test(tail) ||
    tail === "members" ||
    /^members\/[a-zA-Z0-9_-]{1,128}\/revoke$/.test(tail) ||
    /^notification-preferences\/(billing|system)$/.test(tail);
  return { tail, allowed: validGetPaths.has(tail) || validPost };
}

async function relay(
  request: Request,
  params: Promise<{ clientOrganizationId: string; segments: string[] }>,
  method: "GET" | "POST",
) {
  const { clientOrganizationId, segments } = await params;
  const path = upstreamPath(clientOrganizationId, segments);
  if (path === null || !path.allowed) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (method === "GET" && !validGetPaths.has(path.tail)) {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }
  try {
    const response = await fetch(
      `${apiOrigin}/api/v1/portal/client-organizations/${encodeURIComponent(clientOrganizationId)}/${path.tail}`,
      {
        method,
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          "content-type": "application/json",
          "x-correlation-id":
            request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
        },
        ...(method === "POST"
          ? { body: await request.text() }
          : { cache: "no-store" }),
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
      { error: "Client portal service is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ clientOrganizationId: string; segments: string[] }>;
  },
) {
  return relay(request, context.params, "GET");
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ clientOrganizationId: string; segments: string[] }>;
  },
) {
  return relay(request, context.params, "POST");
}
