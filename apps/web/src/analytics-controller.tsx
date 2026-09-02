"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Consent = "granted" | "denied" | null;

const consentKey = "stack-and-scale-analytics-consent";

function readConsent(): Consent {
  const value = window.localStorage.getItem(consentKey);
  return value === "granted" || value === "denied" ? value : null;
}

function track(name: string, data: Record<string, string>) {
  if (readConsent() !== "granted") return;
  const umami = window.umami;
  if (typeof umami?.track === "function") umami.track(name, data);
}

declare global {
  interface Window {
    umami?: { track?: (name: string, data: Record<string, string>) => void };
  }
}

export function AnalyticsController() {
  const [consent, setConsent] = useState<Consent>(null);
  useEffect(() => {
    setConsent(readConsent());
    const onClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;
      const href = target.getAttribute("href") ?? "";
      const category = href.startsWith("mailto:")
        ? "email_handoff"
        : href.includes("contact")
          ? "contact_interest"
          : href.includes("products")
            ? "product_interest"
            : href.includes("resources")
              ? "resource_interest"
              : "navigation";
      track("cta_click", { category, destination: href.slice(0, 160) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  const decide = (decision: Exclude<Consent, null>) => {
    window.localStorage.setItem(consentKey, decision);
    setConsent(decision);
  };
  if (consent !== null) return null;
  return (
    <aside aria-label="Analytics preference" className="consent-banner">
      <p>
        We use optional, privacy-safe measurement only if you allow it. No form
        content is tracked.
      </p>
      <div>
        <Button onClick={() => decide("denied")} type="button" variant="outline">
          Decline
        </Button>
        <Button
          onClick={() => decide("granted")}
          type="button"
        >
          Allow analytics
        </Button>
      </div>
      <a href="/cookies">Cookie details</a>
    </aside>
  );
}
