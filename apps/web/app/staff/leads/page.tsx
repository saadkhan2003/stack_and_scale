import type { Metadata } from "next";
import { StaffLeadInbox } from "../../../src/staff-lead-inbox";

export const metadata: Metadata = { title: "Lead inbox | Stack & Scale", robots: { index: false, follow: false } };

export default function StaffLeadsPage() { return <main className="site-shell"><StaffLeadInbox /></main>; }
