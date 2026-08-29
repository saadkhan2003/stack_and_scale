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

export type StaffSummary = Readonly<{
  newLeads: ReadonlyArray<{
    id: string;
    name: string | null;
    email: string;
    intakeType: string;
    createdAt: string;
  }>;
  overdueTasks: ReadonlyArray<{
    id: string;
    leadId: string;
    title: string;
    dueAt: string;
    leadName: string | null;
    leadEmail: string;
  }>;
  upcomingDemos: ReadonlyArray<{
    id: string;
    leadId: string;
    startsAt: string;
    timezone: string;
    leadName: string | null;
    leadEmail: string;
  }>;
  stageCounts: ReadonlyArray<{ stage: string; count: number }>;
  unresolvedSupportItems: ReadonlyArray<{
    id: string;
    title: string;
    status: string;
    severity: string;
    updatedAt: string;
  }>;
  pendingApprovals: ReadonlyArray<{
    id: string;
    resourceType: string;
    resourceId: string;
    expiresAt: string;
    reminderAt: string | null;
  }>;
}>;

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
  initialSummary = null,
}: Readonly<{
  initialAccessState?: Exclude<StaffAccessState, "loading"> | "loading";
  initialSummary?: StaffSummary | null;
}>) {
  const [state, setState] = useState<StaffAccessState>(initialAccessState);
  const [summary, setSummary] = useState<StaffSummary | null>(initialSummary);

  useEffect(() => {
    if (initialAccessState !== "loading") return;
    let active = true;
    const checkAccess = async () => {
      setState("loading");
      try {
        const response = await fetch("/api/staff/crm/summary", {
          cache: "no-store",
        });
        if (!active) return;
        if (!response.ok) {
          setState(staffAccessState(response.status));
          playStaffCue(response.status === 403 ? "blocked" : "error");
          return;
        }
        const payload = (await response.json()) as { data?: StaffSummary };
        if (!payload.data) {
          setState("error");
          return;
        }
        setSummary(payload.data);
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

  const dashboardSummary = summary ?? {
    newLeads: [],
    overdueTasks: [],
    upcomingDemos: [],
    stageCounts: [],
    unresolvedSupportItems: [],
    pendingApprovals: [],
  };
  const totalLeads = dashboardSummary.stageCounts.reduce(
    (total, item) => total + item.count,
    0,
  );
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
        <QueueCard
          className="staff-module-primary"
          count={dashboardSummary.newLeads.length}
          href="/staff/leads"
          index="01"
          label="New leads"
          items={dashboardSummary.newLeads
            .slice(0, 3)
            .map((lead) => lead.name ?? lead.email)}
          summary={`Unworked leads in the CRM, capped at 50 records. ${totalLeads} total pipeline records are represented below.`}
        />
        <QueueCard
          count={dashboardSummary.overdueTasks.length}
          href="/staff/leads"
          index="02"
          label="Overdue follow-ups"
          items={dashboardSummary.overdueTasks
            .slice(0, 3)
            .map((task) => task.title)}
          summary="Open tasks whose due time has passed. Review the linked lead and complete the next action."
        />
        <QueueCard
          count={dashboardSummary.upcomingDemos.length}
          href="/staff/leads"
          index="03"
          label="Upcoming demos"
          items={dashboardSummary.upcomingDemos
            .slice(0, 3)
            .map((demo) => demo.leadName ?? demo.leadEmail)}
          summary="Confirmed demos scheduled in the next 14 days, shown in their stored booking timezone."
        />
        <QueueCard
          count={totalLeads}
          href="/staff/leads"
          index="04"
          label="Pipeline stages"
          items={dashboardSummary.stageCounts.map(
            (item) => `${item.stage}: ${item.count}`,
          )}
          summary="Current lead stage counts. Open the lead inbox to inspect and progress records."
        />
        <QueueCard
          count={dashboardSummary.pendingApprovals.length}
          href="/staff/operations"
          index="05"
          label="Pending approvals"
          items={dashboardSummary.pendingApprovals
            .slice(0, 3)
            .map(
              (approval) => `${approval.resourceType}: ${approval.resourceId}`,
            )}
          summary="Actionable approval requests that have not expired. Policy checks still apply when a decision is submitted."
        />
        <QueueCard
          count={dashboardSummary.unresolvedSupportItems.length}
          href="/staff/operations"
          index="06"
          label="Unresolved support"
          items={dashboardSummary.unresolvedSupportItems
            .slice(0, 3)
            .map((item) => item.title)}
          summary="Support items in open, in-progress, or pending-customer states, excluding resolved and closed records."
        />
      </div>
    </section>
  );
}

function QueueCard({
  className = "",
  count,
  href,
  index,
  items,
  label,
  summary,
}: Readonly<{
  className?: string;
  count: number;
  href: string;
  index: string;
  items: string[];
  label: string;
  summary: string;
}>) {
  return (
    <a
      className={`staff-module ${className}`}
      href={href}
      onClick={() => playStaffCue("open")}
    >
      <span className="staff-module-index">{index}</span>
      <h2>{label}</h2>
      <p>{summary}</p>
      {items.length ? (
        <ul className="staff-queue-items">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <span className="staff-module-note">Nothing needs attention</span>
      )}
      <strong>
        {count} {label.toLocaleLowerCase()} <span aria-hidden="true">↗</span>
      </strong>
    </a>
  );
}
