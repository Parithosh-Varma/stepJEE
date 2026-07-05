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
    <div className="space-y-3 rounded-xl border border-[var(--ion-border)] bg-white p-5 shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">
        Check your answer
      </p>
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-stone-950 hover:text-stone-950 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-100 dark:hover:text-stone-100"
      >
        {loading ? "Checking..." : "Verify"}
      </button>
      {feedback && (
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
          {feedback}
        </div>
      )}
    </div>
  );
}
