import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/staff/crm/summary/route";
import { staffAccessState } from "../src/staff-shell";

describe("staff dashboard proxy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards the staff cookie and preserves an authorized summary", async () => {
    let forwardedHeaders: HeadersInit | undefined;
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((_input, init) => {
        forwardedHeaders = init?.headers;
        return Promise.resolve(
          new Response(JSON.stringify({ data: { newLeads: [] } }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        );
      });
    const response = await GET(
      new Request("https://example.test/api/staff/crm/summary", {
        headers: { cookie: "ss_session=session-1" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { newLeads: [] } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(forwardedHeaders).get("cookie")).toBe(
      "ss_session=session-1",
    );
  });

  it("returns an explicit degraded response when CRM cannot be reached", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const response = await GET(
      new Request("https://example.test/api/staff/crm/summary"),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "CRM is temporarily unavailable.",
    });
    expect(staffAccessState(response.status)).toBe("degraded");
  });
});
