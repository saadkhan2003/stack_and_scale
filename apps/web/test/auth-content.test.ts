import { describe, expect, it } from "vitest";

import { authContentModel, createAuthContentModel } from "../src/auth-content";

describe("authContentModel", () => {
  it("describes an OIDC-only sign-in flow without fake credentials", () => {
    expect(authContentModel).toMatchObject({
      eyebrow: "Staff sign-in",
      heading: "Sign in to Stack & Scale.",
      primaryAction: "Continue",
    });

    expect(authContentModel.providerNote.toLowerCase()).toContain(
      "openid connect",
    );
  });

  it("rejects empty fields", () => {
    expect(() =>
      createAuthContentModel({ ...authContentModel, heading: "  " }),
    ).toThrow(/heading/);
  });
});
