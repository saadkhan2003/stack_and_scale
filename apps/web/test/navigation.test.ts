import { describe, expect, it } from "vitest";

import { primaryNavigation } from "../src/navigation.js";

describe("primaryNavigation", () => {
  it("keeps every public destination available in compact navigation", () => {
    expect(primaryNavigation).toEqual([
      { href: "/solutions", label: "Solutions" },
      { href: "/approach", label: "Approach" },
      { href: "/#contact", label: "Contact" },
    ]);
  });
});
