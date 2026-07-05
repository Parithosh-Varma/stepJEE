"use client";

import { ProblemInput } from "@/components/problem-input";
import { SolutionHistory } from "@/components/solution-history";
import { SolutionPanel } from "@/components/solution-panel";
import { SearchBar } from "@/components/search-bar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { RandomProblemButton } from "@/components/random-problem-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { HintButton } from "@/components/hint-button";
import { ExportButton } from "@/components/export-button";
import { ProgressTracker } from "@/components/progress-tracker";
import { VariantSelector } from "@/components/variant-selector";
import { VerificationInput } from "@/components/verification-input";
import type { SolutionRecord } from "@/types/solution";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SolutionWorkbenchProps = {
  initialSolutions: SolutionRecord[];
  initialLoadError?: string | null;
  initialProblem?: string;
  topic?: string;
};

const SUBJECT_TABS = [
  { label: "All", value: undefined },
  { label: "Physics", value: "physics" },
  { label: "Maths", value: "maths" },
  { label: "Chemistry", value: "chemistry" },
] as const;

export function SolutionWorkbench({ initialSolutions, initialLoadError = null, initialProblem = "", topic }: SolutionWorkbenchProps) {
  const router = useRouter();
  const [problem, setProblem] = useState(initialProblem);
  const [image, setImage] = useState<string | null>(null);
  const [solutions, setSolutions] = useState(initialSolutions);
  const [activeSolution, setActiveSolution] = useState<SolutionRecord | null>(initialSolutions[0] ?? null);
  const [submitError, setSubmitError] = useState<string | null>(initialLoadError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);

  const filteredSolutions = subjectFilter
    ? solutions.filter((s) => s.topic?.toLowerCase() === subjectFilter)
    : solutions;

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
        body: JSON.stringify({ problem: trimmed, image, topic: topic ?? undefined }),
      });
      const payload = await response.json() as { data?: SolutionRecord; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Failed to generate.");
      setActiveSolution(payload.data);
      setSolutions((current) => mergeSolutions(payload.data!, current));
      setProblem("");
      setImage(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      if (msg.toLowerCase().includes("image") || msg.toLowerCase().includes("read") || msg.toLowerCase().includes("blurry")) {
        setSubmitError("Couldn't read the problem from the image. Try re-uploading or typing it instead.");
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/solutions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setSolutions((current) => current.filter((s) => s.id !== id));
      setActiveSolution((current) => (current?.id === id ? null : current));
      setDeleteConfirm(null);
    } catch { /* silent */ }
  }

  async function refreshSolutions() {
    setIsRefreshing(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/solutions", { method: "GET" });
      const payload = await response.json() as { data?: SolutionRecord[]; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Failed to load.");
      setSolutions(payload.data);
      setActiveSolution((current) => current ?? payload.data?.[0] ?? null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not load solutions.");
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

  function handleRandomPick(_subject: string, _topic: string, slug: string) {
    router.push(`/${_subject.toLowerCase()}/${slug}`);
  }

  function requestDelete(id: number) {
    setDeleteConfirm(id);
    setTimeout(() => setDeleteConfirm(null), 4000);
  }

  const showEmptyState = !activeSolution && solutions.length === 0 && !isSubmitting;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Toolbar with search + actions */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar onSelect={(sol) => setActiveSolution(sol)} />
        </div>
        <RandomProblemButton onPick={handleRandomPick} />
        <DarkModeToggle />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4 sm:space-y-5">
          <ProblemInput value={problem} onChange={setProblem} onSubmit={handleSubmit} isLoading={isSubmitting} error={submitError} image={image} onImageChange={setImage} />

          {showEmptyState && (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center dark:border-stone-600 dark:bg-stone-900">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                <svg className="h-6 w-6 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-stone-950 dark:text-stone-100">No problems yet</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Paste a problem, type it, or upload an image to get started.</p>
            </div>
          )}

          {activeSolution && (
            <>
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--ion-border)] bg-white px-3 py-2 shadow-[var(--ion-shadow)] dark:bg-stone-900 sm:gap-2 sm:px-4 sm:py-2.5">
                <BookmarkButton solutionId={activeSolution.id} bookmarked={activeSolution.bookmarked} onToggle={handleBookmarkToggle} />
                <DifficultyBadge solutionId={activeSolution.id} difficulty={activeSolution.difficulty ?? null} onChange={handleDifficultyChange} />
                <HintButton solutionId={activeSolution.id} totalSteps={activeSolution.steps.length} />
                <ExportButton solution={activeSolution} />
              </div>

              <SolutionPanel solution={activeSolution} />

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                AI-generated steps — always verify with your teacher or textbook before using in practice.
              </div>

              <VariantSelector solutionId={activeSolution.id} originalSteps={activeSolution.steps} />
              <VerificationInput solutionId={activeSolution.id} problem={activeSolution.problem} />
            </>
          )}
        </div>

        <div className="space-y-4">
          {/* Subject filter tabs */}
          <div className="flex gap-1 rounded-xl border border-[var(--ion-border)] bg-white p-1 shadow-[var(--ion-shadow)] dark:bg-stone-900">
            {SUBJECT_TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSubjectFilter(tab.value)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition-all ${
                  subjectFilter === tab.value
                    ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {deleteConfirm !== null && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Delete this solution?</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-md bg-red-700 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-800"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-md border border-stone-300 bg-white px-3 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <SolutionHistory
            solutions={filteredSolutions}
            activeId={activeSolution?.id ?? null}
            onSelect={setActiveSolution}
            onDelete={requestDelete}
            onRefresh={refreshSolutions}
            isRefreshing={isRefreshing}
          />
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
}

function mergeSolutions(next: SolutionRecord, current: SolutionRecord[]) {
  return [next, ...current.filter((solution) => solution.id !== next.id)].slice(0, 8);
}
