"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { SearchEntry } from "./public-search";

export function SearchDialog({
  entries,
}: Readonly<{ entries: readonly SearchEntry[] }>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const words = query.trim().toLocaleLowerCase();
    return words.length === 0
      ? entries
      : entries.filter((entry) =>
          `${entry.title} ${entry.summary} ${entry.collection}`
            .toLocaleLowerCase()
            .includes(words),
        );
  }, [entries, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLocaleLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button className="search-trigger" size="sm" variant="outline" />
          }
        >
          Search <kbd>Ctrl K</kbd>
        </DialogTrigger>
        <DialogContent className="max-w-2xl gap-3 p-5 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Stack &amp; Scale</DialogTitle>
            <DialogDescription>
              Only published, public content is included.
            </DialogDescription>
          </DialogHeader>
          <Input
            id="public-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for?"
            ref={inputRef}
            type="search"
            value={query}
          />
          <div className="search-results max-h-[50vh]" role="list">
              {results.map((entry) => (
                <a
                  href={entry.href}
                  key={`${entry.collection}-${entry.id}`}
                  role="listitem"
                  onClick={() => setOpen(false)}
                >
                  <span>
                    {entry.collection === "projects"
                      ? "work"
                      : entry.collection}
                  </span>
                  <strong>{entry.title}</strong>
                  <small>{entry.summary}</small>
                </a>
              ))}
              {results.length === 0 ? (
                <p>No published content matches that search.</p>
              ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
