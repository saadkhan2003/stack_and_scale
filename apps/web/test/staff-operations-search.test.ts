import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/staff/operations/search/route";

describe("staff operations search proxy", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("forwards only the query and staff session to the API", async () => {
    let url = "";
    let headers: HeadersInit | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      headers = init?.headers;
      return Promise.resolve(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );
    });
    const response = await GET(
      new Request("https://example.test/api/staff/operations/search?q=Acme", {
        headers: { cookie: "ss_session=session-1" },
      }),
    );
    expect(response.status).toBe(200);
    expect(url).toContain("/api/v1/operations/search?q=Acme");
    expect(new Headers(headers).get("cookie")).toBe("ss_session=session-1");
  });

  it("does not turn an unavailable upstream into a data-bearing response", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const response = await GET(
      new Request("https://example.test/api/staff/operations/search?q=Acme"),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Operations search is temporarily unavailable.",
    });
  });
});
