"use client";

import { useState, useCallback } from "react";
import { MathText } from "@/components/math-text";
import type { SolutionRecord } from "@/types/solution";

type SolutionPanelProps = {
  solution: SolutionRecord | null;
};

function containsFormula(detail: string) {
  return /\$\$.+?\$\$|\$.+?\$/.test(detail);
}

function advancePastFormulas(from: number, steps: SolutionRecord["steps"]) {
  let i = from;
  while (i < steps.length && containsFormula(steps[i].detail)) i++;
  return i;
}

export function SolutionPanel({ solution }: SolutionPanelProps) {
  const [revealMode, setRevealMode] = useState(false);
  const [revealedUpTo, setRevealedUpTo] = useState(1);

  const revealNext = useCallback(() => {
    if (!solution) return;
    setRevealedUpTo((prev) => {
      const next = Math.min(prev + 1, solution.steps.length);
      return advancePastFormulas(next, solution.steps);
    });
  }, [solution]);

  const revealAll = useCallback(() => {
    if (!solution) return;
    setRevealedUpTo(solution.steps.length);
  }, [solution]);

  if (!solution) {
    return (
      <div className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
        <div className="border-b border-[var(--ion-border-light)] px-4 py-3 sm:px-5 sm:py-3.5 dark:border-[var(--ion-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Solution</p>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-full animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="text-xs text-stone-400 dark:text-stone-500">Submit a problem to generate a solution.</p>
        </div>
      </div>
    );
  }

  const steps = solution.steps;
  const displayedSteps = revealMode ? steps.slice(0, revealedUpTo) : steps;
  const lastStep = steps[steps.length - 1];
  const hasFinalAnswer = lastStep?.heading?.toLowerCase().includes("final");
  const regularSteps = hasFinalAnswer ? steps.slice(0, -1) : steps;
  const finalStep = hasFinalAnswer ? lastStep : null;

  return (
    <div className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
      {/* Header */}
      <div className="border-b border-[var(--ion-border-light)] px-4 py-3 dark:border-[var(--ion-border)] sm:px-5 sm:py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Solution</p>
            <h2 className="mt-1 text-base font-semibold text-stone-950 dark:text-stone-100 leading-tight">{solution.title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
            {steps.length} steps
          </span>
        </div>
        <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">Saved {formatDate(solution.createdAt)}</p>
      </div>

      {/* Problem restatement */}
      <div className="border-b border-[var(--ion-border-light)] bg-stone-50 px-4 py-3 dark:border-[var(--ion-border)] dark:bg-stone-800/50 sm:px-5 sm:py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">Problem</p>
        <p className="mt-1 text-sm leading-6 text-stone-700 dark:text-stone-300 sm:text-base">
          <MathText text={solution.problem} />
        </p>
      </div>

      {/* Steps region */}
      <div className="divide-y divide-[var(--ion-border-light)] dark:divide-[var(--ion-border)]">
        {displayedSteps.map((step, index) => {
          const globalIndex = steps.indexOf(step);
          const staggerClass = `stagger-${Math.min(globalIndex + 1, 10)}`;
          return (
            <div
              key={`${solution.id}-${step.order}`}
              className={`flex gap-3 px-4 py-3.5 animate-fade-in-up ${staggerClass} sm:px-5 sm:py-4 ${
                step.heading?.toLowerCase().includes("check") || step.heading?.toLowerCase().includes("final")
                  ? "bg-stone-50 dark:bg-stone-800/30"
                  : ""
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                {step.order}
              </div>
              <div className="min-w-0 flex-1 break-words">
                {step.heading && (
                  <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-100 sm:text-base">{step.heading}</h3>
                )}
                <div className={step.heading ? "mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400 sm:text-base" : "text-sm leading-6 text-stone-600 dark:text-stone-400 sm:text-base"}>
                  <MathText text={step.detail} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reveal mode controls */}
      {revealMode && revealedUpTo < steps.length && (
        <div className="flex items-center justify-center gap-3 border-t border-[var(--ion-border-light)] px-4 py-4 dark:border-[var(--ion-border)]">
          <button
            type="button"
            onClick={revealNext}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-stone-800 active:scale-[0.97] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
          >
            Reveal step {revealedUpTo + 1}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button
            type="button"
            onClick={revealAll}
            className="flex min-h-[44px] items-center rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.97] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            Reveal all
          </button>
        </div>
      )}

      {/* Toggle reveal mode */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--ion-border-light)] px-4 py-2.5 dark:border-[var(--ion-border)] sm:px-5">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            {revealMode ? `Step ${revealedUpTo} of ${steps.length}` : `${steps.length} steps`}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = !revealMode;
              setRevealMode(next);
              if (next && solution) {
                const start = advancePastFormulas(0, solution.steps);
                setRevealedUpTo(start < solution.steps.length ? start : 1);
              } else if (solution) setRevealedUpTo(solution.steps.length);
            }}
            className="flex min-h-[44px] items-center rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.97] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            {revealMode ? "Show all" : "Reveal one at a time"}
          </button>
        </div>
      )}

      {/* Verification note */}
      <div className="rounded-b-xl border-t border-[var(--ion-border-light)] bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-800 dark:border-[var(--ion-border)] dark:bg-amber-900/20 dark:text-amber-300 sm:text-[11px]">
        AI-generated steps — always verify with your teacher or textbook before using in practice.
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  }).format(date);
}
