import Link from "next/link";
import { SolutionWorkbench } from "@/components/solution-workbench";
import { getRecentSolutions } from "@/lib/steps-repository";
import type { SolutionRecord } from "@/types/solution";

export const dynamic = "force-dynamic";

export default async function HomePage(props: { searchParams?: Promise<{ problem?: string }> }) {
  const searchParams = await props.searchParams ?? {};
  const initialProblem = searchParams.problem ?? "";
  let initialSolutions: SolutionRecord[] = [];
  let initialLoadError: string | null = null;

  try {
    initialSolutions = await getRecentSolutions();
  } catch (error) {
    console.error("Initial solution load failed", error);
    initialLoadError = "Saved solutions could not be loaded yet.";
  }

  return (
    <main className="min-h-screen bg-stone-50 antialiased dark:bg-stone-950">
      <header className="border-b border-[var(--ion-border)] bg-white shadow-[var(--ion-shadow)] dark:bg-stone-900">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
              stepJEE
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/physics" className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">Physics</Link>
            <Link href="/maths" className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">Maths</Link>
            <Link href="/chemistry" className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100">Chemistry</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <SolutionWorkbench
          initialSolutions={initialSolutions}
          initialLoadError={initialLoadError}
          initialProblem={initialProblem}
        />
      </div>
    </main>
  );
}
