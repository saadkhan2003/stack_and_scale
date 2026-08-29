import type { Metadata } from "next";
import { StaffProposals } from "../../../src/staff-proposals";

export const metadata: Metadata = {
  title: "Proposals | Stack & Scale",
  robots: { index: false, follow: false },
};

export default function StaffProposalsPage() {
  return <StaffProposals />;
}
