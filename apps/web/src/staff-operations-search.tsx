"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { playStaffCue } from "./staff-sfx";

type SearchResult = {
  id: string;
  resource_type: "lead" | "task" | "content" | "document";
  title: string;
  excerpt: string | null;
  created_at: string;
};

export function StaffOperationsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [notice, setNotice] = useState(
    "Search is limited to records your staff role may access.",
  );
  const [busy, setBusy] = useState(false);

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setNotice("Enter at least two characters.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        `/api/staff/operations/search?q=${encodeURIComponent(query.trim())}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        setResults([]);
        setNotice(
          response.status === 403
            ? "Search is restricted for this staff role."
            : "Search is temporarily unavailable.",
        );
        playStaffCue("error");
        return;
      }
      const payload = (await response.json()) as { data: SearchResult[] };
      setResults(payload.data);
      setNotice(
        payload.data.length
          ? `${payload.data.length} permitted result${payload.data.length === 1 ? "" : "s"}.`
          : "No permitted matches.",
      );
      playStaffCue("select");
    } catch {
      setResults([]);
      setNotice("Search is temporarily unavailable.");
      playStaffCue("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="staff-crm staff-operations-search"
      aria-labelledby="operations-search-heading"
    >
      <p className="eyebrow">Staff operations</p>
      <h1 id="operations-search-heading">Find an operational record</h1>
      <p className="staff-crm-lede">
        Results are authorization-filtered before they leave the API.
      </p>
      <form
        className="staff-search-form"
        onSubmit={(event) => void search(event)}
      >
        <Label htmlFor="operations-query">
          Search leads, tasks, content, or documents
        </Label>
        <div>
          <Input
            id="operations-query"
            maxLength={100}
            minLength={2}
            onChange={(event) => setQuery(event.target.value)}
            required
            type="search"
            value={query}
          />
          <Button
            disabled={busy}
            type="submit"
          >
            {busy ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
      <p aria-live="polite" role="status">
        {notice}
      </p>
      <ul className="staff-search-records">
        {results.map((result) => (
          <li key={`${result.resource_type}-${result.id}`}>
            <Badge className="staff-record-id" variant="outline">{result.resource_type}</Badge>
            <strong>{result.title}</strong>
            {result.excerpt ? <small>{result.excerpt}</small> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
