import Link from "next/link";
import { CHEMISTRY_TOPICS, topicSlug } from "@/lib/topics";

export default function ChemistryPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950 antialiased dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </Link>
            <span className="text-stone-200 dark:text-stone-700">|</span>
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Chemistry</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5">
          <h1 className="text-lg font-bold text-stone-950 dark:text-stone-100">Chemistry Topics</h1>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">46 JEE syllabus topics</p>
        </header>

        <div className="grid gap-2 sm:grid-cols-2">
          {CHEMISTRY_TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/chemistry/${topicSlug(topic)}`}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-700 shadow-[var(--ion-shadow)] transition-all hover:border-stone-400 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-stone-100"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                {topic.charAt(0)}
              </span>
              <span className="truncate">{topic}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
