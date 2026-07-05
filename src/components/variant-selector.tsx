"use client";

import { useState } from "react";
import type { SolutionStep } from "@/types/solution";
import { MathText } from "./math-text";

type VariantSelectorProps = {
  solutionId: number;
  originalSteps: SolutionStep[];
};

export function VariantSelector({ solutionId, originalSteps }: VariantSelectorProps) {
  const [variants, setVariants] = useState<SolutionStep[][]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVariant, setActiveVariant] = useState<number | null>(null);
  const [sameApproach, setSameApproach] = useState(false);

  async function generateVariant() {
    setLoading(true);
    setSameApproach(false);
    try {
      const res = await fetch(`/api/solutions/${solutionId}/variants`, {
        method: "POST",
      });
      if (!res.ok) return;
      const { data } = await res.json();
      if (data?.sameApproach) {
        setSameApproach(true);
      } else if (data?.steps) {
        setVariants((prev) => [...prev, data.steps]);
        setActiveVariant(variants.length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generateVariant}
        disabled={loading}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 active:scale-[0.97] disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
      >
        {loading ? "Generating..." : variants.length > 0 ? "Another variant" : "Alternative approach"}
      </button>

      {sameApproach && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-5 py-4 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-400">
          This is the only way to solve this problem.
        </div>
      )}

      {activeVariant !== null && variants[activeVariant] && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400 mb-3">
            Variant {activeVariant + 1}
          </p>
          <ol className="space-y-3">
            {variants[activeVariant].map((step) => (
              <li key={step.order} className="text-sm leading-6 text-stone-700 dark:text-stone-300">
                <span className="font-medium text-stone-950 dark:text-stone-100">Step {step.order}: </span>
                <MathText text={step.detail} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {variants.length > 1 && (
        <div className="flex gap-2">
          {variants.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveVariant(i)}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-sm font-medium transition-all ${
                activeVariant === i
                  ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                  : "bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-400 dark:hover:bg-stone-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
