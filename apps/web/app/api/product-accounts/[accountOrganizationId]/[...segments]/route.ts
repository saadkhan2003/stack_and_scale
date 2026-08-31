import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";
const supported = /^(subscriptions\/[a-zA-Z0-9_-]{1,128}\/transitions|installations\/[a-zA-Z0-9_-]{1,128}\/leases|releases\/[a-zA-Z0-9_-]{1,128}\/download|notification-preferences\/(billing|product))$/;

export async function POST(request: Request, context: { params: Promise<{ accountOrganizationId: string; segments: string[] }> }) {
  const { accountOrganizationId, segments } = await context.params;
  const tail = segments.join("/");
  if (!supported.test(tail)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const response = await fetch(`${apiOrigin}/api/v1/product-accounts/organizations/${encodeURIComponent(accountOrganizationId)}/${tail}`, { method: "POST", headers: { "content-type": "application/json", cookie: request.headers.get("cookie") ?? "", "x-correlation-id": request.headers.get("x-correlation-id") ?? crypto.randomUUID() }, body: await request.text(), cache: "no-store" });
  return new NextResponse(response.body, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
}
