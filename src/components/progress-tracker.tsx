"use client";

import { useEffect, useState } from "react";

type TopicProgress = {
  subject: string;
  topic: string;
  practicedCount: number;
  confidence: number | null;
  lastPracticedAt: string;
};

type ProgressTrackerProps = {
  subject?: string;
};

export function ProgressTracker({ subject }: ProgressTrackerProps) {
  const [data, setData] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const url = subject ? `/api/topics/progress?subject=${encodeURIComponent(subject)}` : "/api/topics/progress";
    fetch(url)
      .then((r) => r.json())
      .then(({ data: d }) => { if (!cancelled) setData(d ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [subject]);

  if (loading) return <div className="h-4 w-full animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />;
  if (data.length === 0) return null;

  const totalPracticed = data.reduce((sum, p) => sum + p.practicedCount, 0);

  return (
    <div className="rounded-xl border border-[var(--ion-border)] bg-white p-4 shadow-[var(--ion-shadow)] dark:bg-stone-900 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Recent Progress</p>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">{totalPracticed} total</span>
      </div>
      <div className="space-y-1.5">
        {data.slice(0, 5).map((p) => (
          <div key={`${p.subject}-${p.topic}`} className="flex items-center justify-between gap-2 py-0.5">
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs text-stone-700 dark:text-stone-300">{p.topic}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 capitalize">{p.subject}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">{p.practicedCount}x</span>
              {p.confidence != null && p.confidence > 0 && (
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{Array(p.confidence).fill("\u25C9").join("")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
