import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "../app/api/staff/operations/reports/route";

describe("staff reports proxy", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("preserves the session and CSV response headers", async () => {
    let url = "";
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      return Promise.resolve(
        new Response("stage,leads\nnew,1\n", {
          status: 200,
          headers: {
            "content-type": "text/csv",
            "content-disposition": "attachment; filename=report.csv",
          },
        }),
      );
    });
    const response = await GET(
      new Request(
        "https://example.test/api/staff/operations/reports?type=funnel&format=csv",
        { headers: { cookie: "ss_session=session-1" } },
      ),
    );
    expect(response.status).toBe(200);
    expect(url).toContain("type=funnel&format=csv");
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("report.csv");
  });

  it("returns degraded status without data when the API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const response = await GET(
      new Request(
        "https://example.test/api/staff/operations/reports?type=funnel",
      ),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Reports are temporarily unavailable.",
    });
  });
});
