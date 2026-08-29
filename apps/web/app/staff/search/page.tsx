import type { Metadata } from "next";

import { StaffOperationsSearch } from "../../../src/staff-operations-search";

export const metadata: Metadata = {
  title: "Operations search | Stack & Scale",
  robots: { index: false, follow: false },
};

export default function StaffSearchPage() {
  return <StaffOperationsSearch />;
}
