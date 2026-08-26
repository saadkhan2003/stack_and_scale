import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET() {
  try {
    const response = await fetch(`${apiOrigin}/leads/demo-slots`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
    return new NextResponse(await response.text(), { status: response.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch { return NextResponse.json({ data: [] }, { headers: { "cache-control": "no-store" } }); }
}
