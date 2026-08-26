import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey) return NextResponse.json({ error: "An idempotency key is required." }, { status: 400 });
  try {
    const response = await fetch(`${apiOrigin}/leads`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": idempotencyKey, "x-correlation-id": request.headers.get("x-correlation-id") ?? idempotencyKey }, body: await request.text(), signal: AbortSignal.timeout(8_000) });
    return new NextResponse(await response.text(), { status: response.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "We could not send your request right now." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
