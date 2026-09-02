"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { PublicEntry } from "./public-content";

export function ProductCatalog({
  entries,
}: Readonly<{ entries: readonly PublicEntry[] }>) {
  const [query, setQuery] = useState("");
  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery.length === 0
      ? entries
      : entries.filter((entry) =>
          `${entry.title} ${entry.summary}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        );
  }, [entries, query]);

  return (
    <>
      <Label className="catalog-filter">
        <span>Find a product</span>
        <Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          type="search"
          value={query}
        />
      </Label>
      <div className="content-grid product-catalog" aria-live="polite">
        {visibleEntries.map((entry) => (
          <article className="content-card" key={entry.id}>
            <p className="eyebrow">{entry.label}</p>
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            <a className="text-link" href={`/products/${entry.slug}`}>
              Explore product <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
        {visibleEntries.length === 0 ? (
          <p className="empty-catalog">
            No product matches that search.{" "}
            <Button onClick={() => setQuery("")} size="sm" type="button" variant="link">
              Clear search
            </Button>
          </p>
        ) : null}
      </div>
    </>
  );
}
