import { cmsShellModel } from "../../src/cms-shell";

export default function AdminPage() {
  return (
    <main className="site-shell">
      <p className="eyebrow">Administration</p>
      <h1>{cmsShellModel.heading}</h1>
      <p role="status" aria-live="polite">
        {cmsShellModel.message}
      </p>
    </main>
  );
}
