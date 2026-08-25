import { describe, expect, it } from "vitest";

import { primaryNavigation } from "../src/navigation.js";

describe("primaryNavigation", () => {
  it("keeps every public destination available in compact navigation", () => {
    expect(primaryNavigation).toEqual([
      { href: "/products", label: "Products" },
      { href: "/services", label: "Services" },
      { href: "/work", label: "Work" },
      { href: "/approach", label: "Approach" },
      { href: "/contact", label: "Contact" },
    ]);
  });
});
