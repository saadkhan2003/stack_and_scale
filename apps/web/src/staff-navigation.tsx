"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { primeStaffAudio, setSoundEnabled, soundEnabled } from "./staff-sfx";

export const staffNavigation = [
  { href: "/staff", label: "Dashboard" },
  { href: "/staff/leads", label: "Leads" },
  { href: "/staff/proposals", label: "Proposals" },
  { href: "/staff/search", label: "Operations search" },
  { href: "/staff/notifications", label: "Notifications" },
  { href: "/staff/knowledge", label: "Knowledge" },
  { href: "/staff/reports", label: "Reports" },
  { href: "/staff/operations", label: "Release & capacity" },
] as const;

function StaffCommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = staffNavigation.filter((item) =>
    item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        primeStaffAudio("open");
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="staff-command-search">
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="staff-search-trigger"
        onClick={() => {
          setOpen(true);
          primeStaffAudio("open");
        }}
        type="button"
      >
        Find a workspace <kbd>Ctrl K</kbd>
      </button>
      {open ? (
        <div
          className="staff-search-backdrop"
          onMouseDown={() => setOpen(false)}
          role="presentation"
        >
          <section
            aria-label="Staff workspace search"
            aria-modal="true"
            className="staff-search-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="staff-search-heading">
              <label htmlFor="staff-workspace-search">Go to</label>
              <button
                aria-label="Close workspace search"
                onClick={() => {
                  setOpen(false);
                  primeStaffAudio("close");
                }}
                type="button"
              >
                Close
              </button>
            </div>
            <input
              autoFocus
              id="staff-workspace-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Dashboard, leads, or search"
              type="search"
              value={query}
            />
            <nav
              aria-label="Workspace destinations"
              className="staff-search-results"
            >
              {results.map((item) => (
                <a
                  href={item.href}
                  key={item.href}
                  onClick={() => primeStaffAudio("select")}
                >
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
              {results.length === 0 ? <p>No workspace matches.</p> : null}
            </nav>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function StaffNavigation() {
  const currentPath = usePathname();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundEnabled());
  }, []);

  return (
    <header className="staff-header">
      <div className="staff-identity">
        <span className="staff-mark" aria-hidden="true">
          S/S
        </span>
        <div>
          <p className="eyebrow">Internal workspace</p>
          <strong>Stack &amp; Scale</strong>
        </div>
      </div>
      <nav aria-label="Staff workspace navigation" className="staff-nav">
        {staffNavigation.map((item) => (
          <a
            aria-current={currentPath === item.href ? "page" : undefined}
            href={item.href}
            key={item.href}
            onClick={() => primeStaffAudio("select")}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="staff-tools">
        <StaffCommandSearch />
        <button
          aria-pressed={enabled}
          className="staff-sound-toggle"
          onClick={() => {
            const next = !enabled;
            setSoundEnabled(next);
            setEnabled(next);
            if (next) primeStaffAudio("toggle-on");
          }}
          title="Toggle workspace sounds"
          type="button"
        >
          {enabled ? "Sound on" : "Sound off"}
        </button>
        <a
          className="staff-exit"
          href="/api/auth/logout"
          onClick={() => primeStaffAudio("lock")}
        >
          Sign out
        </a>
      </div>
    </header>
  );
}
