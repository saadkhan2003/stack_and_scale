import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AnnouncementBar } from "../src/announcement-bar.js";
import type { CmsAnnouncement } from "../src/cms-content.js";

describe("AnnouncementBar", () => {
  it("renders null when announcement is not provided or disabled", () => {
    expect(renderToStaticMarkup(<AnnouncementBar />)).toBe("");
    expect(renderToStaticMarkup(<AnnouncementBar announcement={null} />)).toBe("");
    expect(
      renderToStaticMarkup(
        <AnnouncementBar announcement={{ enabled: false, text: "Promo" }} />,
      ),
    ).toBe("");
  });

  it("renders badge, text, and cta when announcement is enabled", () => {
    const ann: CmsAnnouncement = {
      enabled: true,
      badge: "UPDATE",
      text: "Stack & Scale 2.0 is Live Worldwide",
      ctaText: "Read Release Notes →",
      ctaHref: "/resources/release-2-0",
    };
    const html = renderToStaticMarkup(<AnnouncementBar announcement={ann} />);
    expect(html).toContain("UPDATE");
    expect(html).toContain("Stack &amp; Scale 2.0 is Live Worldwide");
    expect(html).toContain("Read Release Notes →");
    expect(html).toContain("/resources/release-2-0");
  });
});
