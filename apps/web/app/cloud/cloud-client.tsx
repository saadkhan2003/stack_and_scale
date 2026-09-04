"use client";

import { useSearchParams } from "next/navigation";
import { CloudWorkspaceConsole } from "@/src/cloud-workspace";

export function CloudPageClient() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant") || "live-cloud";
  const rawTab = searchParams.get("tab") || "all";

  const tabMapping: Record<string, "all" | "retail-pos" | "autonomous-crm" | "workflow-hub"> = {
    pos: "retail-pos",
    "retail-pos": "retail-pos",
    crm: "autonomous-crm",
    "autonomous-crm": "autonomous-crm",
    workflow: "workflow-hub",
    "workflow-hub": "workflow-hub",
    all: "all",
  };

  const initialTab = tabMapping[rawTab] || "all";

  return <CloudWorkspaceConsole initialTenant={tenant} initialTab={initialTab} />;
}

