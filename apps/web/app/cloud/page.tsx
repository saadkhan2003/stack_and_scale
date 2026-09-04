import { Suspense } from "react";
import { metadataForPath } from "../../src/seo";
import { CloudPageClient } from "./cloud-client";

export const metadata = metadataForPath(
  "/cloud",
  "Cloud Workspaces | Stack & Scale",
  "Multi-tenant managed cloud workspaces for Retail Operations, CRM Pipelines, and Workflow Hubs.",
);

export default function CloudPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-zinc-500">
          Loading Cloud Workspace Console...
        </div>
      }
    >
      <CloudPageClient />
    </Suspense>
  );
}
