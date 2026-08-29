import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../app/api/staff/notifications/route";

describe("staff notification proxy", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("forwards the session and notification payload to the API", async () => {
    let requestInit: RequestInit | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
      requestInit = init;
      return Promise.resolve(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );
    });
    const request = new Request(
      "https://example.test/api/staff/notifications",
      {
        method: "POST",
        headers: {
          cookie: "ss_session=session-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: "Notice" }),
      },
    );
    expect((await POST(request)).status).toBe(200);
    expect(new Headers(requestInit?.headers).get("cookie")).toBe(
      "ss_session=session-1",
    );
    expect(requestInit?.body).toBe(JSON.stringify({ title: "Notice" }));
  });

  it("returns an explicit degraded response when upstream is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const response = await GET(
      new Request("https://example.test/api/staff/notifications"),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Notifications are temporarily unavailable.",
    });
  });
});
