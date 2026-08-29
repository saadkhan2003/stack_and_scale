"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string | null;
  email: string;
  intakeType: string;
  stage: string;
  ownerId: string | null;
  createdAt: string;
};
type Detail = Lead & {
  message: string | null;
  probability: number;
  estimatedValue: number | null;
  nextActionAt: string | null;
  lostReason: string | null;
  notes: { id: string; body: string; created_at: string }[];
  activities: { id: string; type: string; created_at: string }[];
  tasks: { id: string; title: string; completed_at: string | null }[];
  opportunities: { id: string; pipeline: string; stage: string }[];
};

export function StaffLeadInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [notice, setNotice] = useState("Loading CRM inbox…");
  const refresh = async () => {
    const response = await fetch("/api/staff/crm/leads", { cache: "no-store" });
    if (!response.ok) {
      setNotice(
        response.status === 401
          ? "Sign in to access the CRM."
          : response.status === 403
            ? "You do not have access to the CRM."
            : response.status === 503
              ? "CRM is temporarily unavailable."
              : "Unable to load the CRM inbox.",
      );
      return;
    }
    const payload = (await response.json()) as { data: Lead[] };
    setLeads(payload.data);
    setNotice(payload.data.length ? "" : "No leads yet.");
  };
  useEffect(() => {
    void refresh();
  }, []);
  const open = async (leadId: string) => {
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(leadId)}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      setNotice("Unable to load this lead.");
      return;
    }
    const payload = (await response.json()) as { data: Detail };
    setSelected(payload.data);
  };
  const update = async (form: FormData) => {
    if (!selected) return;
    const ownerId = form.get("ownerId");
    const nextActionAt = form.get("nextActionAt");
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(selected.id)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          stage: form.get("stage"),
          probability: Number(form.get("probability")),
          estimatedValue: Number(form.get("estimatedValue")) || null,
          ownerId:
            typeof ownerId === "string" && ownerId.trim()
              ? ownerId.trim()
              : null,
          nextActionAt:
            typeof nextActionAt === "string" && nextActionAt
              ? new Date(nextActionAt).toISOString()
              : null,
          lostReason: form.get("lostReason") || null,
        }),
      },
    );
    if (!response.ok) {
      setNotice("Unable to update this lead.");
      return;
    }
    await open(selected.id);
    await refresh();
  };
  const note = async (form: FormData) => {
    if (!selected) return;
    const body = form.get("body");
    if (typeof body !== "string" || !body.trim()) return;
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(selected.id)}/notes`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      },
    );
    if (!response.ok) {
      setNotice("Unable to add the note.");
      return;
    }
    await open(selected.id);
  };
  const task = async (form: FormData) => {
    if (!selected) return;
    const title = form.get("title");
    if (typeof title !== "string" || !title.trim()) return;
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(selected.id)}/tasks`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      },
    );
    if (!response.ok) {
      setNotice("Unable to create the follow-up task.");
      return;
    }
    await open(selected.id);
  };
  return (
    <section className="staff-crm" aria-labelledby="crm-heading">
      <p className="eyebrow">Staff CRM</p>
      <h1 id="crm-heading">Lead inbox</h1>
      {notice ? <p role="status">{notice}</p> : null}
      <div className="staff-crm-grid">
        <div>
          <ul className="staff-lead-list">
            {leads.map((lead) => (
              <li key={lead.id}>
                <button type="button" onClick={() => void open(lead.id)}>
                  <strong>{lead.name ?? lead.email}</strong>
                  <span>
                    {lead.intakeType} · {lead.stage}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selected ? (
          <article className="staff-lead-detail">
            <h2>{selected.name ?? selected.email}</h2>
            <p>{selected.email}</p>
            <p>{selected.message}</p>
            <p>
              Pipeline: {selected.opportunities[0]?.pipeline ?? "Shared pool"}
            </p>
            <form action={(form) => void update(form)}>
              <label>
                Owner ID
                <input defaultValue={selected.ownerId ?? ""} name="ownerId" />
              </label>
              <label>
                Stage
                <select defaultValue={selected.stage} name="stage">
                  <option value="new">New</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </label>
              <label>
                Probability
                <input
                  defaultValue={selected.probability ?? 0}
                  max="100"
                  min="0"
                  name="probability"
                  type="number"
                />
              </label>
              <label>
                Estimated value
                <input
                  defaultValue={selected.estimatedValue ?? ""}
                  min="0"
                  name="estimatedValue"
                  type="number"
                />
              </label>
              <label>
                Next action
                <input
                  defaultValue={selected.nextActionAt?.slice(0, 16) ?? ""}
                  name="nextActionAt"
                  type="datetime-local"
                />
              </label>
              <label>
                Lost reason
                <input
                  defaultValue={selected.lostReason ?? ""}
                  name="lostReason"
                />
              </label>
              <button className="button button-primary" type="submit">
                Save lead
              </button>
            </form>
            <h3>Follow-up</h3>
            <ul>
              {selected.tasks.map((item) => (
                <li key={item.id}>
                  {item.title}
                  {item.completed_at ? " — completed" : ""}
                </li>
              ))}
            </ul>
            <form action={(form) => void task(form)}>
              <label>
                New follow-up task
                <input name="title" required />
              </label>
              <button className="button button-secondary" type="submit">
                Create task
              </button>
            </form>
            <h3>Notes</h3>
            <ul>
              {selected.notes.map((item) => (
                <li key={item.id}>{item.body}</li>
              ))}
            </ul>
            <form action={(form) => void note(form)}>
              <label>
                Add note
                <textarea name="body" required rows={3} />
              </label>
              <button className="button button-secondary" type="submit">
                Add note
              </button>
            </form>
            <h3>Activity</h3>
            <ul>
              {selected.activities.map((item) => (
                <li key={item.id}>{item.type}</li>
              ))}
            </ul>
          </article>
        ) : (
          <p>Select a lead to review its timeline.</p>
        )}
      </div>
    </section>
  );
}
