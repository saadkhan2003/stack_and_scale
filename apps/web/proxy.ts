import { NextResponse, type NextRequest } from "next/server";

import { redirectTarget, type RedirectRecord } from "./src/redirect-utils";

const cmsOrigin = process.env["CMS_PUBLIC_URL"] ?? "http://127.0.0.1:3200";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  try {
    const response = await fetch(`${cmsOrigin}/api/redirects?where[fromPath][equals]=${encodeURIComponent(path)}&depth=1&limit=1`, { signal: AbortSignal.timeout(800) });
    if (!response.ok) return NextResponse.next();
    const payload = await response.json() as { docs?: RedirectRecord[] };
    const redirect = payload.docs?.[0];
    const target = redirect ? redirectTarget(redirect) : null;
    if (!target || target === path) return NextResponse.next();
    return NextResponse.redirect(new URL(target, request.url), redirect?.permanent === false ? 307 : 308);
  } catch {
    return NextResponse.next();
  }
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
