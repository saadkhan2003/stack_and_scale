"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { SearchEntry } from "./public-search";

export function SearchDialog({
  entries,
}: Readonly<{ entries: readonly SearchEntry[] }>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionId = useId();
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
      <button
        aria-haspopup="dialog"
        className="search-trigger"
        onClick={() => setOpen(true)}
        type="button"
      >
        Search <kbd>Ctrl K</kbd>
      </button>
      {open ? (
        <div
          className="search-backdrop"
          onMouseDown={() => setOpen(false)}
          role="presentation"
        >
          <section
            aria-describedby={descriptionId}
            aria-label="Public site search"
            aria-modal="true"
            className="search-dialog"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="search-dialog-top">
              <label htmlFor="public-search">
                Search products, services, work and resources
              </label>
              <button onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>
            <p id={descriptionId}>
              Only published, public content is included.
            </p>
            <input
              id="public-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              ref={inputRef}
              type="search"
              value={query}
            />
            <div className="search-results" role="list">
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
          </section>
        </div>
      ) : null}
    </>
  );
}
