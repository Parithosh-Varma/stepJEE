"use client";

import type { SolutionRecord } from "@/types/solution";
import type { FormEvent } from "react";
import { useState } from "react";
import { ProblemInput } from "./problem-input";
import { SolutionPanel } from "./solution-panel";
import { SolutionHistory } from "./solution-history";
import { SearchBar } from "./search-bar";
import { DarkModeToggle } from "./dark-mode-toggle";
import { RandomProblemButton } from "./random-problem-button";
import { BookmarkButton } from "./bookmark-button";
import { DifficultyBadge } from "./difficulty-badge";
import { HintButton } from "./hint-button";
import { ExportButton } from "./export-button";
import { ReferenceFormulas } from "./reference-formulas";
import { ProgressTracker } from "./progress-tracker";
import { VariantSelector } from "./variant-selector";
import { VerificationInput } from "./verification-input";

type TopicPageProps = {
  topic: string;
  subject: string;
  backHref: string;
  initialSolutions: SolutionRecord[];
};

export function TopicPage({ topic, subject, backHref, initialSolutions }: TopicPageProps) {
  const [problem, setProblem] = useState(topic);
  const [image, setImage] = useState<string | null>(null);
  const [solutions, setSolutions] = useState(initialSolutions);
  const [activeSolution, setActiveSolution] = useState<SolutionRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = problem.trim();

    if (trimmed.length < 3 && !image) {
      setSubmitError("Enter a problem or upload an image.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: trimmed, image, topic }),
      });
      const payload = await response.json() as { data?: SolutionRecord; error?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "The solution could not be generated.");
      }

      setActiveSolution(payload.data);
      setSolutions((current) => mergeSolutions(payload.data!, current));
      setProblem("");
      setImage(null);

      // Record progress
      fetch("/api/topics/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.toLowerCase(), topic }),
      }).catch(() => {});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong while generating the solution.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/solutions/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error ?? "Could not delete.");
      }
      setSolutions((current) => current.filter((s) => s.id !== id));
      setActiveSolution((current) => (current?.id === id ? null : current));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not delete solution.");
    }
  }

  async function refreshSolutions() {
    setIsRefreshing(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/solutions?topic=${encodeURIComponent(topic)}`, { method: "GET" });
      const payload = await response.json() as { data?: SolutionRecord[]; error?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Saved solutions could not be loaded.");
      }

      setSolutions(payload.data);
      setActiveSolution((current) => current ?? payload.data?.[0] ?? null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Saved solutions could not be loaded.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleBookmarkToggle(id: number, newVal: boolean) {
    setSolutions((current) => current.map((s) => (s.id === id ? { ...s, bookmarked: newVal } : s)));
    setActiveSolution((current) => (current?.id === id ? { ...current, bookmarked: newVal } : current));
  }

  function handleDifficultyChange(id: number, difficulty: string | null) {
    setSolutions((current) => current.map((s) => (s.id === id ? { ...s, difficulty } : s)));
    setActiveSolution((current) => (current?.id === id ? { ...current, difficulty } : current));
  }

  return (
    <main className="min-h-screen bg-stone-50 antialiased dark:bg-stone-950">
      <header className="border-b border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <a href={backHref} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {subject}
            </a>
            <span className="text-stone-200 dark:text-stone-700">|</span>
            <span className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">{topic}</span>
          </div>
          <div className="flex items-center gap-1">
            <RandomProblemButton onPick={(s, t, slug) => { window.location.href = `/${s.toLowerCase()}/${slug}`; }} />
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="mb-5">
          <h1 className="text-lg font-bold text-stone-950 dark:text-stone-100">{topic}</h1>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subject} topic</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <ProblemInput value={problem} onChange={setProblem} onSubmit={handleSubmit} isLoading={isSubmitting} error={submitError} image={image} onImageChange={setImage} />

            {activeSolution && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--ion-border)] bg-white px-4 py-2.5 shadow-[var(--ion-shadow)] dark:bg-stone-900">
                <BookmarkButton solutionId={activeSolution.id} bookmarked={activeSolution.bookmarked} onToggle={handleBookmarkToggle} />
                <DifficultyBadge solutionId={activeSolution.id} difficulty={activeSolution.difficulty ?? null} onChange={handleDifficultyChange} />
                <HintButton solutionId={activeSolution.id} totalSteps={activeSolution.steps.length} />
                <ExportButton solution={activeSolution} />
              </div>
            )}

            <SolutionPanel solution={activeSolution} />

            {activeSolution && (
              <>
                <VariantSelector solutionId={activeSolution.id} originalSteps={activeSolution.steps} />
                <VerificationInput solutionId={activeSolution.id} problem={activeSolution.problem} />
              </>
            )}
          </div>
          <div className="space-y-4">
            <SolutionHistory
              solutions={solutions}
              activeId={activeSolution?.id ?? null}
              onSelect={setActiveSolution}
              onDelete={handleDelete}
              onRefresh={refreshSolutions}
              isRefreshing={isRefreshing}
            />
            <ReferenceFormulas subject={subject.toLowerCase()} topic={topic} />
            <ProgressTracker subject={subject.toLowerCase()} />
          </div>
        </div>
      </div>
    </main>
  );
}

function mergeSolutions(next: SolutionRecord, current: SolutionRecord[]) {
  return [next, ...current.filter((solution) => solution.id !== next.id)].slice(0, 8);
}
