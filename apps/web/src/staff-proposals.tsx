"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, AlertCircle, Plus, X, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [prefillLeadId, setPrefillLeadId] = useState("");
  const [prefillTitle, setPrefillTitle] = useState("");
  const [prefillValue, setPrefillValue] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadProposals = async () => {
    try {
      const response = await fetch("/api/staff/proposals", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401) {
          setNotice("Sign in with authorized staff credentials to manage commercial proposals.");
        } else if (response.status === 403) {
          setNotice("You do not have staff permissions to view commercial proposals.");
        } else if (response.status === 503) {
          setNotice("Proposal service is temporarily unavailable.");
        } else {
          setNotice("Unable to load proposals.");
        }
        return;
      }
      const data = (await response.json()) as { data: Proposal[] };
      setProposals(data.data);
      setNotice(data.data.length ? "" : "No proposals yet.");
    } catch {
      setNotice("Unable to load proposals.");
    }
  };

  useEffect(() => {
    void loadProposals();

    // Pick up prefill from URL query params (e.g. coming from Lead drawer)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qLeadId = params.get("leadId") ?? "";
      const qTitle = params.get("title") ?? "";
      const qValue = params.get("value") ?? "";
      if (qLeadId) {
        setPrefillLeadId(qLeadId);
        setPrefillTitle(qTitle);
        setPrefillValue(qValue);
        setShowModal(true);
      }
    }
  }, []);

  // Open / close native <dialog>
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (showModal) {
      el.showModal();
    } else {
      el.close();
    }
  }, [showModal]);

  const createProposal = async (form: FormData) => {
    setIsCreating(true);
    try {
      const title = String(form.get("title") ?? "").trim();
      const leadId = String(form.get("leadId") ?? "").trim();
      const currency = String(form.get("currency") ?? "USD").trim();
      const validFrom = String(form.get("validFrom") ?? "").trim();
      const validUntil = String(form.get("validUntil") ?? "").trim();
      const rawValue = String(form.get("totalValue") ?? "").trim();
      const totalValue = rawValue && !Number.isNaN(Number(rawValue)) ? Number(rawValue) : null;

      if (!title) {
        setNotice("Proposal title is required.");
        setIsCreating(false);
        return;
      }

      const response = await fetch("/api/staff/proposals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          leadId: leadId || null,
          currency,
          validFrom: validFrom ? new Date(validFrom).toISOString() : null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          totalValue,
          lineItems: [],
        }),
      });

      if (!response.ok) {
        let errMsg = "Unable to create proposal.";
        try {
          const body = (await response.json()) as { message?: string; error?: string };
          errMsg = body.message ?? body.error ?? errMsg;
        } catch { /* ignore */ }
        setNotice(errMsg);
        setIsCreating(false);
        return;
      }

      setShowModal(false);
      setNotice("");
      await loadProposals();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="staff-crm" aria-labelledby="proposals-heading">
      <div className="staff-crm-header">
        <div>
          <p className="eyebrow">Commercial Workspace</p>
          <h1 id="proposals-heading">Proposals</h1>
          <p className="staff-crm-lede">
            Commercial agreements, scope documents, and client proposals managed
            across all active pipeline opportunities.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Proposal
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          className="staff-notice-banner flex items-center justify-between gap-4"
          role="status"
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-petrol"
              aria-hidden="true"
            />
            <span>{notice}</span>
          </div>
          {notice.includes("Sign in") ? (
            <a
              href="/signin"
              className="px-3 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              Sign in →
            </a>
          ) : null}
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
          {!proposals.length && !notice ? (
            <li>
              <div
                className="staff-proposal-card"
                style={{ textAlign: "center", padding: "2.5rem 1rem", opacity: 0.55 }}
              >
                <FilePlus
                  className="h-8 w-8 mx-auto mb-3 text-muted"
                  aria-hidden="true"
                />
                <p style={{ fontSize: "0.9rem" }}>
                  No proposals yet. Click <strong>New Proposal</strong> to get started.
                </p>
              </div>
            </li>
          ) : null}
        </ul>
      </div>

      {/* New Proposal Modal */}
      <dialog
        ref={dialogRef}
        style={{
          background: "var(--surface, #0f2028)",
          border: "1px solid rgba(128,221,209,0.2)",
          borderRadius: "18px",
          padding: 0,
          maxWidth: "540px",
          width: "calc(100vw - 2rem)",
          color: "inherit",
        }}
        onClose={() => setShowModal(false)}
      >
        <div style={{ padding: "1.75rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Commercial Workspace</p>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>New Proposal</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: "0.25rem",
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            action={(form) => void createProposal(form)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Label>
              Proposal Title *
              <Input
                name="title"
                defaultValue={prefillTitle}
                placeholder="e.g. Stack &amp; Scale Platform — Enterprise Proposal"
                required
              />
            </Label>
            <Label>
              Linked Lead ID
              <Input
                name="leadId"
                defaultValue={prefillLeadId}
                placeholder="lead_xxxxxxxx (optional)"
              />
            </Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Label>
                Total Value (USD)
                <Input
                  name="totalValue"
                  defaultValue={prefillValue}
                  placeholder="e.g. 45000"
                  type="number"
                  min="0"
                />
              </Label>
              <Label>
                Currency
                <Input
                  name="currency"
                  defaultValue="USD"
                  placeholder="USD"
                  maxLength={3}
                />
              </Label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Label>
                Valid From
                <Input name="validFrom" type="date" />
              </Label>
              <Label>
                Valid Until
                <Input name="validUntil" type="date" />
              </Label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Proposal"}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </section>
  );
}
