import type { ReactNode } from "react";

import { StaffNavigation } from "../../src/staff-navigation";

export default function StaffLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="staff-workspace">
      <StaffNavigation />
      <main>{children}</main>
    </div>
  );
}
