"use client";

import type { SolutionRecord } from "@/types/solution";

type SolutionHistoryProps = {
  solutions: SolutionRecord[];
  activeId: number | null;
  onSelect: (solution: SolutionRecord) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function SolutionHistory({ solutions, activeId, onSelect, onDelete, onRefresh, isRefreshing }: SolutionHistoryProps) {
  return (
    <div className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5 sm:py-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">History</p>
          <p className="mt-0.5 text-sm font-semibold text-stone-950 dark:text-stone-100">Recent solutions</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-400 hover:bg-stone-50 active:scale-[0.97] disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:bg-stone-700"
          title="Refresh solution list"
          aria-label="Refresh solution list"
        >
          {isRefreshing ? "Loading" : "Refresh"}
        </button>
      </div>

      {solutions.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-8 text-center">
          <svg className="mb-2 h-8 w-8 text-stone-300 dark:text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No saved solutions yet</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            Solutions you generate will appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--ion-border-light)] dark:divide-[var(--ion-border)]">
          {solutions.map((solution) => {
            const isActive = solution.id === activeId;
            return (
              <div key={solution.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(solution)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all sm:px-5 ${
                    isActive
                      ? "bg-stone-950 dark:bg-stone-100"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-950"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  }`}>
                    {solution.steps.length}
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium leading-5 ${
                      isActive ? "text-white dark:text-stone-950" : "text-stone-950 dark:text-stone-100"
                    }`}>
                      {solution.title}
                    </span>
                    <span className={`block text-xs mt-0.5 ${
                      isActive ? "text-white/60 dark:text-stone-950/60" : "text-stone-400 dark:text-stone-500"
                    }`}>
                      {solution.topic ?? "General"}
                      {solution.difficulty && ` · ${solution.difficulty}`}
                      {solution.bookmarked && " · ★"}
                    </span>
                  </div>

                  <svg className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-white/40 dark:text-stone-950/40" : "text-stone-300 dark:text-stone-600"
                  }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(solution.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-sm text-stone-300 opacity-70 transition-all hover:bg-stone-200 hover:text-stone-600 active:scale-90 sm:opacity-0 sm:group-hover:opacity-100 dark:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300 sm:right-3"
                  title="Delete this solution"
                  aria-label={`Delete solution: ${solution.title}`}
                >&times;</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
