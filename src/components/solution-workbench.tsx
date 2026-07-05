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
import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
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

const LOADING_MESSAGES = [
  "Parsing problem...",
  "Identifying concepts...",
  "Building step 1...",
  "Applying formulas...",
  "Checking intermediate result...",
  "Building step 2...",
  "Verifying consistency...",
  "Building step 3...",
  "Finalizing answer...",
];

const EXAMPLE_PROBLEMS = [
  { label: "Derivative of x³·sin(x)", problem: "Find the derivative of f(x) = x^3 sin(x)" },
  { label: "Force & acceleration", problem: "A force of 10 N acts on a 2 kg mass. Find the acceleration." },
  { label: "Integral of x²", problem: "Evaluate the integral of x^2 from 0 to 3" },
];

let _weeklyCount = 0;
let _weeklyListeners: (() => void)[] = [];

if (typeof document !== "undefined") {
  try {
    const stored = localStorage.getItem("stepjee-weekly-count");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date && isSameWeek(new Date(parsed.date), new Date())) {
        _weeklyCount = parsed.count;
      } else {
        localStorage.removeItem("stepjee-weekly-count");
      }
    }
  } catch {}
}

function _notifyWeekly() {
  _weeklyListeners.forEach((l) => l());
}

const weeklyStore = {
  subscribe: (cb: () => void): (() => void) => {
    _weeklyListeners.push(cb);
    return () => {
      _weeklyListeners = _weeklyListeners.filter((l) => l !== cb);
    };
  },
  getSnapshot: (): number => {
    if (typeof document === "undefined") return 0;
    return _weeklyCount;
  },
  getServerSnapshot: (): number => 0,
};

function setWeeklyCount(value: number) {
  _weeklyCount = value;
  try {
    localStorage.setItem("stepjee-weekly-count", JSON.stringify({ date: new Date().toISOString(), count: value }));
  } catch {}
  _notifyWeekly();
}

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
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const weeklyCount = useSyncExternalStore(
    weeklyStore.subscribe,
    weeklyStore.getSnapshot,
    weeklyStore.getServerSnapshot,
  );

  const filteredSolutions = subjectFilter
    ? solutions.filter((s) => s.topic?.toLowerCase() === subjectFilter)
    : solutions;

  const prevSubmitting = useRef(isSubmitting);
  useEffect(() => {
    if (isSubmitting && !prevSubmitting.current) {
      setLoadingMessageIndex(0);
      loadingTimer.current = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);
    } else if (!isSubmitting && prevSubmitting.current) {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
      loadingTimer.current = null;
    }
    prevSubmitting.current = isSubmitting;
    return () => {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    };
  }, [isSubmitting]);

  const incrementWeeklyCount = useCallback(() => {
    setWeeklyCount(weeklyCount + 1);
  }, [weeklyCount]);

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
      incrementWeeklyCount();
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

  function handleExampleProblem(problemStr: string) {
    setProblem(problemStr);
  }

  const showEmptyState = !activeSolution && solutions.length === 0 && !isSubmitting;
  const currentTopic = activeSolution?.topic;
  const breadcrumbSubject = currentTopic
    ? ["physics", "maths", "chemistry"].find((s) => currentTopic.toLowerCase().includes(s)) ?? null
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      {activeSolution && breadcrumbSubject && (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <button
            type="button"
            onClick={() => { setActiveSolution(null); }}
            className="hover:text-stone-600 transition-colors dark:hover:text-stone-300"
          >
            All solutions
          </button>
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          <span className="text-stone-600 dark:text-stone-300 capitalize">{breadcrumbSubject}</span>
          {currentTopic && (
            <>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              <span className="truncate max-w-[120px] sm:max-w-[180px]" title={currentTopic}>{currentTopic}</span>
            </>
          )}
        </div>
      )}

      {/* Toolbar with search + actions */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar onSelect={(sol) => setActiveSolution(sol)} />
        </div>
        <RandomProblemButton onPick={handleRandomPick} />
        <DarkModeToggle />
      </div>

      {/* Weekly progress badge */}
      {weeklyCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-[var(--ion-shadow)] animate-fade-in dark:border-stone-700 dark:bg-stone-800">
          <svg className="h-4 w-4 text-stone-500 dark:text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span className="text-xs text-stone-600 dark:text-stone-400">
            <strong className="text-stone-950 dark:text-stone-100">{weeklyCount}</strong> problem{weeklyCount !== 1 ? "s" : ""} solved this week
          </span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4 sm:space-y-5">
          <ProblemInput value={problem} onChange={setProblem} onSubmit={handleSubmit} isLoading={isSubmitting} error={submitError} image={image} onImageChange={setImage} />

          {/* Loading overlay with rotating message */}
          {isSubmitting && (
            <div className="animate-fade-in rounded-xl border border-[var(--ion-border)] bg-white px-5 py-6 shadow-[var(--ion-shadow)] dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 animate-spin text-stone-500 dark:text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                </svg>
                <div>
                  <p className="text-sm font-medium text-stone-950 dark:text-stone-100">Generating solution</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 transition-all duration-300">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i <= Math.floor(loadingMessageIndex / 2)
                        ? "bg-stone-950 dark:bg-stone-100"
                        : "bg-stone-200 dark:bg-stone-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {showEmptyState && (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center dark:border-stone-600 dark:bg-stone-900">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                <svg className="h-6 w-6 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-stone-950 dark:text-stone-100">No problems yet</p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Paste a problem, type it, or upload an image to get started.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {EXAMPLE_PROBLEMS.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExampleProblem(ex.problem)}
                    className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
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
                className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-all active:scale-[0.97] ${
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
                  className="flex min-h-[44px] items-center rounded-md bg-red-700 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-red-800 active:scale-[0.97]"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex min-h-[44px] items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 active:scale-[0.97] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400"
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

function isSameWeek(a: Date, b: Date) {
  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const aStart = startOfWeek(a);
  const bStart = startOfWeek(b);
  return aStart.getTime() === bStart.getTime();
}
