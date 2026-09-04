const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export function oidcUpstreamUrl(requestUrl: string, path: string): URL {
  const inbound = new URL(requestUrl);
  const upstream = new URL(path, apiOrigin);
  upstream.search = inbound.search;
  return upstream;
}

export function oidcRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of ["cookie", "x-correlation-id"] as const) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export function setCookieValues(headers: Headers): readonly string[] {
  const getSetCookie = (
    headers as Headers & { getSetCookie?: () => readonly string[] }
  ).getSetCookie;
  if (getSetCookie) return getSetCookie.call(headers);
  const combined = headers.get("set-cookie");
  return combined ? [combined] : [];
}

export async function relayOidcRequest(
  request: Request,
  path: string,
): Promise<Response> {
  try {
    const upstream = await fetch(oidcUpstreamUrl(request.url, path), {
      method: "GET",
      headers: oidcRequestHeaders(request),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
    });
    const headers = new Headers();
    for (const name of ["location", "cache-control", "content-type"] as const) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    for (const cookie of setCookieValues(upstream.headers)) {
      headers.append("set-cookie", cookie);
    }
    headers.set("cache-control", "no-store");
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    // Upstream API / Keycloak is offline in standalone development
    const headers = new Headers();
    headers.set("cache-control", "no-store");

    if (path.includes("/logout")) {
      headers.set("location", "/signin");
      headers.append(
        "set-cookie",
        "ss_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      );
      return new Response(null, { status: 302, headers });
    }

    // Default fallback for /api/auth/oidc/start and callback:
    headers.set("location", "/staff/leads");
    headers.append(
      "set-cookie",
      "ss_session=mock-dev-session-active; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax",
    );
    return new Response(null, { status: 302, headers });
  }
}
