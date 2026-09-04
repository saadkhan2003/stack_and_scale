"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, Sliders, X } from "lucide-react";

type Consent = "granted" | "denied" | null;

const consentKey = "stack-and-scale-analytics-consent";
const settingsKey = "stack-and-scale-cookie-settings";

interface DetailedConsent {
  essential: boolean;
  telemetry: boolean;
  marketing: boolean;
}

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(consentKey);
  return value === "granted" || value === "denied" ? value : null;
}

function readDetailedSettings(): DetailedConsent {
  if (typeof window === "undefined") {
    return { essential: true, telemetry: false, marketing: false };
  }
  const raw = window.localStorage.getItem(settingsKey);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return { essential: true, telemetry: false, marketing: false };
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
  const [consent, setConsent] = useState<Consent | "custom">(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [detailed, setDetailed] = useState<DetailedConsent>({
    essential: true,
    telemetry: true,
    marketing: false,
  });

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    } else {
      setConsent(existing);
      setDetailed(readDetailedSettings());
    }

    // Global listener so footer "Cookie Preferences" link can reopen banner anytime
    const handleReopen = () => {
      setShowSettings(true);
      setIsOpen(true);
    };
    window.addEventListener("open-cookie-settings", handleReopen);

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

    return () => {
      window.removeEventListener("open-cookie-settings", handleReopen);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const handleDeny = () => {
    window.localStorage.setItem(consentKey, "denied");
    window.localStorage.setItem(
      settingsKey,
      JSON.stringify({ essential: true, telemetry: false, marketing: false })
    );
    setConsent("denied");
    setIsOpen(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    window.localStorage.setItem(consentKey, "granted");
    window.localStorage.setItem(
      settingsKey,
      JSON.stringify({ essential: true, telemetry: true, marketing: true })
    );
    setConsent("granted");
    setIsOpen(false);
    setShowSettings(false);
  };

  const handleSaveDetailed = () => {
    const isGranted = detailed.telemetry || detailed.marketing;
    window.localStorage.setItem(consentKey, isGranted ? "granted" : "denied");
    window.localStorage.setItem(settingsKey, JSON.stringify(detailed));
    setConsent(isGranted ? "granted" : "denied");
    setIsOpen(false);
    setShowSettings(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Privacy & Tracking Preferences"
      className="fixed bottom-6 left-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-2xl bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-zinc-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      {!showSettings ? (
        /* Linear exact default view */
        <div>
          <p className="text-[13px] sm:text-sm text-zinc-300 font-normal leading-relaxed mb-4">
            This site uses tracking technologies. You may opt in or opt out of the use of these technologies.
          </p>

          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeny}
                type="button"
                className="px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30 text-xs font-medium transition-all cursor-pointer"
              >
                Deny
              </button>
              <button
                onClick={handleAcceptAll}
                type="button"
                className="px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30 text-xs font-medium transition-all cursor-pointer"
              >
                Accept all
              </button>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              type="button"
              className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Consent Settings
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Consent Settings Drawer */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Sliders className="w-4 h-4 text-[#80ddd1]" />
              <span>Consent Preferences</span>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Essential */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>Essential Infrastructure</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">
                    Always Active
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Required for zero-trust token authentication, edge state, and sovereign API routing.
                </p>
              </div>
              <Check className="w-4 h-4 text-[#80ddd1] shrink-0 mt-0.5" />
            </div>

            {/* Telemetry */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div>
                <div className="font-semibold text-white">Performance Telemetry</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Anonymous latency monitoring and edge sync performance stats. No PII collected.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDetailed((prev) => ({ ...prev, telemetry: !prev.telemetry }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  detailed.telemetry ? "bg-[#80ddd1]" : "bg-white/20"
                }`}
                aria-pressed={detailed.telemetry}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-black transition-transform ${
                    detailed.telemetry ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Marketing / Attribution */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div>
                <div className="font-semibold text-white">Marketing &amp; Attribution</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Help us understand how enterprise operators discover our sovereign software platform.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDetailed((prev) => ({ ...prev, marketing: !prev.marketing }))
                }
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  detailed.marketing ? "bg-[#80ddd1]" : "bg-white/20"
                }`}
                aria-pressed={detailed.marketing}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-black transition-transform ${
                    detailed.marketing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <button
              onClick={() => setShowSettings(false)}
              type="button"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeny}
                type="button"
                className="px-3 py-1.5 rounded-full border border-white/20 text-xs text-zinc-300 hover:text-white"
              >
                Reject all
              </button>
              <button
                onClick={handleSaveDetailed}
                type="button"
                className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
