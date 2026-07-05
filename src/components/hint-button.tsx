"use client";

import { useState } from "react";

type HintButtonProps = {
  solutionId: number;
  totalSteps: number;
};

export function HintButton({ solutionId, totalSteps }: HintButtonProps) {
  const [hintIndex, setHintIndex] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  async function getNextHint() {
    if (exhausted || hintIndex >= totalSteps) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/solutions/${solutionId}/hint?index=${hintIndex}`);
      if (res.status === 404) {
        setExhausted(true);
        return;
      }
      if (!res.ok) return;
      const { data } = await res.json();
      setHint(data.hint);
      setHintIndex((i) => i + 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (exhausted) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={getNextHint}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
        title={hint ? "Show the next hint" : "Show a hint for this step"}
        aria-label={hint ? "Show next hint" : "Show hint"}
      >
        {loading ? "..." : hint ? "Next hint" : "Hint"}
      </button>
      {hint && (
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-700 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-300">
          {hint}
        </div>
      )}
    </div>
  );
}
