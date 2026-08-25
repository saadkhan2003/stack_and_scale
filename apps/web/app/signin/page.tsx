import type { Metadata } from "next";

import { authContentModel } from "../../src/auth-content";
import { SiteHeader } from "../../src/site-header";
import { SigninView } from "../../src/signin-view";

export const metadata: Metadata = {
  title: "Staff sign-in | Stack & Scale",
  description: "Sign in to Stack & Scale staff tools.",
};

export default function SignInPage() {
  return (
    <main className="site-shell">
      <SiteHeader currentPath="/signin" />
      <SigninView model={authContentModel} />
    </main>
  );
}
