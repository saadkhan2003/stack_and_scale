import { describe, expect, it } from "vitest";

import { redirectTarget } from "../src/redirect-utils";

describe("redirectTarget", () => {
  it("allows relative and HTTPS targets plus linked CMS pages", () => {
    expect(redirectTarget({ toUrl: "/new-path" })).toBe("/new-path");
    expect(redirectTarget({ toUrl: "https://example.com/path" })).toBe("https://example.com/path");
    expect(redirectTarget({ toPage: { slug: "new-page" } })).toBe("/new-page");
  });

  it("refuses unsafe or incomplete targets", () => {
    expect(redirectTarget({ toUrl: "http://example.com" })).toBeNull();
    expect(redirectTarget({ toUrl: "javascript:alert(1)" })).toBeNull();
    expect(redirectTarget({})).toBeNull();
  });
});
