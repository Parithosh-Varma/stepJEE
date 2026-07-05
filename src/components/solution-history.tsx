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
      <div className="flex items-center justify-between border-b border-[var(--ion-border-light)] px-5 py-3.5 dark:border-[var(--ion-border)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">History</p>
          <p className="mt-0.5 text-sm font-semibold text-stone-950 dark:text-stone-100">Recent solutions</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-600 transition-all hover:border-stone-400 hover:bg-stone-50 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:bg-stone-700"
        >
          {isRefreshing ? "Loading" : "Refresh"}
        </button>
      </div>

      {solutions.length === 0 ? (
        <div className="px-5 py-6 text-center text-xs text-stone-400 dark:text-stone-500">No saved solutions yet.</div>
      ) : (
        <div className="divide-y divide-[var(--ion-border-light)] dark:divide-[var(--ion-border)]">
          {solutions.map((solution) => {
            const isActive = solution.id === activeId;
            return (
              <div key={solution.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(solution)}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-all ${
                    isActive
                      ? "bg-stone-950 dark:bg-stone-100"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
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
                    <span className={`block text-[11px] mt-0.5 ${
                      isActive ? "text-white/60 dark:text-stone-950/60" : "text-stone-400 dark:text-stone-500"
                    }`}>
                      {solution.topic ?? "General"}
                      {solution.difficulty && ` · ${solution.difficulty}`}
                      {solution.bookmarked && " · ★"}
                    </span>
                  </div>

                  <svg className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-white/40 dark:text-stone-950/40" : "text-stone-300 dark:text-stone-600"
                  }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(solution.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-xs text-stone-300 opacity-0 transition-all hover:bg-stone-200 hover:text-stone-600 group-hover:opacity-100 dark:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                  title="Delete"
                >&times;</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
