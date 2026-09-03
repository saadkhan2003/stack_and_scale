"use client";

import { useEffect, useState } from "react";
import { FileText, ArrowUpRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Proposal = {
  id: string;
  title: string;
  status: string;
  lead_id: string;
  current_version: number;
  updated_at: string;
};

function getProposalBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "accepted":
      return "default";
    case "draft":
      return "secondary";
    case "sent":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function StaffProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [notice, setNotice] = useState("Loading proposals...");

  useEffect(() => {
    void fetch("/api/staff/proposals", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setNotice("Unable to load proposals.");
          return;
        }
        const data = (await response.json()) as { data: Proposal[] };
        setProposals(data.data);
        setNotice(data.data.length ? "" : "No proposals yet.");
      })
      .catch(() => setNotice("Unable to load proposals."));
  }, []);

  return (
    <section className="staff-crm" aria-labelledby="proposals-heading">
      <div className="staff-crm-header">
        <p className="eyebrow">Commercial Workspace</p>
        <h1 id="proposals-heading">Proposals</h1>
        <p className="staff-crm-lede">
          Commercial agreements, scope documents, and client proposals managed
          across all active pipeline opportunities.
        </p>
      </div>

      {notice ? (
        <div className="staff-notice-banner" role="status">
          <AlertCircle
            className="h-4 w-4 shrink-0 text-petrol"
            aria-hidden="true"
          />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="staff-proposals-grid">
        <ul className="staff-lead-list">
          {proposals.map((proposal) => (
            <li key={proposal.id}>
              <div className="staff-proposal-card">
                <div className="staff-proposal-card-top">
                  <div className="flex items-center gap-2">
                    <FileText
                      className="h-4 w-4 text-petrol shrink-0"
                      aria-hidden="true"
                    />
                    <strong>{proposal.title}</strong>
                  </div>
                  <Badge
                    variant={getProposalBadgeVariant(proposal.status)}
                    className="capitalize"
                  >
                    {proposal.status}
                  </Badge>
                </div>
                <div className="staff-proposal-card-meta">
                  <span>
                    Version {proposal.current_version} &middot; Lead ID{" "}
                    {proposal.lead_id.slice(0, 8)}
                  </span>
                  <span>
                    {new Date(proposal.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
