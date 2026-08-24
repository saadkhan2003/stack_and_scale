import { describe, expect, it } from "vitest";

import { approachPageModel } from "../src/approach-content";

describe("approachPageModel", () => {
  it("makes the delivery process clear before a customer starts a project", () => {
    expect(approachPageModel.heading).toBe(
      "A clear path from operational problem to dependable software.",
    );
    expect(approachPageModel.steps).toHaveLength(4);
    expect(approachPageModel.action).toBe("Discuss your needs");
  });
});
