import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PortalControls } from "./portal-controls";

export const metadata: Metadata = {
  title: "Client portal | Stack & Scale",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function arrayAt(value: unknown, key: string): unknown[] {
  return isJsonRecord(value) && Array.isArray(value[key])
    ? (value[key] as unknown[])
    : [];
}

async function portalGet(path: string, cookie: string): Promise<unknown> {
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      headers: { cookie, "x-correlation-id": crypto.randomUUID() },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export default async function PortalPage(
  props: Readonly<{ params: Promise<{ clientOrganizationId: string }> }>,
) {
  const { clientOrganizationId } = await props.params;
  const cookie = (await cookies()).toString();
  const prefix = `/api/v1/portal/client-organizations/${encodeURIComponent(clientOrganizationId)}`;
  const [
    access,
    home,
    documents,
    files,
    tickets,
    activity,
    reviews,
    preferences,
  ] = await Promise.all([
    portalGet(`${prefix}/access`, cookie),
    portalGet(`${prefix}/home`, cookie),
    portalGet(`${prefix}/documents`, cookie),
    portalGet(`${prefix}/files`, cookie),
    portalGet(`${prefix}/support/tickets`, cookie),
    portalGet(`${prefix}/activity`, cookie),
    portalGet(`${prefix}/reviews`, cookie),
    portalGet(`${prefix}/notification-preferences`, cookie),
  ]);

  if (
    !isJsonRecord(access) ||
    (access.role !== "client_admin" && access.role !== "client_member")
  ) {
    return (
      <main className="portal-unauth-container">
        <div className="portal-unauth-card">
          <p className="eyebrow">Client portal</p>
          <h1>Client portal</h1>
          <p>Sign in with an authorized client account to access this portal.</p>
          <Button render={<Link href="/signin">Sign in</Link>} />
        </div>
      </main>
    );
  }
  const accessRole = access.role;
  const membersResponse =
    accessRole === "client_admin"
      ? await portalGet(`${prefix}/members`, cookie)
      : null;
  const projects = arrayAt(home, "projects") as Array<{
    id: string;
    title: string;
    status: string;
    nextAction: string | null;
  }>;
  return (
    <main className="portal-layout" aria-labelledby="portal-heading">
      <p className="eyebrow">Client portal</p>
      <h1 id="portal-heading">Your work with Stack &amp; Scale</h1>
      <p>
        Signed in as an authorized{" "}
        {accessRole === "client_admin" ? "administrator" : "member"}.
      </p>
      <section>
        <h2>Projects</h2>
        {projects.length ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.title}</strong> — {project.status}
                {project.nextAction ? ` · ${project.nextAction}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>No projects are currently available.</p>
        )}
      </section>
      <section>
        <h2>Documents</h2>
        <p>
          {arrayAt(documents, "documents").length} published documents
          available.
        </p>
      </section>
      <section>
        <h2>Deliverables</h2>
        <p>{arrayAt(files, "files").length} clean deliverables available.</p>
      </section>
      <section>
        <h2>Support</h2>
        <p>{arrayAt(tickets, "tickets").length} client-visible tickets.</p>
      </section>
      <section>
        <h2>Activity</h2>
        <p>{arrayAt(activity, "activity").length} client-visible updates.</p>
      </section>
      <PortalControls
        clientOrganizationId={clientOrganizationId}
        reviews={
          arrayAt(reviews, "reviews") as Array<{
            id: string;
            target: { version: string; renderedChecksumSha256: string };
          }>
        }
        preferences={
          arrayAt(preferences, "preferences") as Array<{
            category: "security" | "billing" | "system";
            enabled: boolean;
          }>
        }
        tickets={
          arrayAt(tickets, "tickets") as Array<{
            id: string;
            subject: string;
            status: string;
          }>
        }
        members={
          arrayAt(membersResponse, "members") as Array<{
            id: string;
            email: string;
            role: "client_admin" | "client_member";
            status: "active" | "suspended" | "revoked";
          }>
        }
        canManageMembers={accessRole === "client_admin"}
      />
    </main>
  );
}
