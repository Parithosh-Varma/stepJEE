"use client";

import { useState } from "react";

type VerificationProps = {
  solutionId: number;
  problem: string;
};

export function VerificationInput({ solutionId, problem }: VerificationProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, userAnswer }),
      });
      if (!res.ok) return;
      const { data } = await res.json();
      setFeedback(data.feedback);
    } catch {
      setFeedback("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-stone-200 bg-white p-4 shadow-[var(--ion-shadow)] dark:border-stone-700 dark:bg-stone-900 sm:p-5">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-400">
          Check your answer
        </p>
        <span className="ml-auto rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">Verification</span>
      </div>
      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Write your answer here..."
        rows={3}
        className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-950 outline-none transition-all placeholder:text-stone-400 focus:border-stone-950 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-stone-100"
      />
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || !userAnswer.trim()}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {loading ? "Checking..." : "Verify"}
      </button>
      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          {feedback}
        </div>
      )}
    </div>
  );
}
