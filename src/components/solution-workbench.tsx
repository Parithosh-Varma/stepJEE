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
};

export function SolutionWorkbench({ initialSolutions, initialLoadError = null, initialProblem = "" }: SolutionWorkbenchProps) {
  const router = useRouter();
  const [problem, setProblem] = useState(initialProblem);
  const [image, setImage] = useState<string | null>(null);
  const [solutions, setSolutions] = useState(initialSolutions);
  const [activeSolution, setActiveSolution] = useState<SolutionRecord | null>(initialSolutions[0] ?? null);
  const [submitError, setSubmitError] = useState<string | null>(initialLoadError);
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
        body: JSON.stringify({ problem: trimmed, image }),
      });
      const payload = await response.json() as { data?: SolutionRecord; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Failed to generate.");
      setActiveSolution(payload.data);
      setSolutions((current) => mergeSolutions(payload.data!, current));
      setProblem("");
      setImage(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
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

  return (
    <div className="space-y-5">
      {/* Toolbar with search + actions */}
      <div className="ion-toolbar flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar onSelect={(sol) => setActiveSolution(sol)} />
        </div>
        <RandomProblemButton onPick={handleRandomPick} />
        <DarkModeToggle />
      </div>

      {/* Two-column layout */}
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
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
}

function mergeSolutions(next: SolutionRecord, current: SolutionRecord[]) {
  return [next, ...current.filter((solution) => solution.id !== next.id)].slice(0, 8);
}
