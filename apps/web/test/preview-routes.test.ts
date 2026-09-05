import { describe, expect, it, vi } from "vitest";

const mockEnable = vi.fn();
const mockDisable = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({
    enable: mockEnable,
    disable: mockDisable,
    isEnabled: false,
  })),
}));

import { GET as previewGet } from "../app/api/preview/route.js";
import { GET as exitPreviewGet } from "../app/api/exit-preview/route.js";

describe("Preview Routes", () => {
  it("rejects preview request with missing or incorrect secret", async () => {
    process.env["CMS_PREVIEW_SECRET"] = "valid-secret-999";

    const reqMissing = new Request(
      "https://stackandscale.org/api/preview?slug=test-page",
    );
    const resMissing = await previewGet(reqMissing);
    expect(resMissing.status).toBe(401);

    const reqWrong = new Request(
      "https://stackandscale.org/api/preview?secret=wrong-secret&slug=test-page",
    );
    const resWrong = await previewGet(reqWrong);
    expect(resWrong.status).toBe(401);
  });

  it("enables draftMode and redirects to target page on valid secret", async () => {
    process.env["CMS_PREVIEW_SECRET"] = "valid-secret-999";

    const req = new Request(
      "https://stackandscale.org/api/preview?secret=valid-secret-999&slug=enterprise-mesh",
    );
    const res = await previewGet(req);
    expect(res.status).toBe(307);
    expect(mockEnable).toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      "https://stackandscale.org/enterprise-mesh",
    );
  });

  it("redirects to collection route when collection param is specified", async () => {
    process.env["CMS_PREVIEW_SECRET"] = "valid-secret-999";

    const req = new Request(
      "https://stackandscale.org/api/preview?secret=valid-secret-999&collection=products&slug=edge-pos",
    );
    const res = await previewGet(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://stackandscale.org/products/edge-pos",
    );
  });

  it("exit-preview disables draftMode and redirects to root", async () => {
    const req = new Request("https://stackandscale.org/api/exit-preview");
    const res = await exitPreviewGet(req);
    expect(res.status).toBe(307);
    expect(mockDisable).toHaveBeenCalled();
    expect(res.headers.get("location")).toBe("https://stackandscale.org/");
  });
});
