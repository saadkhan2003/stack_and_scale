"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <div className="error-page">
      <div>
        <h1>Error</h1>
        <h2>We could not load that page.</h2>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
