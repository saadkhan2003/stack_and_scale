import type { Metadata } from "next";
import { StaffReports } from "../../../src/staff-reports";
export const metadata: Metadata = {
  title: "Reports | Stack & Scale",
  robots: { index: false, follow: false },
};
export default function StaffReportsPage() {
  return <StaffReports />;
}
