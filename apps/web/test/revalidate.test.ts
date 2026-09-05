import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { POST } from "../app/api/revalidate/route.js";

describe("/api/revalidate", () => {
  it("rejects request without secret", async () => {
    const req = new Request("https://stackandscale.org/api/revalidate", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("revalidates specified path when secret matches", async () => {
    process.env["CMS_REVALIDATE_SECRET"] = "test-secret-123";

    const req = new Request(
      "https://stackandscale.org/api/revalidate?secret=test-secret-123&path=/products",
      { method: "POST" },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.revalidated).toBe(true);
    expect(json.path).toBe("/products");
    expect(revalidatePath).toHaveBeenCalledWith("/products");
  });

  it("revalidates mapped path for collection tag", async () => {
    process.env["CMS_REVALIDATE_SECRET"] = "test-secret-123";

    const req = new Request(
      "https://stackandscale.org/api/revalidate?secret=test-secret-123&tag=products",
      { method: "POST" },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.revalidated).toBe(true);
    expect(json.tag).toBe("products");
    expect(revalidatePath).toHaveBeenCalledWith("/products", "layout");
  });
});
