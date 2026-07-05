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

  async function generateVariant() {
    setLoading(true);
    try {
      const res = await fetch(`/api/solutions/${solutionId}/variants`, {
        method: "POST",
      });
      if (!res.ok) return;
      const { data } = await res.json();
      if (data?.steps) {
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
      >
        {loading ? "Generating..." : variants.length > 0 ? "Another variant" : "Alternative approach"}
      </button>

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
        <div className="flex gap-1.5">
          {variants.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveVariant(i)}
              className={`h-5 w-5 rounded-full text-[10px] font-medium transition-all ${
                activeVariant === i
                  ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                  : "bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-400"
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
