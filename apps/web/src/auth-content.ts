export type AuthContentModel = {
  eyebrow: string;
  heading: string;
  description: string;
  primaryAction: string;
  providerNote: string;
  legalNote: string;
};

export function createAuthContentModel(
  input: AuthContentModel,
): AuthContentModel {
  const requiredFields: Array<keyof AuthContentModel> = [
    "eyebrow",
    "heading",
    "description",
    "primaryAction",
    "providerNote",
    "legalNote",
  ];

  for (const field of requiredFields) {
    if (input[field].trim().length === 0) {
      throw new Error(`auth content field "${field}" must not be empty`);
    }
  }

  return { ...input };
}

export const authContentModel = createAuthContentModel({
  eyebrow: "Unified Access",
  heading: "Sign in to Stack & Scale",
  description:
    "Unified access for Client Portals, Product Accounts, and Engineering Teams.",
  primaryAction: "Continue to secure sign-in",
  providerNote:
    "Sign-in is handled by our identity provider via OpenID Connect. You will be redirected to a secure authentication session.",
  legalNote:
    "Authorized access only. All sessions and administrative operations are cryptographically audited.",
} as const);
