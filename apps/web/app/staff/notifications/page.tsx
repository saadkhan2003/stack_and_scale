import type { Metadata } from "next";

import { StaffNotifications } from "../../../src/staff-notifications";

export const metadata: Metadata = {
  title: "Notifications | Stack & Scale",
  robots: { index: false, follow: false },
};

export default function StaffNotificationsPage() {
  return <StaffNotifications />;
}
