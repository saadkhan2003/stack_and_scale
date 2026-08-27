"use client";

export default function ErrorPage({
  reset,
}: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="status-page">
      <p className="eyebrow">Something changed</p>
      <h1>We could not load that page.</h1>
      <p>Please try again, or contact us directly if the issue continues.</p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
