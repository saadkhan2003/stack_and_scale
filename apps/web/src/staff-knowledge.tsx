"use client";

import { useEffect, useState } from "react";
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

type Article = {
  id: string;
  title: string;
  content_type: string;
  body?: string;
  owner_id: string;
  review_at: string;
  status: string;
  allowed_roles?: string[];
  context_tags?: string[];
};
type ArticleForm = {
  title: string;
  contentType: string;
  body: string;
  ownerId: string;
  reviewAt: string;
  status: string;
  allowedRoles: string[];
  contextTags: string[];
};
const blank: ArticleForm = {
  title: "",
  contentType: "procedure",
  body: "",
  ownerId: "",
  reviewAt: "",
  status: "published",
  allowedRoles: ["owner", "admin", "manager", "member"],
  contextTags: [],
};

export function StaffKnowledge() {
  const [items, setItems] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState("Loading internal knowledge...");
  const load = async () => {
    const response = await fetch("/api/staff/operations/knowledge", {
      cache: "no-store",
    });
    if (!response.ok) {
      setNotice(
        response.status === 403
          ? "Knowledge access is restricted."
          : "Knowledge is unavailable.",
      );
      return;
    }
    const payload = (await response.json()) as { data: Article[] };
    setItems(payload.data);
    setNotice(payload.data.length ? "" : "No procedures have been added.");
  };
  useEffect(() => {
    void load();
  }, []);
  const open = async (id: string) => {
    const response = await fetch(
      `/api/staff/operations/knowledge/${encodeURIComponent(id)}`,
    );
    if (!response.ok) return;
    const article = ((await response.json()) as { data: Article }).data;
    setSelected(article);
    setForm({
      title: article.title,
      contentType: article.content_type,
      body: article.body ?? "",
      ownerId: article.owner_id,
      reviewAt: article.review_at.slice(0, 10),
      status: article.status,
      allowedRoles: article.allowed_roles ?? blank.allowedRoles,
      contextTags: article.context_tags ?? [],
    });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const path = selected
      ? `/api/staff/operations/knowledge/${encodeURIComponent(selected.id)}`
      : "/api/staff/operations/knowledge";
    const response = await fetch(path, {
      method: selected ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        ownerId: form.ownerId.trim() || undefined,
        reviewAt: new Date(`${form.reviewAt}T00:00:00Z`).toISOString(),
      }),
    });
    if (!response.ok) {
      setNotice("The article could not be saved.");
      playStaffCue("error");
      return;
    }
    setNotice("Article saved.");
    setSelected(null);
    setForm(blank);
    await load();
    playStaffCue("check");
  };
  const remove = async () => {
    if (!selected || !window.confirm("Delete this article?")) return;
    const response = await fetch(
      `/api/staff/operations/knowledge/${encodeURIComponent(selected.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setNotice("The article could not be deleted.");
      playStaffCue("error");
      return;
    }
    setNotice("Article deleted.");
    setSelected(null);
    setForm(blank);
    await load();
    playStaffCue("delete");
  };
  return (
    <section
      className="staff-crm staff-knowledge"
      aria-labelledby="knowledge-heading"
    >
      <p className="eyebrow">Staff operations</p>
      <h1 id="knowledge-heading">Knowledge and procedures</h1>
      <p className="staff-crm-lede">
        Internal procedures, scripts, FAQs, and onboarding material with
        accountable review dates.
      </p>
      {notice ? <p role="status">{notice}</p> : null}
      <div className="staff-knowledge-grid">
        <div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm({
                ...blank,
                reviewAt: new Date(Date.now() + 90 * 86400000)
                  .toISOString()
                  .slice(0, 10),
              });
            }}
            type="button"
          >
            New article
          </Button>
          <ul className="staff-knowledge-list">
            {items.map((item) => (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => void open(item.id)}
                  type="button"
                >
                  <strong>{item.title}</strong>
                  <span>
                    {item.content_type} · review{" "}
                    {new Date(item.review_at).toLocaleDateString()}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <form
          className="staff-knowledge-form"
          onSubmit={(event) => void save(event)}
        >
          <h2>{selected ? "Edit article" : "Create article"}</h2>
          <Label>
            Title
            <Input
              required
              maxLength={200}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </Label>
          <Label>
            Type
            <Select
              value={form.contentType}
              onValueChange={(value) =>
                setForm({ ...form, contentType: value ?? "procedure" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="procedure">Procedure</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="faq">FAQ</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
              </SelectContent>
            </Select>
          </Label>
          <Label>
            Owner ID
            <Input
              maxLength={200}
              placeholder="Leave blank to assign yourself"
              value={form.ownerId}
              onChange={(event) =>
                setForm({ ...form, ownerId: event.target.value })
              }
            />
          </Label>
          <Label>
            Review date
            <Input
              required
              type="date"
              value={form.reviewAt}
              onChange={(event) =>
                setForm({ ...form, reviewAt: event.target.value })
              }
            />
          </Label>
          <Label>
            Status
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value ?? "published" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Label>
          <Label>
            Visible roles (comma separated)
            <Input
              value={form.allowedRoles.join(", ")}
              onChange={(event) =>
                setForm({
                  ...form,
                  allowedRoles: event.target.value
                    .split(",")
                    .map((item) => item.trim().toLowerCase())
                    .filter(Boolean),
                })
              }
            />
          </Label>
          <Label>
            Context tags (comma separated)
            <Input
              value={form.contextTags.join(", ")}
              onChange={(event) =>
                setForm({
                  ...form,
                  contextTags: event.target.value
                    .split(",")
                    .map((item) => item.trim().toLowerCase())
                    .filter(Boolean),
                })
              }
            />
          </Label>
          <Label>
            Body
            <Textarea
              required
              maxLength={20000}
              rows={12}
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
            />
          </Label>
          <Button type="submit">Save article</Button>
          {selected ? (
            <Button
              variant="destructive"
              onClick={() => void remove()}
              type="button"
            >
              Delete article
            </Button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
