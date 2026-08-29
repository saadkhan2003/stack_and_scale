import type { Metadata } from "next";
import { StaffKnowledge } from "../../../src/staff-knowledge";
export const metadata: Metadata = {
  title: "Knowledge | Stack & Scale",
  robots: { index: false, follow: false },
};
export default function StaffKnowledgePage() {
  return <StaffKnowledge />;
}
