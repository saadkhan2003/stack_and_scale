"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import { playStaffCue } from "../../src/staff-sfx";

export default function StaffError({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  useEffect(() => {
    playStaffCue("error");
  }, []);
  return (
    <section className="staff-dashboard" aria-labelledby="staff-error-heading">
      <p className="eyebrow">Staff workspace</p>
      <h1 id="staff-error-heading">The workspace needs a retry.</h1>
      <p className="staff-loading">
        The route failed before it could load. No CRM data was changed.
      </p>
      <Button onClick={reset} type="button">
        Try again
      </Button>
    </section>
  );
}
