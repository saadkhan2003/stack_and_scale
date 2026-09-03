"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";

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

function getStageBadgeVariant(stage: string) {
  switch (stage.toLowerCase()) {
    case "won":
      return "default";
    case "qualified":
    case "proposal":
      return "secondary";
    case "lost":
      return "destructive";
    default:
      return "outline";
  }
}

export function StaffLeadInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [notice, setNotice] = useState("Loading CRM inbox...");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    setIsUpdating(true);
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
    setIsUpdating(false);
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

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        lead.email.toLowerCase().includes(query) ||
        lead.intakeType.toLowerCase().includes(query) ||
        lead.stage.toLowerCase().includes(query),
    );
  }, [leads, searchQuery]);

  return (
    <section className="staff-crm" aria-labelledby="crm-heading">
      <div className="staff-crm-header">
        <div>
          <p className="eyebrow">Staff CRM &middot; Pipeline Desk</p>
          <h1 id="crm-heading">Lead inbox</h1>
          <p className="staff-crm-lede">
            A verified operational record of client relationships, stage
            progression, and immediate follow-up tasks.
          </p>
        </div>
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

      <div className="staff-crm-grid">
        {/* Left Column: Lead Queue */}
        <aside className="staff-lead-sidebar">
          <div className="staff-lead-sidebar-header">
            <div className="staff-search-input-wrap">
              <Search
                className="h-4 w-4 text-muted shrink-0"
                aria-hidden="true"
              />
              <input
                className="staff-lead-search"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or stage..."
                type="search"
                value={searchQuery}
              />
            </div>
            <div className="staff-lead-count-badge">
              <span>{filteredLeads.length} leads</span>
            </div>
          </div>

          <ul className="staff-lead-list">
            {filteredLeads.map((lead) => {
              const isSelected = selected?.id === lead.id;
              return (
                <li key={lead.id}>
                  <Button
                    className={`staff-lead-item-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() => void open(lead.id)}
                    type="button"
                    variant="ghost"
                  >
                    <div className="staff-lead-item-top">
                      <strong className="staff-lead-item-name">
                        {lead.name ?? lead.email}
                      </strong>
                      <span
                        className={`staff-stage-pill stage-${lead.stage.toLowerCase()}`}
                      >
                        {lead.stage}
                      </span>
                    </div>
                    <div className="staff-lead-item-meta">
                      <span className="staff-intake-tag">
                        {lead.intakeType}
                      </span>
                      <span className="staff-lead-time">
                        {new Date(lead.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </Button>
                </li>
              );
            })}
            {!filteredLeads.length ? (
              <li className="staff-lead-empty-item">
                <p>No matching leads found.</p>
              </li>
            ) : null}
          </ul>
        </aside>

        {/* Right Column: Lead 360 Detail View */}
        {selected ? (
          <article className="staff-lead-detail">
            {/* Header */}
            <header className="staff-lead-heading">
              <div className="staff-lead-heading-title">
                <p className="eyebrow">
                  360 Lead Profile &middot; Record {selected.id.slice(0, 8)}
                </p>
                <h2>{selected.name ?? selected.email}</h2>
                <div className="staff-lead-header-badges">
                  <Badge variant="outline" className="staff-record-id">
                    Intake: {selected.intakeType}
                  </Badge>
                  <Badge
                    variant={getStageBadgeVariant(selected.stage)}
                    className="capitalize"
                  >
                    Stage: {selected.stage}
                  </Badge>
                  <span className="staff-pipeline-indicator">
                    Pipeline:{" "}
                    {selected.opportunities[0]?.pipeline ??
                      "Commercial Enterprise Pool"}
                  </span>
                </div>
              </div>
            </header>

            {/* Sensitive Customer Intelligence Card */}
            <section
              className="staff-sensitive"
              aria-labelledby="sensitive-heading"
            >
              <div className="staff-sensitive-header">
                <div className="staff-sensitive-icon-wrap" aria-hidden="true">
                  <Lock className="h-4 w-4 text-petrol" />
                </div>
                <div>
                  <h3 id="sensitive-heading">Sensitive Lead Intelligence</h3>
                  <p>
                    Confidential source data visible strictly to authorized
                    staff. These values cannot be modified directly in the CRM.
                  </p>
                </div>
              </div>
              <dl>
                <div>
                  <dt>
                    <Mail
                      className="h-3 w-3 inline mr-1 text-muted"
                      aria-hidden="true"
                    />
                    Email
                  </dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt>
                    <Phone
                      className="h-3 w-3 inline mr-1 text-muted"
                      aria-hidden="true"
                    />
                    Phone
                  </dt>
                  <dd>{selected.phone ?? "Not provided"}</dd>
                </div>
                <div className="full-span">
                  <dt>
                    <MessageSquare
                      className="h-3 w-3 inline mr-1 text-muted"
                      aria-hidden="true"
                    />
                    Original enquiry
                  </dt>
                  <dd>{selected.message ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt>
                    <Shield
                      className="h-3 w-3 inline mr-1 text-muted"
                      aria-hidden="true"
                    />
                    Consent recorded
                  </dt>
                  <dd>{formatDate(selected.consentAt)}</dd>
                </div>
              </dl>
            </section>

            {/* Suggested Procedures / Knowledge */}
            {suggestions.length ? (
              <section
                className="staff-knowledge-card"
                aria-labelledby="knowledge-suggestions-heading"
              >
                <div className="staff-section-header">
                  <Sparkles
                    className="h-4 w-4 text-solar shrink-0"
                    aria-hidden="true"
                  />
                  <h3 id="knowledge-suggestions-heading">
                    Suggested SOP &amp; Playbooks
                  </h3>
                </div>
                <ul className="staff-suggestion-list">
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <span className="staff-suggestion-title">
                        {item.title}
                      </span>
                      <Badge variant="secondary">{item.content_type}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Commercial Management Form */}
            <section
              className="staff-form-card"
              aria-labelledby="lead-controls-heading"
            >
              <div className="staff-section-header">
                <TrendingUp
                  className="h-4 w-4 text-petrol shrink-0"
                  aria-hidden="true"
                />
                <h3 id="lead-controls-heading">
                  Stage, Valuation &amp; Ownership
                </h3>
              </div>
              <form
                action={(form) => void update(form)}
                className="staff-lead-form-grid"
              >
                <Label>
                  Owner ID
                  <Input
                    defaultValue={selected.ownerId ?? ""}
                    name="ownerId"
                    placeholder="e.g. staff-user-1"
                  />
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
                  Probability (%)
                  <Input
                    defaultValue={selected.probability ?? 0}
                    max="100"
                    min="0"
                    name="probability"
                    type="number"
                  />
                </Label>
                <Label>
                  Estimated Value ($ USD)
                  <Input
                    defaultValue={selected.estimatedValue ?? ""}
                    min="0"
                    name="estimatedValue"
                    placeholder="45000"
                    type="number"
                  />
                </Label>
                <Label>
                  Next Scheduled Action
                  <Input
                    defaultValue={selected.nextActionAt?.slice(0, 16) ?? ""}
                    name="nextActionAt"
                    type="datetime-local"
                  />
                </Label>
                <Label>
                  Lost Reason (if applicable)
                  <Input
                    defaultValue={selected.lostReason ?? ""}
                    name="lostReason"
                    placeholder="Pricing, timing, competitor..."
                  />
                </Label>
                <div className="staff-form-actions full-span">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving changes..." : "Save lead properties"}
                  </Button>
                </div>
              </form>
            </section>

            {/* Follow-up Tasks */}
            <section
              className="staff-tasks-card"
              aria-labelledby="follow-up-heading"
            >
              <div className="staff-section-header">
                <CheckCircle2
                  className="h-4 w-4 text-petrol shrink-0"
                  aria-hidden="true"
                />
                <h3 id="follow-up-heading">Follow-up Tasks</h3>
              </div>
              <p className="staff-field-note">
                Action items required to keep the opportunity moving forward.
                Overdue items are automatically prioritized as high urgency.
              </p>
              <ul className="staff-task-list">
                {selected.tasks.map((item) => (
                  <li
                    key={item.id}
                    className={`staff-task-item ${item.isOverdue ? "is-overdue" : ""} ${item.status === "completed" ? "is-completed" : ""}`}
                  >
                    <div className="staff-task-info">
                      <strong className="staff-task-title">{item.title}</strong>
                      <div className="staff-task-tags">
                        <span
                          className={`staff-task-badge ${item.isOverdue ? "badge-overdue" : "badge-status"}`}
                        >
                          {item.status}
                        </span>
                        <span className="staff-task-priority">
                          {item.priority} priority
                        </span>
                        <span className="staff-task-due">
                          <Clock
                            className="h-3 w-3 inline mr-1 text-muted"
                            aria-hidden="true"
                          />
                          {item.due_at
                            ? `Due ${formatDate(item.due_at)}`
                            : "No due date"}
                        </span>
                      </div>
                    </div>
                    <div className="staff-task-action">
                      {item.status !== "completed" ? (
                        <Button
                          aria-label={`Complete ${item.title}`}
                          disabled={busyTask === item.id}
                          onClick={() => void completeTask(item.id)}
                          size="sm"
                          type="button"
                        >
                          {busyTask === item.id ? "Saving..." : "Mark Complete"}
                        </Button>
                      ) : (
                        <span
                          className="staff-task-completed-label"
                          aria-label="Completed"
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5 inline mr-1 text-emerald-600"
                            aria-hidden="true"
                          />
                          Completed {formatDate(item.completed_at)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
                {!selected.tasks.length ? (
                  <li className="staff-task-empty">
                    <span>
                      No active follow-up tasks. Add one below to ensure client
                      momentum.
                    </span>
                  </li>
                ) : null}
              </ul>

              {/* Add New Task Form */}
              <form
                action={(form) => void task(form)}
                className="staff-new-task-form"
              >
                <p className="staff-form-subtitle">Add follow-up task</p>
                <div className="staff-task-form-grid">
                  <Label className="title-field">
                    Task Title
                    <Input
                      name="title"
                      placeholder="e.g. Schedule discovery workshop"
                      required
                    />
                  </Label>
                  <Label>
                    Assignee ID
                    <Input name="assigneeId" placeholder="staff-1" />
                  </Label>
                  <Label>
                    Due Date &amp; Time
                    <Input name="dueAt" type="datetime-local" />
                  </Label>
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Create Task
                </Button>
              </form>
            </section>

            {/* Activity & Audit Timeline */}
            <section
              className="staff-timeline-card"
              aria-labelledby="timeline-heading"
            >
              <div className="staff-section-header">
                <Clock
                  className="h-4 w-4 text-petrol shrink-0"
                  aria-hidden="true"
                />
                <h3 id="timeline-heading">Activity &amp; Audit Timeline</h3>
              </div>
              <ol className="staff-timeline">
                {selected.timeline.map((item) => (
                  <li
                    key={`${item.kind}-${item.id}`}
                    className="staff-timeline-item"
                  >
                    <span className="staff-timeline-kind">{item.kind}</span>
                    <div className="staff-timeline-content">
                      <strong className="staff-timeline-title">
                        {item.title}
                      </strong>
                      <p className="staff-timeline-detail">
                        {item.detail ?? item.status ?? item.eventType}
                      </p>
                      <time
                        dateTime={String(item.occurredAt)}
                        className="staff-timeline-time"
                      >
                        {formatDate(String(item.occurredAt))}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Narrative Notes */}
            <section
              className="staff-notes-card"
              aria-labelledby="notes-heading"
            >
              <div className="staff-section-header">
                <MessageSquare
                  className="h-4 w-4 text-petrol shrink-0"
                  aria-hidden="true"
                />
                <h3 id="notes-heading">Narrative Notes &amp; Collaboration</h3>
              </div>
              <p className="staff-field-note">
                Append-only narrative log for team notes, call summaries, and
                deal context.
              </p>
              <ul className="staff-notes-list">
                {selected.notes.map((item) => (
                  <li key={item.id} className="staff-note-bubble">
                    <p className="staff-note-text">{item.body}</p>
                    <small className="staff-note-meta">
                      Logged {formatDate(item.created_at)}
                    </small>
                  </li>
                ))}
                {!selected.notes.length ? (
                  <li className="staff-notes-empty">
                    <span>No collaboration notes recorded yet.</span>
                  </li>
                ) : null}
              </ul>
              <form
                action={(form) => void note(form)}
                className="staff-note-form"
              >
                <Label>
                  Add narrative note
                  <Textarea
                    name="body"
                    placeholder="Log call minutes, client feedback, or proposal requirements..."
                    required
                    rows={3}
                  />
                </Label>
                <Button type="submit" variant="secondary" size="sm">
                  Add note
                </Button>
              </form>
            </section>
          </article>
        ) : (
          <div className="staff-empty-selection">
            <div className="staff-empty-selection-inner">
              <FileText
                className="h-10 w-10 text-muted mx-auto mb-3 opacity-40"
                aria-hidden="true"
              />
              <h3>Select a lead from the queue</h3>
              <p>
                Choose an intake record from the left sidebar to view its full
                360 intelligence profile, update stages, manage tasks, and
                record notes.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
