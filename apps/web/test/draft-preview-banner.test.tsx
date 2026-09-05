import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DraftPreviewBanner } from "../src/draft-preview-banner.js";

describe("DraftPreviewBanner", () => {
  it("renders draft preview indicator and exit preview link", () => {
    const html = renderToStaticMarkup(<DraftPreviewBanner />);
    expect(html).toContain("Draft Preview Mode Active");
    expect(html).toContain("Viewing unpublished CMS drafts");
    expect(html).toContain("/api/exit-preview");
    expect(html).toContain("Exit Preview");
  });
});
