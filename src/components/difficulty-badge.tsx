"use client";

import { useState } from "react";

type DifficultyBadgeProps = {
  solutionId: number;
  difficulty: string | null;
  onChange: (id: number, difficulty: string | null) => void;
};

const LEVELS = ["easy", "medium", "hard"] as const;

export function DifficultyBadge({ solutionId, difficulty, onChange }: DifficultyBadgeProps) {
  const [open, setOpen] = useState(false);

  async function setLevel(level: string | null) {
    try {
      const res = await fetch(`/api/solutions/${solutionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: level }),
      });
      if (!res.ok) return;
      onChange(solutionId, level);
    } catch {
      // silent
    }
    setOpen(false);
  }

  const colorMap: Record<string, string> = {
    easy: "border-stone-400 text-stone-600 dark:border-stone-500 dark:text-stone-400",
    medium: "border-stone-600 text-stone-800 dark:border-stone-400 dark:text-stone-300",
    hard: "border-stone-950 text-stone-950 dark:border-white dark:text-white",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex min-h-[44px] items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
          difficulty
            ? colorMap[difficulty] ?? "border-stone-300 text-stone-500"
            : "border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500"
        }`}
      >
        {difficulty ?? "Set"}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-10 mt-1.5 flex gap-1 rounded-lg border border-stone-300 bg-white p-2 shadow-sm dark:border-stone-600 dark:bg-stone-800">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setLevel(level)}
              className={`flex min-h-[44px] items-center rounded-md px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all hover:bg-stone-100 active:scale-[0.97] dark:hover:bg-stone-700 ${
                difficulty === level ? "bg-stone-200 dark:bg-stone-700 dark:text-stone-100" : "dark:text-stone-400"
              }`}
            >
              {level}
            </button>
          ))}
          {difficulty && (
            <button
              type="button"
              onClick={() => setLevel(null)}
              className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm text-stone-400 transition-all hover:text-stone-600 active:scale-[0.97] dark:text-stone-500 dark:hover:text-stone-300"
              aria-label="Clear difficulty"
            >
              &times;
            </button>
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />}
    </div>
  );
}
