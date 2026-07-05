import { MathText } from "@/components/math-text";
import type { SolutionRecord } from "@/types/solution";

type SolutionPanelProps = {
  solution: SolutionRecord | null;
};

export function SolutionPanel({ solution }: SolutionPanelProps) {
  if (!solution) {
    return (
      <div className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
        <div className="border-b border-[var(--ion-border-light)] px-5 py-3.5 dark:border-[var(--ion-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Solution</p>
        </div>
        <div className="space-y-3 p-5">
          <div className="h-3 w-24 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-full rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-5/6 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="px-5 pb-5">
          <p className="text-xs text-stone-400 dark:text-stone-500">Submit a problem to generate a solution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
      <div className="border-b border-[var(--ion-border-light)] px-5 py-3.5 dark:border-[var(--ion-border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 dark:text-stone-400">Solution</p>
            <h2 className="mt-1 text-base font-semibold text-stone-950 dark:text-stone-100 truncate">{solution.title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
            {solution.steps.length} steps
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">Saved {formatDate(solution.createdAt)}</p>
      </div>

      <div className="divide-y divide-[var(--ion-border-light)] dark:divide-[var(--ion-border)]">
        {solution.steps.map((step) => (
          <div key={`${solution.id}-${step.order}`} className="flex gap-3 px-5 py-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
              {step.order}
            </div>
            <div className="min-w-0">
              {step.heading && (
                <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-100">{step.heading}</h3>
              )}
              <div className={step.heading ? "mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400" : "text-sm leading-6 text-stone-600 dark:text-stone-400"}>
                <MathText text={step.detail} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  }).format(date);
}
