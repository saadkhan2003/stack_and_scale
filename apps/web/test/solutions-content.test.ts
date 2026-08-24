import { describe, expect, it } from "vitest";

import { solutionsPageModel } from "../src/solutions-content";

describe("solutionsPageModel", () => {
  it("gives product and custom-software buyers distinct next actions", () => {
    expect(solutionsPageModel).toMatchObject({
      heading: "Technology that fits the work in front of you.",
      productAction: "Book a product demo",
      serviceAction: "Discuss a custom project",
    });

    expect(solutionsPageModel.solutions).toHaveLength(3);
  });
});
