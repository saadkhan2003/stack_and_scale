import { describe, expect, it } from "vitest";

import {
  oidcRequestHeaders,
  oidcUpstreamUrl,
  setCookieValues,
} from "../src/oidc-proxy";

describe("OIDC website proxy", () => {
  it("keeps callback query values and only forwards safe request headers", () => {
    const request = new Request(
      "https://stackandscale.org/api/auth/oidc/callback?code=one&state=two",
      {
        headers: {
          cookie: "ss_oidc_state=two",
          "x-correlation-id": "correlation-1",
          authorization: "must-not-be-forwarded",
        },
      },
    );
    const upstream = oidcUpstreamUrl(request.url, "/api/auth/oidc/callback");

    expect(upstream.pathname).toBe("/api/auth/oidc/callback");
    expect(upstream.searchParams.get("code")).toBe("one");
    expect(oidcRequestHeaders(request).get("cookie")).toBe("ss_oidc_state=two");
    expect(oidcRequestHeaders(request).get("authorization")).toBeNull();
  });

  it("preserves individual upstream cookies", () => {
    const headers = new Headers();
    headers.append("set-cookie", "one=1; HttpOnly");
    headers.append("set-cookie", "two=2; HttpOnly");

    expect(setCookieValues(headers)).toEqual([
      "one=1; HttpOnly",
      "two=2; HttpOnly",
    ]);
  });
});
