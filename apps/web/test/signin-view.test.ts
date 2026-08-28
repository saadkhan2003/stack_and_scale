import { describe, expect, it } from "vitest";

import { authContentModel } from "../src/auth-content";
import { SigninView } from "../src/signin-view";

describe("SigninView", () => {
  it("is a presentational component taking an auth content model", () => {
    expect(typeof SigninView).toBe("function");
    expect(SigninView.name).toBe("SigninView");
  });

  it("consumes the shared auth content model shape", () => {
    const model = authContentModel;
    expect(model.primaryAction).toBe("Continue to secure sign-in");
    expect(JSON.stringify(model)).not.toMatch(/password/i);
  });
});
