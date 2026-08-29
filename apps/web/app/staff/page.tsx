import type { Metadata } from "next";
import { cookies } from "next/headers";

import { resolveStaffAccess } from "../../src/staff-access";
import { StaffShell } from "../../src/staff-shell";

export const metadata: Metadata = {
  title: "Staff workspace | Stack & Scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const cookie = (await cookies()).toString();
  const access = await resolveStaffAccess(cookie);
  return (
    <StaffShell
      initialAccessState={access.state}
      initialSummary={access.summary}
    />
  );
}
