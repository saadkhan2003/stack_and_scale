import { describe, expect, it, vi } from "vitest";

import { GET as getRelease } from "../app/api/staff/operations/release/route";
import { GET as getCapacity } from "../app/api/staff/operations/capacity/route";

describe("staff operations proxies", () => {
  it("forwards the staff cookie to release visibility", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response('{"data":{}}'));
    await getRelease(
      new Request("https://example.test/api/staff/operations/release", {
        headers: { cookie: "session=staff" },
      }),
    );
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toContain("/api/v1/operations/release");
    const options = call?.[1];
    expect(new Headers(options?.headers).get("cookie")).toBe("session=staff");
    fetchMock.mockRestore();
  });

  it("returns a controlled 503 when capacity API is unreachable", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("offline"));
    const response = await getCapacity(
      new Request("https://example.test/api/staff/operations/capacity"),
    );
    expect(response.status).toBe(503);
    const payload = (await response.json()) as unknown;
    expect(payload).toEqual({
      error: "Capacity data is temporarily unavailable.",
    });
    fetchMock.mockRestore();
  });
});
