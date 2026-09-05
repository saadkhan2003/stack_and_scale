"use client";

import * as React from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";
import type { CmsAnnouncement } from "./cms-content";

type AnnouncementBarProps = {
  announcement?: CmsAnnouncement | null | undefined;
};

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const stored = window.sessionStorage.getItem("announcement_dismissed");
        if (stored === announcement?.text) {
          setDismissed(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [announcement?.text]);

  if (!announcement?.enabled || !announcement.text || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      if (
        typeof window !== "undefined" &&
        window.sessionStorage &&
        announcement.text
      ) {
        window.sessionStorage.setItem(
          "announcement_dismissed",
          announcement.text,
        );
      }
    } catch {
      // Ignore storage errors
    }
  };

  const badgeText = announcement.badge || "NEW";
  const href = announcement.ctaHref || "/#announcement";

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 flex items-center justify-between px-3 py-1.5 sm:px-4 text-xs bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-white/[0.08] text-neutral-200 transition-all"
    >
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center truncate">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/15 tracking-wide uppercase shadow-sm shrink-0">
          <Sparkles className="w-2.5 h-2.5 text-blue-400" />
          {badgeText}
        </span>
        <span className="truncate font-medium text-neutral-300">
          {announcement.text}
        </span>
        {announcement.ctaText ? (
          <a
            href={href}
            className="inline-flex items-center gap-1 font-semibold text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 group underline underline-offset-2"
          >
            {announcement.ctaText}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors shrink-0 ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
