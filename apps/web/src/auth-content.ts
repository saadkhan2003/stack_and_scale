export type AuthContentModel = {
  eyebrow: string;
  heading: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
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
    "emailLabel",
    "emailPlaceholder",
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
  eyebrow: "Staff sign-in",
  heading: "Sign in to Stack & Scale.",
  description:
    "Use your staff account to reach dashboards, deployment tools, and operational controls.",
  emailLabel: "Work email",
  emailPlaceholder: "you@stackandscale.com",
  primaryAction: "Continue",
  providerNote:
    "Sign-in is handled by our identity provider via OpenID Connect. You will be redirected to a secure login page.",
  legalNote:
    "Access is restricted to authorized staff. Activity is logged for security.",
} as const);
