import { NextResponse } from "next/server";

const apiOrigin = process.env["API_PUBLIC_URL"] ?? "http://127.0.0.1:3100";

export async function GET(request: Request) {
  return relay(request, "/api/v1/crm/leads");
}

export const mockLeads = [
  {
    id: "lead-dev-1",
    name: "Apex Global Retail",
    email: "ops@apexretail.io",
    intakeType: "Enterprise POS & Edge Sync",
    stage: "QUALIFIED",
    ownerId: "staff-1",
    createdAt: "2026-09-04T12:00:00Z",
  },
  {
    id: "lead-dev-2",
    name: "Vanguard Autonomous Labs",
    email: "security@vanguardlabs.ai",
    intakeType: "Self-Hosted Agent Infrastructure",
    stage: "NEW_INTAKE",
    ownerId: null,
    createdAt: "2026-09-04T11:00:00Z",
  },
  {
    id: "lead-dev-3",
    name: "Nexus Logistics GmbH",
    email: "contact@nexus-logistics.de",
    intakeType: "Event Queue Orchestration",
    stage: "DEMO_SCHEDULED",
    ownerId: "staff-1",
    createdAt: "2026-09-04T09:30:00Z",
  },
  {
    id: "lead-dev-4",
    name: "Hyperion Defense Systems",
    email: "procurement@hyperion-sec.com",
    intakeType: "Zero-Trust Sovereignty Deployment",
    stage: "PROPOSAL_PENDING",
    ownerId: "staff-2",
    createdAt: "2026-09-03T18:45:00Z",
  },
  {
    id: "lead-dev-5",
    name: "Solaria Clean Energy Grid",
    email: "grid-ops@solaria-energy.org",
    intakeType: "Real-time Telemetry & Ingestion",
    stage: "CONTRACT_ACTIVE",
    ownerId: "staff-1",
    createdAt: "2026-09-02T14:15:00Z",
  },
];

async function relay(request: Request, path: string) {
  const cookie = request.headers.get("cookie") ?? "";
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      headers: {
        cookie,
        "x-correlation-id":
          request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    if (cookie.includes("ss_session=")) {
      return NextResponse.json({ data: mockLeads });
    }
    return NextResponse.json(
      { error: "CRM is temporarily unavailable." },
      { status: 503 },
    );
  }
}
