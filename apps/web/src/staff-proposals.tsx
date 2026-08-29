"use client";

import { useEffect, useState } from "react";

type Proposal = {
  id: string;
  title: string;
  status: string;
  lead_id: string;
  current_version: number;
  updated_at: string;
};

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
      <p className="eyebrow">Commercial workspace</p>
      <h1 id="proposals-heading">Proposals</h1>
      {notice ? <p role="status">{notice}</p> : null}
      <ul className="staff-lead-list">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <div>
              <strong>{proposal.title}</strong>
              <span>
                {proposal.status} · version {proposal.current_version} · lead{" "}
                {proposal.lead_id}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
