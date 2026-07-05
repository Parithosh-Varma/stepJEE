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
        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-all ${
          difficulty
            ? colorMap[difficulty] ?? "border-stone-300 text-stone-500"
            : "border-stone-300 text-stone-400 dark:border-stone-600 dark:text-stone-500"
        }`}
      >
        {difficulty ?? "set"}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-lg border border-stone-300 bg-white p-1.5 shadow-sm dark:border-stone-600 dark:bg-stone-800">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setLevel(level)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-all hover:bg-stone-100 dark:hover:bg-stone-700 ${
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
              className="rounded-md px-2 py-1 text-[11px] text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
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
