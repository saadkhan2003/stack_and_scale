"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { playStaffCue } from "./staff-sfx";

type Lead = {
  id: string;
  name: string | null;
  email: string;
  intakeType: string;
  stage: string;
  ownerId: string | null;
  createdAt: string;
};
type Task = {
  id: string;
  title: string;
  assignee_id: string | null;
  due_at: string | null;
  completed_at: string | null;
  status: "open" | "overdue" | "completed";
  priority: "normal" | "high";
  isOverdue: boolean;
};
type TimelineItem = {
  id: string;
  kind: string;
  eventType: string;
  occurredAt: string;
  title: string;
  detail?: string | null;
  status?: string;
};
type Detail = Lead & {
  phone: string | null;
  message: string | null;
  consentAt: string | null;
  probability: number;
  estimatedValue: number | null;
  nextActionAt: string | null;
  lostReason: string | null;
  notes: { id: string; body: string; created_at: string }[];
  activities: { id: string; type: string; created_at: string }[];
  tasks: Task[];
  timeline: TimelineItem[];
  opportunities: { id: string; pipeline: string; stage: string }[];
};
type KnowledgeSuggestion = {
  id: string;
  title: string;
  content_type: string;
  review_at: string;
};

export const sensitiveLeadFields = [
  { key: "email", label: "Email", editable: false },
  { key: "phone", label: "Phone", editable: false },
  { key: "message", label: "Original enquiry", editable: false },
  { key: "consentAt", label: "Consent recorded", editable: false },
] as const;

export function getTaskPresentation(
  task: Pick<Task, "completed_at" | "due_at">,
  now = new Date(),
): Pick<Task, "status" | "priority" | "isOverdue"> {
  const completed = Boolean(task.completed_at);
  const overdue =
    !completed &&
    Boolean(task.due_at) &&
    Date.parse(task.due_at!) < now.getTime();
  return {
    status: completed ? "completed" : overdue ? "overdue" : "open",
    priority: overdue ? "high" : "normal",
    isOverdue: overdue,
  };
}

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "Not recorded";

