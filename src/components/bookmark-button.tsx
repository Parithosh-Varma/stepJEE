"use client";

type BookmarkButtonProps = {
  bookmarked: boolean;
  solutionId: number;
  onToggle: (id: number, newVal: boolean) => void;
};

export function BookmarkButton({ bookmarked, solutionId, onToggle }: BookmarkButtonProps) {
  async function handleClick() {
    try {
      const res = await fetch(`/api/solutions/${solutionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarked: true }),
      });
      if (!res.ok) return;
      const { data } = await res.json();
      onToggle(solutionId, data.bookmarked);
    } catch {
      // silent
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md text-sm transition-all hover:bg-stone-200 dark:hover:bg-stone-700 ${
        bookmarked ? "text-stone-950 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"
      }`}
      title={bookmarked ? "Unbookmark this solution" : "Bookmark this solution"}
      aria-label={bookmarked ? "Unbookmark this solution" : "Bookmark this solution"}
    >
      {bookmarked ? "\u2605" : "\u2606"}
    </button>
  );
}
