"use client";

import { useEffect, useState } from "react";

import type { CmsDocument } from "./cms-content";
import { CmsPageBlocks } from "./cms-renderers";

export function CmsPageLivePreview({ initialPage }: Readonly<{ initialPage: CmsDocument }>) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const serverURL = process.env["NEXT_PUBLIC_CMS_PUBLIC_URL"] ?? "http://127.0.0.1:3200";
    const cmsOrigin = new URL(serverURL).origin;
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== cmsOrigin || event.data === null || typeof event.data !== "object") return;
      const payload = event.data as { type?: unknown; data?: unknown };
      if (payload.type !== "payload-live-preview" || payload.data === null || typeof payload.data !== "object") return;
      setPage(payload.data as CmsDocument);
    };
    window.parent.postMessage({ type: "payload-live-preview", ready: true }, cmsOrigin);
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [initialPage]);

  return <article className="detail-page"><p className="eyebrow">Published page</p><h1>{page.title ?? "Untitled page"}</h1><p className="detail-intro">{page.seo?.metaDescription ?? "This page is published from the Stack & Scale CMS."}</p><div className="detail-body"><CmsPageBlocks document={page} /></div></article>;
}
