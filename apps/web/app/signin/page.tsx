import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authContentModel } from "../../src/auth-content";
import { SiteHeader } from "../../src/site-header";
import { SiteFooter } from "../../src/site-footer";
import { SigninView } from "../../src/signin-view";
import { resolveStaffAccess } from "../../src/staff-access";

export const metadata: Metadata = {
  title: "Sign in | Stack & Scale",
  description:
    "Unified access for Client Portals, Product Accounts, and Engineering Teams.",
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.toString();
    if (cookie.includes("ss_session=")) {
      const access = await resolveStaffAccess(cookie);
      if (access.state === "ready") {
        redirect("/staff/leads");
      }
    }
  } catch (error) {
    // If it's a redirect, let it throw so Next.js performs the redirect
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
  }

  return (
    <main className="site-shell">
      <SiteHeader currentPath="/signin" />
      <SigninView model={authContentModel} />
      <SiteFooter />
    </main>
  );
}
