"use client";

import { useEffect, useState } from "react";

import { playStaffCue } from "./staff-sfx";

export type StaffAccessState =
  | "loading"
  | "ready"
  | "anonymous"
  | "forbidden"
  | "degraded"
  | "error";

export function staffAccessState(
  status: number,
): Exclude<StaffAccessState, "loading" | "ready"> {
  if (status === 401) return "anonymous";
  if (status === 403) return "forbidden";
  if (status === 503) return "degraded";
  return "error";
}

function AccessMessage({
  state,
  retry,
}: Readonly<{ state: StaffAccessState; retry: () => void }>) {
  if (state === "anonymous") {
    return (
      <div className="staff-status staff-status-warning" role="alert">
        <span className="staff-status-code">401</span>
        <div>
          <h2>Sign-in required</h2>
          <p>Your staff session is missing or has expired.</p>
          <a
            className="button button-primary"
            href="/signin"
            onClick={() => playStaffCue("unlock")}
          >
            Continue to sign in
          </a>
        </div>
      </div>
    );
  }
  if (state === "forbidden") {
    return (
      <div className="staff-status staff-status-warning" role="alert">
        <span className="staff-status-code">403</span>
        <div>
          <h2>Access is restricted</h2>
          <p>Your active staff membership does not include CRM access.</p>
        </div>
      </div>
    );
  }
  if (state === "degraded") {
    return (
      <div className="staff-status staff-status-warning" role="alert">
        <span className="staff-status-code">503</span>
        <div>
          <h2>Workspace is degraded</h2>
          <p>
            CRM access is temporarily unavailable. Your session remains
            protected.
          </p>
          <button
            className="button button-secondary"
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="staff-status staff-status-error" role="alert">
      <span className="staff-status-code">!</span>
      <div>
        <h2>We could not verify the workspace</h2>
        <p>Something unexpected interrupted the staff access check.</p>
        <button
          className="button button-secondary"
          onClick={retry}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function StaffShell({
  initialAccessState = "loading",
  initialLeadCount = null,
}: Readonly<{
  initialAccessState?: Exclude<StaffAccessState, "loading"> | "loading";
  initialLeadCount?: number | null;
}>) {
  const [state, setState] = useState<StaffAccessState>(initialAccessState);
  const [leadCount, setLeadCount] = useState<number | null>(initialLeadCount);

  useEffect(() => {
    if (initialAccessState !== "loading") return;
    let active = true;
    const checkAccess = async () => {
      setState("loading");
      try {
        const response = await fetch("/api/staff/crm/leads", {
          cache: "no-store",
        });
        if (!active) return;
        if (!response.ok) {
          setState(staffAccessState(response.status));
          playStaffCue(response.status === 403 ? "blocked" : "error");
          return;
        }
        const payload = (await response.json()) as { data?: unknown[] };
        setLeadCount(Array.isArray(payload.data) ? payload.data.length : 0);
        setState("ready");
        playStaffCue("unlock");
      } catch {
        if (active) {
          setState("error");
          playStaffCue("error");
        }
      }
    };
    void checkAccess();
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <section
        className="staff-dashboard"
        aria-busy="true"
        aria-labelledby="staff-heading"
      >
        <p className="eyebrow">Staff workspace</p>
        <h1 id="staff-heading">Checking your workspace.</h1>
        <p className="staff-loading" role="status">
          Verifying the current session with CRM access controls...
        </p>
      </section>
    );
  }

  if (state !== "ready") {
    return (
      <section className="staff-dashboard" aria-labelledby="staff-heading">
        <p className="eyebrow">Staff workspace</p>
        <h1 id="staff-heading">Workspace access</h1>
        <AccessMessage retry={() => window.location.reload()} state={state} />
      </section>
    );
  }

  return (
    <section className="staff-dashboard" aria-labelledby="staff-heading">
      <div className="staff-dashboard-intro">
        <div>
          <p className="eyebrow">Staff workspace</p>
          <h1 id="staff-heading">Make the next useful move.</h1>
          <p>
            One protected place for the operational work that keeps client
            momentum clear.
          </p>
        </div>
        <span className="staff-live-status">
          <i aria-hidden="true" /> Session verified
        </span>
      </div>
      <div className="staff-dashboard-grid">
        <a
          className="staff-module staff-module-primary"
          href="/staff/leads"
          onClick={() => playStaffCue("open")}
        >
          <span className="staff-module-index">01</span>
          <h2>Lead inbox</h2>
          <p>
            Review the latest intake, update ownership and keep follow-up
            moving.
          </p>
          <strong>
            {leadCount ?? 0} active records <span aria-hidden="true">↗</span>
          </strong>
        </a>
        <div className="staff-module staff-module-muted">
          <span className="staff-module-index">02</span>
          <h2>Operational queues</h2>
          <p>
            Tasks, demos and reports will appear here as the workspace grows.
          </p>
          <span className="staff-module-note">Coming in the next release</span>
        </div>
      </div>
    </section>
  );
}
