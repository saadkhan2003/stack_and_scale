"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react";

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

const collectionConfig = {
  products: {
    label: "Product",
    icon: Package,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  services: {
    label: "Service",
    icon: Sparkles,
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  },
  projects: {
    label: "Work",
    icon: Briefcase,
    badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  },
  resources: {
    label: "Resource",
    icon: BookOpen,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  },
} as const;

export function SearchDialog({
  entries,
}: Readonly<{ entries: readonly SearchEntry[] }>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      // Cleanly blur trigger so no persistent green outline remains when closing with ESC or clicking outside
      requestAnimationFrame(() => {
        triggerRef.current?.blur();
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.classList.contains("search-trigger")
        ) {
          document.activeElement.blur();
        }
      });
    }
  };

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
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          ref={triggerRef}
          render={
            <Button
              className="search-trigger !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!border-white/25"
              size="sm"
              variant="outline"
            />
          }
        >
          <Search className="size-3.5 sm:hidden" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block">Ctrl K</kbd>
        </DialogTrigger>
        <DialogContent className="max-w-2xl gap-3 p-5 sm:max-w-2xl bg-[#0c0c0e] border border-white/10 text-zinc-100 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overscroll-contain">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-white tracking-tight">
              <Search className="size-4 text-[#80ddd1]" />
              Public site search
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Search Stack &amp; Scale&apos;s published products, services, case
              studies, and resources.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <Input
              id="public-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              className="pl-10 pr-8 h-11 bg-zinc-900/90 border-zinc-700/60 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-1 focus-visible:!ring-[#80ddd1]/40 focus-visible:!border-[#80ddd1]/60 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-lg transition-colors"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div
            className="search-results flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto mt-2 pr-1 overscroll-contain"
            role="list"
          >
            {results.map((entry) => {
              const config = collectionConfig[entry.collection] ?? {
                label: entry.collection,
                icon: Package,
                badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
              };
              const Icon = config.icon;

              return (
                <a
                  href={entry.href}
                  key={`${entry.collection}-${entry.id}`}
                  role="listitem"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between gap-3 p-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-800/70 hover:border-white/15 transition-colors duration-100 no-underline text-left focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shrink-0 mt-0.5">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate block">
                        {entry.title}
                      </strong>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 leading-normal">
                        {entry.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                    <ArrowUpRight className="size-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                  </div>
                </a>
              );
            })}
            {results.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-zinc-400">
                <Search className="size-8 text-zinc-600 mb-1" />
                <p className="text-sm font-medium text-zinc-300">
                  No published content matches &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-zinc-500">
                  Try searching for keywords like &ldquo;retail&rdquo;,
                  &ldquo;workflow&rdquo;, or &ldquo;service&rdquo;.
                </p>
              </div>
            ) : null}
          </div>
          <div className="pt-2.5 mt-1 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-400 text-[10px]">
                  ESC
                </kbd>
                close
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
