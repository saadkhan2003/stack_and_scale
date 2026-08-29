import type { Metadata } from "next";
import { StaffOperations } from "../../../src/staff-operations";

export const metadata: Metadata = {
  title: "Release & capacity | Stack & Scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function StaffOperationsPage() {
  return <StaffOperations />;
}
