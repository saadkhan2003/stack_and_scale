"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="status-page">
      <p className="eyebrow">Something changed</p>
      <h1>We could not load that page.</h1>
      <p>Please try again, or contact us directly if the issue continues.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