export function StaffLeadInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [notice, setNotice] = useState("Loading CRM inbox...");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>([]);
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
      playStaffCue("error");
      return;
    }
    const payload = (await response.json()) as { data: Detail };
    setSelected(payload.data);
    const suggestionsResponse = await fetch(
      `/api/staff/operations/knowledge/suggestions?leadId=${encodeURIComponent(leadId)}`,
      { cache: "no-store" },
    );
    if (suggestionsResponse.ok) {
      setSuggestions(
        ((await suggestionsResponse.json()) as { data: KnowledgeSuggestion[] })
          .data,
      );
    } else {
      setSuggestions([]);
    }
    playStaffCue("open");
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
      playStaffCue("error");
      return;
    }
    await open(selected.id);
    await refresh();
    playStaffCue("success");
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
      playStaffCue("error");
      return;
    }
    await open(selected.id);
    playStaffCue("success");
  };
  const task = async (form: FormData) => {
    if (!selected) return;
    const title = form.get("title");
    const assigneeId = form.get("assigneeId");
    const dueAt = form.get("dueAt");
    if (typeof title !== "string" || !title.trim()) return;
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(selected.id)}/tasks`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          assigneeId:
            typeof assigneeId === "string" && assigneeId.trim()
              ? assigneeId.trim()
              : null,
          dueAt:
            typeof dueAt === "string" && dueAt
              ? new Date(dueAt).toISOString()
              : null,
        }),
      },
    );
    if (!response.ok) {
      setNotice("Unable to create the follow-up task.");
      playStaffCue("error");
      return;
    }
    await open(selected.id);
    playStaffCue("success");
  };
  const completeTask = async (taskId: string) => {
    if (!selected) return;
    setBusyTask(taskId);
    const response = await fetch(
      `/api/staff/crm/leads/${encodeURIComponent(selected.id)}/tasks/${encodeURIComponent(taskId)}/complete`,
      { method: "PATCH" },
    );
    if (!response.ok) {
      setNotice("Unable to complete the follow-up task.");
      playStaffCue("error");
    } else {
      await open(selected.id);
      playStaffCue("check");
    }
    setBusyTask(null);
  };
  return (
    <section className="staff-crm" aria-labelledby="crm-heading">
      <p className="eyebrow">Staff CRM</p>
      <h1 id="crm-heading">Lead inbox</h1>
      <p className="staff-crm-lede">
        A factual record of each relationship, with the next follow-up in view.
      </p>
      {notice ? <p role="status">{notice}</p> : null}
      <div className="staff-crm-grid">
        <div>
          <ul className="staff-lead-list">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void open(lead.id)}
                >
                  <strong>{lead.name ?? lead.email}</strong>
                  <span>
                    {lead.intakeType} · {lead.stage}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {selected ? (
          <article className="staff-lead-detail">
            <header className="staff-lead-heading">
              <div>
                <p className="eyebrow">360 lead record</p>
                <h2>{selected.name ?? selected.email}</h2>
              </div>
              <Badge className="staff-record-id" variant="outline">
                {selected.intakeType}
              </Badge>
            </header>
            <section
              className="staff-sensitive"
              aria-labelledby="sensitive-heading"
            >
              <h3 id="sensitive-heading">Sensitive lead fields</h3>
              <p>
                Visible to authorized CRM staff. These fields are factual source
                data and cannot be edited here.
              </p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selected.phone ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt>Original enquiry</dt>
                  <dd>{selected.message ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt>Consent recorded</dt>
                  <dd>{formatDate(selected.consentAt)}</dd>
                </div>
              </dl>
            </section>
            <p>
              Pipeline: {selected.opportunities[0]?.pipeline ?? "Shared pool"}
            </p>
            <section aria-labelledby="knowledge-suggestions-heading">
              <h3 id="knowledge-suggestions-heading">Suggested procedures</h3>
              <ul>
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>{" "}
                    <span>{item.content_type}</span>
                  </li>
                ))}
              </ul>
              {!suggestions.length ? (
                <p>No contextual procedures found.</p>
              ) : null}
            </section>
            <form action={(form) => void update(form)}>
              <Label>
                Owner ID
                <Input defaultValue={selected.ownerId ?? ""} name="ownerId" />
              </Label>
              <Label>
                Stage
                <Select defaultValue={selected.stage} name="stage">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <Label>
                Probability
                <Input
                  defaultValue={selected.probability ?? 0}
                  max="100"
                  min="0"
                  name="probability"
                  type="number"
                />
              </Label>
              <Label>
                Estimated value
                <Input
                  defaultValue={selected.estimatedValue ?? ""}
                  min="0"
                  name="estimatedValue"
                  type="number"
                />
              </Label>
              <Label>
                Next action
                <Input
                  defaultValue={selected.nextActionAt?.slice(0, 16) ?? ""}
                  name="nextActionAt"
                  type="datetime-local"
                />
              </Label>
              <Label>
                Lost reason
                <Input
                  defaultValue={selected.lostReason ?? ""}
                  name="lostReason"
                />
              </Label>
              <Button type="submit">Save lead</Button>
            </form>
            <section aria-labelledby="follow-up-heading">
              <h3 id="follow-up-heading">Follow-up tasks</h3>
              <p className="staff-field-note">
                Priority is derived: overdue open tasks are high; the existing
                schema does not persist custom priority, status, or task
                comments.
              </p>
              <ul className="staff-task-list">
                {selected.tasks.map((item) => (
                  <li
                    key={item.id}
                    className={item.isOverdue ? "is-overdue" : undefined}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.status} · {item.priority} priority ·{" "}
                        {item.due_at
                          ? `Due ${formatDate(item.due_at)}`
                          : "No due date"}
                      </span>
                    </div>
                    {item.status !== "completed" ? (
                      <Button
                        aria-label={`Complete ${item.title}`}
                        disabled={busyTask === item.id}
                        onClick={() => void completeTask(item.id)}
                        type="button"
                      >
                        {busyTask === item.id ? "Saving..." : "Complete"}
                      </Button>
                    ) : (
                      <span aria-label="Completed">
                        Completed {formatDate(item.completed_at)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <form action={(form) => void task(form)}>
                <Label>
                  New follow-up task
                  <Input name="title" required />
                </Label>
                <Label>
                  Assignee ID
                  <Input name="assigneeId" />
                </Label>
                <Label>
                  Due date
                  <Input name="dueAt" type="datetime-local" />
                </Label>
                <Button type="submit" variant="secondary">
                  Create task
                </Button>
              </form>
            </section>
            <section aria-labelledby="timeline-heading">
              <h3 id="timeline-heading">Timeline</h3>
              <ol className="staff-timeline">
                {selected.timeline.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <span className="staff-timeline-kind">{item.kind}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail ?? item.status ?? item.eventType}</p>
                      <time dateTime={String(item.occurredAt)}>
                        {formatDate(String(item.occurredAt))}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="notes-heading">
              <h3 id="notes-heading">Notes and comments</h3>
              <p className="staff-field-note">
                Notes are append-only narrative entries and are kept separate
                from factual timeline events.
              </p>
              <ul>
                {selected.notes.map((item) => (
                  <li key={item.id}>{item.body}</li>
                ))}
              </ul>
              <form action={(form) => void note(form)}>
                <Label>
                  Add note
                  <Textarea name="body" required rows={3} />
                </Label>
                <Button type="submit" variant="secondary">
                  Add note
                </Button>
              </form>
            </section>
          </article>
        ) : (
          <p>Select a lead to review its timeline.</p>
        )}
      </div>
    </section>
  );
}
