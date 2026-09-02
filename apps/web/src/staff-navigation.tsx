"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          primeStaffAudio(nextOpen ? "open" : "close");
        }}
      >
        <DialogTrigger
          render={<Button className="staff-search-trigger" size="sm" variant="outline" />}
        >
          Find a workspace <kbd>Ctrl K</kbd>
        </DialogTrigger>
        <DialogContent className="staff-search-dialog max-w-lg">
          <DialogHeader>
            <DialogTitle>Go to workspace</DialogTitle>
            <DialogDescription>Search the staff workspace destinations.</DialogDescription>
          </DialogHeader>
          <Input
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
        </DialogContent>
      </Dialog>
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
        <Button
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
        </Button>
        <Button
          className="staff-exit"
          render={<a href="/api/auth/logout" />}
          variant="link"
          onClick={() => primeStaffAudio("lock")}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
