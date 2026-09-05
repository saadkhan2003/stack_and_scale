"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";

type SessionApiResponse = {
  authenticated: boolean;
  role?: string;
  workspaceUrl?: string;
};

export type SessionState = {
  authenticated: boolean;
  role: string;
  workspaceUrl?: string;
};

export function useSessionAuth(initialSession?: SessionState) {
  const [session, setSession] = useState<SessionState>(
    initialSession ?? { authenticated: false, role: "anonymous" },
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session", {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    })
      .then((res) =>
        res.ok ? (res.json() as Promise<SessionApiResponse>) : null,
      )
      .then((data) => {
        if (isMounted && data && data.authenticated) {
          setSession({
            authenticated: data.authenticated,
            role: data.role ?? "staff",
            workspaceUrl: data.workspaceUrl ?? "/staff/leads",
          });
        }
      })
      .catch(() => {
        // Fallback silently if offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return session;
}

type HeaderAuthProps = {
  initialSession?: SessionState | undefined;
};

export function SiteHeaderAuth({ initialSession }: HeaderAuthProps) {
  const session = useSessionAuth(initialSession);

  if (session.authenticated) {
    const isStaff = session.role === "staff" || session.role === "admin";
    const workspaceUrl = isStaff
      ? "/staff/leads"
      : (session.workspaceUrl ?? "/portal/demo");
    const label = isStaff ? "Staff Workspace" : "Client Portal";

    return (
      <div className="flex items-center gap-2">
        <a
          href={workspaceUrl}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shadow-sm backdrop-blur-md group"
          title={label}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
          <span>{label}</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a
          href="/api/auth/logout"
          className="text-xs text-neutral-400 hover:text-white px-2 py-1.5 rounded hover:bg-white/5 transition-colors flex items-center gap-1"
          title="Sign out of account"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden lg:inline">Sign out</span>
        </a>
      </div>
    );
  }

  return (
    <a
      href="/signin"
      className="text-[13.5px] font-medium text-black bg-white hover:bg-neutral-200 px-4 py-1.5 rounded-lg transition-all whitespace-nowrap shadow-sm"
    >
      Sign in
    </a>
  );
}

export function MobileHeaderAuthLink({ initialSession }: HeaderAuthProps) {
  const session = useSessionAuth(initialSession);

  if (session.authenticated) {
    const isStaff = session.role === "staff" || session.role === "admin";
    const workspaceUrl = isStaff ? "/staff/leads" : "/portal/demo";

    return (
      <a
        href={workspaceUrl}
        className="text-xs font-semibold text-emerald-400 hover:text-white px-2 py-1 hidden sm:inline-flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Workspace</span>
      </a>
    );
  }

  return (
    <a
      href="/signin"
      className="text-xs font-medium text-neutral-300 hover:text-white px-2 py-1 hidden sm:inline"
    >
      Log in
    </a>
  );
}
