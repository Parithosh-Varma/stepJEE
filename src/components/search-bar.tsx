"use client";

import { useState, useCallback, useRef } from "react";
import type { SolutionRecord } from "@/types/solution";

type SearchBarProps = {
  onSelect: (solution: SolutionRecord) => void;
};

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SolutionRecord[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined as unknown as ReturnType<typeof setTimeout>);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/solutions/search?q=${encodeURIComponent(value)}`);
        if (!res.ok) return;
        const { data } = await res.json();
        setResults(data ?? []);
        setOpen(true);
      } catch { /* silent */ }
    }, 300);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search solutions"
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-950 outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:shadow-[var(--ion-shadow)] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500"
          >&times;</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
          {results.map((sol) => (
            <button
              key={sol.id}
              type="button"
              onClick={() => { onSelect(sol); setOpen(false); setQuery(""); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-stone-50 dark:hover:bg-stone-700/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500 dark:bg-stone-700 dark:text-stone-400">
                {sol.steps.length}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-stone-950 dark:text-stone-100">{sol.title}</span>
                <span className="block text-[11px] text-stone-400 dark:text-stone-500">{sol.topic ?? "General"}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1.5 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-400 shadow-lg dark:border-stone-700 dark:bg-stone-800 dark:text-stone-500">
          No results
        </div>
      )}

      {open && <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setResults([]); }} />}
    </div>
  );
}
